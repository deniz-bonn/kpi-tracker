const L = require('./lib'); const C = require('./code_lib'); const fs = require('fs'); const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');
const client = new Anthropic(); const stages = require('./stages.json'); const zu = require('./ff/zuordnung.json'); const meta = Object.fromEntries(require('./ff/meta.json').map(x => [x.id, x]));
const used = new Set(require('./taxo/open_codes.json').map(c => c.id));
const pick = (stufe, n, seed) => { const pool = L.shuffle(stages.filter(c => c.imKreis && c.stufe === stufe && !used.has(c.callId)), seed); const byP = {}; for (const c of pool) (byP[c.person] ||= []).push(c); const ps = Object.keys(byP), out = []; for (let i = 0; out.length < n && i < 400; i++) { const c = byP[ps[i % ps.length]].shift(); if (c) out.push(c); } return out; };
const cl = [...pick('Opening', 18, 21), ...pick('Setting', 14, 22), ...pick('Closing', 3, 23), ...pick('Nachfassung', 10, 24), ...pick('Sonstiges', 9, 25)].map(c => ({ quelle: 'close', callId: c.callId, leadId: c.leadId, datum: c.datum, zeit: c.zeit, person: c.person, stufeH: c.stufe, warum: c.warum, richtung: c.richtung }));
const ff = L.shuffle(zu.filter(z => (z.stufe === 'sicher' || z.stufe.startsWith('wahr')) && z.leadId), 26).slice(0, 6).map(z => ({ quelle: 'fireflies', id: z.ffId, leadId: z.leadId, datum: z.datum, zeit: meta[z.ffId] && meta[z.ffId].date ? new Date(meta[z.ffId].date).toISOString() : null, person: null, stufeH: 'Closing', warum: 'Fireflies-Videocall, zugeordnet' }));
const faelle = [...cl, ...ff]; const res = { sonnet: [], opus: [] }; const q = [...faelle];
async function call(model, effort, p) { for (let a = 0; a < 4; a++) { try { const r = await client.messages.create({ ...p, model, output_config: { ...p.output_config, effort } }); C.logKosten('Gegenprobe ' + model, model, r.usage, false);
  const txt = r.content.filter(b => b.type === 'text').map(b => b.text).join(''); return JSON.parse(txt); } catch (e) { if (a === 3) return { fehler: (e.status || '') + ' ' + (e.message || '').slice(0, 100) }; await L.sleep(2500 * (a + 1)); } } }
async function one(f) { const fall = await C.baueFall(f, 'claude-sonnet-5-5', 'low'); if (!fall) return;
  const [s, o] = await Promise.all([call('claude-sonnet-5-5', 'low', fall.params), call('claude-opus-5-5', 'medium', fall.params)]);
  res.sonnet.push({ meta: fall.meta, out: s }); res.opus.push({ meta: fall.meta, out: o }); }
(async () => { await Promise.all([1, 2, 3, 4, 5].map(async () => { while (q.length) await one(q.shift()); }));
  fs.writeFileSync('run/probe_sonnet.json', JSON.stringify(res.sonnet)); fs.writeFileSync('run/probe_opus.json', JSON.stringify(res.opus));
  const byId = Object.fromEntries(res.opus.map(x => [x.meta.customId, x.out])); const pairs = res.sonnet.map(x => [x.out, byId[x.meta.customId], x.meta]).filter(([a, b]) => a && b && !a.fehler && !b.fehler);
  const ag = f => Math.round(100 * pairs.filter(([a, b]) => a[f] === b[f]).length / pairs.length);
  console.log('Gegenprobe: Faelle', faelle.length, '| ausgewertet', pairs.length, '| Fehler S/O', res.sonnet.filter(x => x.out.fehler).length, '/', res.opus.filter(x => x.out.fehler).length);
  for (const f of ['stufe', 'erfolg', 'ergebnis', 'konfidenz', 'entscheider_im_gespraech', 'bedarf_bestaetigt', 'naechster_schritt_mit_datum', 'ma_fragte_aktiv_nach_termin', 'abschlussfrage_gestellt', 'closing_aktiv_angeboten', 'termin_verbindlich_fixiert', 'abschluss_aktiv_versucht', 'widerspruch_zusammenfassung']) console.log('  Uebereinstimmung', f.padEnd(30), ag(f) + ' %');
  const grp = (a) => a.gruende.map(g => g.id); const fails = pairs.filter(([a, b]) => a.erfolg === 'nein' && b.erfolg === 'nein');
  const first = fails.filter(([a, b]) => grp(a)[0] && grp(a)[0] === grp(b)[0]).length, any = fails.filter(([a, b]) => grp(a).some(x => grp(b).includes(x))).length;
  console.log('  Gruende (beide: erfolg=nein, n=' + fails.length + '): erster Grund gleich', Math.round(100 * first / Math.max(1, fails.length)) + ' %, mindestens ein gemeinsamer Grund', Math.round(100 * any / Math.max(1, fails.length)) + ' %');
  const ba = pairs.filter(([a, b]) => a.stufe !== b.stufe).map(([a, b]) => a.stufe + '/' + b.stufe); console.log('  Stufen-Abweichungen (Sonnet/Opus):', JSON.stringify(ba.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {})));
  const sk = JSON.parse(fs.readFileSync('run/costs.json')).filter(x => /Gegenprobe/.test(x.label)); console.log('  Kosten Gegenprobe $', sk.reduce((s, x) => s + x.usd, 0).toFixed(2));
})();
