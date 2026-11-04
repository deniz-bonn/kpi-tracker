// Read-only: volle Historie (Aktivitaeten, Aufgaben, Opportunities) je Lead im Oktober-Scope.
const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const close = require(B + '/src/utils/closeClient');
const fs = require('fs');
const { evs, opps } = require('./raw.json');
const BER = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });
const ymd = v => BER.format(new Date(v));
const L = new Set();
for (const e of evs) if (ymd(e.date_created) >= '2026-10-01') L.add(e.lead_id);
for (const o of opps) if (ymd(o.date_created) >= '2026-10-01') L.add(o.lead_id);
const leads = [...L];
const out = {};
let i = 0, fehler = [];
async function worker() {
  while (i < leads.length) {
    const id = leads[i++];
    try {
      const [acts, tasks, ops] = await Promise.all([
        close.getAll('/activity/', { lead_id: id }, { max: 5000, limit: 100 }),
        close.getAll('/task/', { lead_id: id }, { max: 2000, limit: 100 }),
        close.getAll('/opportunity/', { lead_id: id }, { max: 200, limit: 100 }),
      ]);
      out[id] = { acts, tasks, opps: ops };
    } catch (e) { fehler.push([id, e.message]); }
    if (Object.keys(out).length % 50 === 0) process.stdout.write(`${Object.keys(out).length}/${leads.length}\n`);
  }
}
(async () => {
  await Promise.all([worker(), worker(), worker()]);
  fs.writeFileSync(__dirname + '/leads.json', JSON.stringify({ out, geholt: new Date().toISOString(), fehler }));
  console.log('fertig', Object.keys(out).length, 'Leads, Fehler', fehler.length);
})();
