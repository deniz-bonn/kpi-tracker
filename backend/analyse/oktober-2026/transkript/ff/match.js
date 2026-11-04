const K = '/private/tmp/claude-501/-Users-denizakpinar-Desktop-Claude-Code-Test/98dcf60b-0ec9-4b71-ba14-2b062fa68231/scratchpad/kotaman';
const E = require(K + '/engine.js'); const { out } = require(K + '/leads.json');
const doms = require('./lead_domains.json'); const kl = require('./klassen.json'); const fs = require('fs');
const BER = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });
const meta = Object.fromEntries(require('./meta.json').map(x => [x.id, x]));
const dayDiff = (a, b) => Math.abs(Math.round((new Date(a + 'T12:00:00Z') - new Date(b + 'T12:00:00Z')) / 864e5));
const STOP = new Set(['gmbh', 'co', 'kg', 'ag', 'mbh', 'ug', 'ek', 'e', 'k', 'und', 'the', 'group', 'holding', 'gruppe', 'hioffice', 'cloud', 'einstellungsgarantie', 'deutschland', 'service', 'services', 'verwaltung', 'beteiligungs', 'ohg', 'gbr', 'der', 'die', 'das', 'von', 'mit', 'bei']);
const toks = s => (s || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(t => t.length >= 3 && !STOP.has(t));
const nameMatch = (a, b) => { const A = new Set(toks(a)), B = new Set(toks(b)); if (!A.size || !B.size) return 0; let c = 0; for (const t of A) if (B.has(t)) c++; return c / Math.min(A.size, B.size); };
// Close-Seite: je Lead SC-Termine (Aufgaben "SC", Berlin-Datum) + Closing-Termine (SC Terminiert)
const leads = {};
for (const [id, d] of Object.entries(doms)) { const l = out[id]; if (!l) continue;
  leads[id] = { id, name: d.name, domains: d.domains || [], scDates: l.tasks.filter(t => /^\s*sc\b/i.test(t.text || '') && t.date).map(t => E.ymd(t.date)), termine: [] }; }
for (const t of E.TERMINE) if (t.art === 'closing' && t.am >= '2026-09-25') { const L = leads[t.opp.o.lead_id]; if (L) L.termine.push(t); }
const dm = (a, b) => a === b || a.endsWith('.' + b) || b.endsWith('.' + a);
const ffs = kl.filter(r => r.klasse === 'SC' || (r.klasse === 'Zweifel' && r.host === 't.boettcher' && r.ext > 0 && !/willkommen/i.test(r.titel)));
const res = [];
for (const f of ffs) { const cands = [];
  const titleName = /einstellungsgarantie/i.test(f.titel) ? '' : f.titel.replace(/^hioffice\s*(cloud)?\s*[-–|]\s*/i, '');
  for (const L of Object.values(leads)) {
    const dom = f.extDomains.some(d => L.domains.some(x => dm(d, x)));
    const nm = titleName ? nameMatch(titleName, L.name) : 0;
    const dd = L.scDates.length ? Math.min(...L.scDates.map(x => dayDiff(x, f.datum))) : 99;
    const dd2 = L.termine.length ? Math.min(...L.termine.map(t => t.ausgangAm ? dayDiff(t.ausgangAm, f.datum) : 99)) : 99;
    const datum = dd <= 1 ? 'SC-Aufgabe' : dd2 <= 1 ? 'SC-Ausgang' : null;
    if (!dom && nm < 0.6) continue;
    cands.push({ L, dom, nm, datum, score: (dom ? 3 : 0) + (nm >= 0.6 ? 2 : 0) + (datum ? 2 : 0) });
  }
  cands.sort((a, b) => b.score - a.score);
  const best = cands[0], second = cands[1];
  let stufe = 'keine'; if (best) stufe = best.datum ? 'sicher' : 'wahrscheinlich (Datum weicht ab)';
  if (best && second && second.score === best.score && second.L.id !== best.L.id) stufe = 'mehrdeutig';
  res.push({ ff: f, stufe, grund: best ? [best.dom ? 'Domain' : '', best.nm >= 0.6 ? 'Name' : '', best.datum || ''].filter(Boolean).join('+') : '', leadId: best && best.L.id, leadName: best && best.L.name, n: cands.length,
    closer: best && best.L.termine.length ? [...new Set(best.L.termine.map(t => E.closerVon(t).name).filter(Boolean))] : [] });
}
const c = k => res.filter(r => r.stufe.startsWith(k)).length;
console.log('Fireflies-Kandidaten (SC + Tobias-Zweifel):', res.length, '| sicher', c('sicher'), '| wahrscheinlich', c('wahrscheinlich'), '| mehrdeutig', c('mehrdeutig'), '| keine', c('keine'));
for (const typ of ['Einstellungsgarantie', 'Firmenname']) { const r = res.filter(x => (/einstellungsgarantie/i.test(x.ff.titel)) === (typ === 'Einstellungsgarantie')); console.log(' ', typ, r.length, '-> sicher', r.filter(x => x.stufe === 'sicher').length, '| wahrsch.', r.filter(x => x.stufe.startsWith('wahr')).length, '| mehrdeutig', r.filter(x => x.stufe === 'mehrdeutig').length, '| keine', r.filter(x => x.stufe === 'keine').length); }
const grund = {}; for (const r of res.filter(r => r.stufe === 'sicher')) grund[r.grund] = (grund[r.grund] || 0) + 1; console.log('Zuordnungsgrund (sicher):', JSON.stringify(grund));
// Close-Seite: Oktober-SC (Ausgang im Oktober oder offen+gelegt im Oktober), je Closer, mit/ohne Fireflies
const okt = x => !!x && x.startsWith('2026-10');
const belegt = new Set(res.filter(r => r.stufe === 'sicher' || r.stufe.startsWith('wahr')).map(r => r.leadId));
const proC = {};
for (const t of E.TERMINE) { if (t.art !== 'closing') continue; if (!((t.ausgang !== 'offen' && okt(t.ausgangAm)) || (t.ausgang === 'offen' && okt(t.am)))) continue;
  const n = E.closerVon(t).name || '(unbekannt)'; const P = proC[n] ||= { alle: 0, statt: 0, mitFF: 0, stattMitFF: 0 };
  P.alle++; const hat = belegt.has(t.opp.o.lead_id); if (hat) P.mitFF++; if (t.ausgang === 'stattgefunden') { P.statt++; if (hat) P.stattMitFF++; } }
console.log('\nClose-SC im Oktober je Closer (alle | stattgefunden) und davon mit Fireflies-Aufnahme:');
for (const [n, P] of Object.entries(proC).sort((a, b) => b[1].alle - a[1].alle)) console.log('  ', n.padEnd(18), String(P.alle).padStart(3), '|', String(P.statt).padStart(3), '-> mit Fireflies', P.mitFF, '| stattgefundene mit Fireflies', P.stattMitFF, '(' + Math.round(100 * P.stattMitFF / Math.max(1, P.statt)) + ' %)');
const lc = {}; for (const r of res.filter(r => r.stufe === 'sicher')) for (const n of r.closer) lc[n] = (lc[n] || 0) + 1; console.log('\nClose-Closer der zugeordneten FF-Meetings:', JSON.stringify(lc));
console.log('Mehrere FF-Meetings je Lead:', Object.entries(res.filter(r => r.leadId && r.stufe !== 'keine').reduce((m, r) => (m[r.leadId] = (m[r.leadId] || 0) + 1, m), {})).filter(e => e[1] > 1).length);
console.log('\nOhne Zuordnung (Datum | Dauer | Teilnehmer ext/int | Titeltyp):');
for (const r of res.filter(r => r.stufe === 'keine' || r.stufe === 'mehrdeutig')) console.log('  ', r.ff.datum, String(r.ff.min).padStart(3) + 'min', 'ext', r.ff.ext, 'int', r.ff.intern, '|', /einstellungsgarantie/i.test(r.ff.titel) ? 'Einstellungsgarantie' : 'Firma: ' + r.ff.titel.slice(0, 45), '|', r.stufe, r.ff.extDomains.join(','));
fs.writeFileSync(__dirname + '/zuordnung.json', JSON.stringify(res.map(r => ({ ffId: r.ff.id, datum: r.ff.datum, min: r.ff.min, host: r.ff.host, stufe: r.stufe, grund: r.grund, leadId: r.leadId || null, closerClose: r.closer }))));
