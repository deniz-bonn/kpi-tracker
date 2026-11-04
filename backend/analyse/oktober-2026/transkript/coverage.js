// Warum fehlt die Aufnahme? Je stattgefundenem Oktober-SC von Julius/Tobias ohne Fireflies-Treffer: Datum + vermutete Ursache aus Close/Fireflies.
const L = require('./lib'); const E = L.E; const fs = require('fs');
const K = '/private/tmp/claude-501/-Users-denizakpinar-Desktop-Claude-Code-Test/98dcf60b-0ec9-4b71-ba14-2b062fa68231/scratchpad/kotaman';
const { out } = require(K + '/leads.json'); const zu = require('./ff/zuordnung.json'); const doms = require('./ff/lead_domains.json'); const ffm = require('./ff/meta.json'); const kl = require('./ff/klassen.json');
const belegt = new Set(zu.filter(z => z.stufe === 'sicher' || z.stufe.startsWith('wahr')).map(z => z.leadId));
const okt = s => !!s && s.startsWith('2026-10'); const dd = (a, b) => Math.abs(Math.round((new Date(a + 'T12:00:00Z') - new Date(b + 'T12:00:00Z')) / 864e5));
const wt = d => ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][new Date(d + 'T12:00:00Z').getUTCDay()];
const dm = (a, b) => a === b || a.endsWith('.' + b) || b.endsWith('.' + a);
const ffByDomain = (leadId) => { const ld = (doms[leadId] || {}).domains || []; return kl.filter(r => r.extDomains.some(d => ld.some(x => dm(d, x)))); };
const rows = [];
for (const t of E.TERMINE) { if (t.art !== 'closing' || t.ausgang !== 'stattgefunden' || !okt(t.ausgangAm)) continue;
  const closer = E.closerVon(t).name; if (!['Julius Kawka', 'Tobias Böttcher'].includes(closer)) continue;
  const lead = t.opp.o.lead_id; if (belegt.has(lead)) continue;
  const l = out[lead]; const scTasks = l.tasks.filter(x => /^\s*sc\b/i.test(x.text || '') && x.date).map(x => ({ d: E.ymd(x.date), z: new Date(x.date).toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }), erledigt: x.is_complete }));
  const nahe = scTasks.filter(x => x.d >= t.am && dd(x.d, t.ausgangAm) <= 3).sort((a, b) => dd(a.d, t.ausgangAm) - dd(b.d, t.ausgangAm))[0];
  const tag = nahe ? nahe.d : t.ausgangAm;
  const calls = l.acts.filter(a => a._type === 'Call' && dd(E.ymd(a.activity_at || a.date_created), tag) <= 1 && [closer].includes(E.un[a.user_id] || a.user_name)).map(a => ({ min: Math.round((a.duration || 0) / 60), aufn: !!a.recording_url, d: E.ymd(a.activity_at || a.date_created) }));
  const meets = l.acts.filter(a => a._type === 'Meeting' && dd(E.ymd(a.starts_at || a.date_created), tag) <= 1).length;
  const ff = ffByDomain(lead).filter(r => !(r.klasse === 'intern/Sonstiges')).map(r => ({ d: r.datum, min: r.min, host: r.host }));
  const lang = calls.filter(c => c.min >= 15).sort((a, b) => b.min - a.min)[0], kurz = calls.sort((a, b) => b.min - a.min)[0];
  let ursache, code;
  if (ff.length) { code = 'FF-anderer-Tag'; ursache = `Fireflies-Meeting mit Kundendomain an anderem Tag (${ff.map(f => f.d.slice(5) + ', ' + f.min + ' Min.').join('; ')}) — Termin verschoben oder Zuordnung unsicher`; }
  else if (lang) { code = 'telefonisch'; ursache = `vermutlich telefonisch: Close-Anruf ${lang.min} Min. am ${lang.d.slice(5)}${lang.aufn ? ' (aufgezeichnet)' : ''}`; }
  else if (meets) { code = 'Kalender-ohne-FF'; ursache = 'Kalendertermin in Close vorhanden, aber keine Fireflies-Aufnahme (Bot nicht beigetreten?)'; }
  else if (kurz && kurz.min > 0) { code = 'kurzer-Anruf'; ursache = `nur kurzer Close-Anruf (${kurz.min} Min.) am Termintag — Gespraech evtl. ausserhalb von Close/Fireflies`; }
  else { code = 'kein-Hinweis'; ursache = 'kein Close-Anruf, kein Fireflies-Meeting, kein Close-Kalendereintrag am Termintag — Videocall ohne Aufnahme oder Ausgang ohne Gespraech gepflegt (Kalender pruefen)'; }
  rows.push({ closer, opp: t.opp.o.id, leadId: lead, scAm: tag, wt: wt(tag), ausgangAm: t.ausgangAm, gebuchtAm: t.am, gebuchtVon: t.vonName, scAufgabe: nahe ? nahe.z + (nahe.erledigt ? '' : ' (offen)') : 'keine SC-Aufgabe', statusHeute: t.opp.o.status_label, code, ursache });
}
rows.sort((a, b) => a.closer.localeCompare(b.closer) || a.scAm.localeCompare(b.scAm)); fs.writeFileSync('run/coverage.json', JSON.stringify(rows));
for (const c of ['Julius Kawka', 'Tobias Böttcher']) { const r = rows.filter(x => x.closer === c); const z = {}; for (const x of r) z[x.code] = (z[x.code] || 0) + 1; console.log(c, 'ohne Aufnahme:', r.length, JSON.stringify(z)); }
const wtz = {}; for (const x of rows) wtz[x.wt] = (wtz[x.wt] || 0) + 1; console.log('Wochentage der fehlenden:', JSON.stringify(wtz));
const mitA = [...E.TERMINE].filter(t => t.art === 'closing' && t.ausgang === 'stattgefunden' && okt(t.ausgangAm) && ['Julius Kawka', 'Tobias Böttcher'].includes(E.closerVon(t).name) && belegt.has(t.opp.o.lead_id)); const w2 = {}; for (const t of mitA) { const k = wt(t.ausgangAm); w2[k] = (w2[k] || 0) + 1; } console.log('Wochentage der aufgenommenen:', JSON.stringify(w2));
const bv = {}; for (const x of rows) bv[x.gebuchtVon] = (bv[x.gebuchtVon] || 0) + 1; console.log('SC gebucht von (fehlende):', JSON.stringify(bv)); const bv2 = {}; for (const t of mitA) bv2[t.vonName] = (bv2[t.vonName] || 0) + 1; console.log('SC gebucht von (aufgenommene):', JSON.stringify(bv2));
const sa = {}; for (const x of rows) { const k = x.scAufgabe.startsWith('keine') ? 'ohne SC-Aufgabe' : 'mit SC-Aufgabe'; sa[k] = (sa[k] || 0) + 1; } console.log('SC-Aufgabe (fehlende):', JSON.stringify(sa));
