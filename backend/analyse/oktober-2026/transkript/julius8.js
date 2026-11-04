// Read-only: Julius' "SC/ Statt. FU" (>5 Tage) ohne offene Aufgabe — Regel wie in SalesCalls_Closer (jede offene Aufgabe am Lead zaehlt), plus Live-Stand.
const L = require('./lib'); const E = L.E; const close = L.close; const fs = require('fs');
const okt = s => !!s && s.startsWith('2026-10'); const rows = [];
for (const rec of E.OPPS) for (const t of rec.termine) { if (t.art !== 'closing' || E.closerVon(t).name !== 'Julius Kawka') continue;
  if (!((t.ausgang !== 'offen' && okt(t.ausgangAm)) || (t.ausgang === 'offen' && okt(t.am)))) continue; if (rec.o.status_id !== E.S.SC_STATT_FU) continue;
  const last = rec.hist[rec.hist.length - 1]; const seit = last ? E.ymd(last.date_created) : E.ymd(rec.o.date_created); if (E.kalendertage(seit, E.HEUTE) <= 5) continue;
  rows.push({ opp: rec.o.id, lead: rec.o.lead_id, firma: rec.o.lead_name, scAm: t.ausgangAm, seit, offenSnap: E.offeneAufgaben(rec.lead).length, wert: rec.o.value != null ? rec.o.value / 100 : null }); }
console.log('Snapshot (03.11.): Julius-Zeilen', rows.length, '| ohne offene Aufgabe', rows.filter(r => r.offenSnap === 0).length);
(async () => { for (const r of rows) { const tasks = await close.getAll('/task/', { lead_id: r.lead }, { max: 500, limit: 100 }); const opps = await close.getAll('/opportunity/', { lead_id: r.lead }, { max: 50, limit: 100 });
    const o = opps.find(x => x.id === r.opp) || {}; r.statusJetzt = o.status_label; r.offenJetzt = tasks.filter(x => !x.is_complete).map(x => ({ d: x.date ? E.ymd(x.date) : null, text: (x.text || '').trim().slice(0, 30) })); r.letzteAenderung = o.date_updated ? E.ymd(o.date_updated) : null; }
  fs.writeFileSync('run/julius8.json', JSON.stringify(rows));
  const acht = rows.filter(r => r.offenSnap === 0); console.log('\nDie 8 (gestern ohne jede offene Aufgabe), heutiger Stand:'); for (const r of acht.sort((a, b) => a.scAm < b.scAm ? -1 : 1)) console.log(r.opp.slice(-8), '|', r.firma, '| SC', r.scAm, '| Status seit', r.seit, '| jetzt:', r.statusJetzt, '| offene Aufgaben jetzt:', r.offenJetzt.length ? r.offenJetzt.map(x => (x.d || 'ohne Datum') + ' ' + x.text).join('; ') : 'KEINE', '| Wert', r.wert);
  console.log('\nHeute ohne jede offene Aufgabe (alle 37):', rows.filter(r => r.offenJetzt.length === 0).length, '| davon nicht in den 8:', rows.filter(r => r.offenJetzt.length === 0 && r.offenSnap > 0).length, '| von den 8 inzwischen mit Aufgabe:', acht.filter(r => r.offenJetzt.length > 0).length, '| Status geaendert:', rows.filter(r => r.statusJetzt !== 'SC/ Statt. FU').length);
})().catch(e => { console.error(e.message); process.exit(1); });
