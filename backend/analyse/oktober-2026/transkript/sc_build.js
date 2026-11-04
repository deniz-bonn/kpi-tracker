const L = require('./lib'); const close = L.close; const fs = require('fs'); const E = L.E; const S = E.S; const ymd = E.ymd; const HEUTE = ymd(new Date().toISOString());
const opps = require('./run/sc/opps.json'); const evs = require('./run/sc/events.json'); const byOpp = {}; for (const e of evs.sort((a, b) => a.t < b.t ? -1 : a.t > b.t ? 1 : 0)) (byOpp[e.opp] ||= []).push(e);
const HELD = new Set([S.SC_STATT_FU, S.SC_STATT_KEINA, S.ALT_HIGHPOT, S.ALT_CC2, S.ALT_SOFTCLOSE, S.ALT_FU_KURZ, S.ALT_FU_LANG]);
const SCREL = new Set([...HELD, S.SC_TERMINIERT, S.SC_ABGESAGT, S.SC_NOSHOW, S.ALT_CLOSING_NOSHOW]);
const kat = l => /SC\/ Statt\. FU/.test(l) ? 'Stattgefunden (SC/ Statt. FU)' : /Closing Follow-Up/.test(l) ? 'Follow-up (Closing Follow-Up, Altstatus)' : /^Follow-Up\/Inaktiv/.test(l) ? 'Follow-up (Follow-Up/Inaktiv nach stattgefundenem SC)' : /QC=SC Ausstehend|High Potentials|Closing Call #2|Soft-Close/.test(l) ? 'Rücksprache/ausstehend (nächstliegende Status)' : /^SC Terminiert$/.test(l) ? 'SC terminiert' : null;
const ein = [], sct = [], ausg = { fuOhneSC: 0, fuNurTerminiert: 0, fuOhneHistorie: 0 };
for (const o of opps) { const h = byOpp[o.id] || []; const visited = new Set(h.flatMap(e => [e.from, e.to])); const k = kat(o.status_label); if (!k) continue;
  const last = [...h].reverse().find(e => e.to === o.status_id); const seit = last ? ymd(last.t) : ymd(o.date_created);
  const buchungen = h.filter(e => e.to === S.SC_TERMINIERT); const gebucht = buchungen.length ? ymd(buchungen[buchungen.length - 1].t) : null;
  const hat = [...HELD].some(x => visited.has(x)); const rel = [...SCREL].some(x => visited.has(x));
  const row = { opp: o.id, lead: o.lead_id, firma: o.lead_name, status: o.status_label, kat: k, seit, gebucht, wert: o.value != null ? o.value / 100 : null, closerId: o.closer, ownerName: o.user_name, setterId: o.setter, ausgangUser: last ? last.un : null, hist: h.length, held: hat };
  if (/^Follow-Up\/Inaktiv/.test(o.status_label)) { if (!h.length) { ausg.fuOhneHistorie++; continue; } if (!hat) { if (rel) ausg.fuNurTerminiert++; else ausg.fuOhneSC++; continue; } }
  (k === 'SC terminiert' ? sct : ein).push(row); }
console.log('Aufgenommen:', ein.length, JSON.stringify(ein.reduce((m, r) => (m[r.status] = (m[r.status] || 0) + 1, m), {})), '| SC terminiert (Pruefmenge)', sct.length, '| Follow-Up/Inaktiv ausgeschlossen:', JSON.stringify(ausg));
const leads = [...new Set([...ein, ...sct].map(r => r.lead))]; console.log('Leads fuer Aufgaben-Abruf:', leads.length);
(async () => { const users = Object.fromEntries(((await close.get('/user/', { _limit: 200 })).data || []).map(u => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim()]));
  const tasks = {}; const q = [...leads]; let n = 0;
  async function w() { while (q.length) { const id = q.shift(); try { tasks[id] = (await close.getAll('/task/', { lead_id: id }, { max: 1000, limit: 100 })).map(t => ({ text: (t.text || '').trim().slice(0, 40), d: t.date ? (String(t.date).length > 10 ? ymd(t.date) : String(t.date)) : null, done: t.is_complete })); } catch (e) { tasks[id] = { fehler: e.message.slice(0, 60) }; } if (++n % 100 === 0) console.log('Aufgaben', n, '/', leads.length); } }
  await Promise.all([1, 2, 3, 4].map(w)); fs.writeFileSync('run/sc/tasks.json', JSON.stringify(tasks)); fs.writeFileSync('run/sc/ein.json', JSON.stringify({ ein, sct, ausg, users, heute: HEUTE }));
  console.log('Aufgaben-Abruf fertig; Fehler:', Object.values(tasks).filter(t => t.fehler).length);
})().catch(e => { console.error('FEHLER', e.message); process.exit(1); });
