// Read-only: Close-Rohdaten fuer Settings Okt 2026 (Mikail Kotaman). Key aus backend/.env, nie ausgegeben.
const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const close = require(B + '/src/utils/closeClient');
const fs = require('fs');
(async () => {
  const users = ((await close.get('/user/', { _limit: 200 })).data || []).map(u => ({ id: u.id, name: `${u.first_name||''} ${u.last_name||''}`.trim(), email: u.email }));
  const evs = await close.getAll('/activity/status_change/opportunity/', { date_created__gte: '2026-09-01' }, { max: 100000, limit: 100 });
  const opps = await close.getAll('/opportunity/', { date_updated__gte: '2026-09-15' }, { max: 100000, limit: 100 });
  fs.writeFileSync(__dirname + '/raw.json', JSON.stringify({ users, evs, opps, geholt: new Date().toISOString() }));
  console.log('users', users.length, 'events', evs.length, 'opps', opps.length);
})().catch(e => { console.error(e.message); process.exit(1); });
