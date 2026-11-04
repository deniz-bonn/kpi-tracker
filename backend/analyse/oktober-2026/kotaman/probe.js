const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const close = require(B + '/src/utils/closeClient');
const fs = require('fs');
(async () => {
  const cf = (await close.get('/custom_field/opportunity/', { _limit: 100 })).data || [];
  console.log('CF:', cf.map(f => ({ id: f.id, name: f.name, type: f.type })));
  const { opps, users } = JSON.parse(fs.readFileSync('raw.json'));
  const un = Object.fromEntries(users.map(u => [u.id, u.name || u.email]));
  const okt = opps.filter(o => o.date_created >= '2026-10-01');
  for (const f of cf) { const vals = okt.map(o => o['custom.' + f.id]).filter(v => v != null && v !== ''); console.log(f.name, 'gefuellt', vals.length, '/', okt.length, 'Bsp', vals.slice(0, 3).map(v => un[v] || v)); }
  // eine Lead-Probe: alle Aktivitaetstypen + Tasks
  const o = okt.find(x => x.status_label === 'SC/ Statt. FU') || okt[0];
  const acts = await close.getAll('/activity/', { lead_id: o.lead_id });
  const typen = {}; for (const a of acts) typen[a._type] = (typen[a._type] || 0) + 1; console.log('Lead-Probe', o.lead_name, typen);
  const m = acts.find(a => a._type === 'Meeting'); if (m) console.log('Meeting-Felder', Object.keys(m).join(','), '| title', m.title, '| starts', m.starts_at, '| status', m.status);
  const tasks = await close.get('/task/', { lead_id: o.lead_id, _limit: 50 });
  console.log('Tasks', (tasks.data || []).map(t => ({ typ: t._type, text: (t.text || '').slice(0, 40), date: t.date, done: t.is_complete })));
})().catch(e => { console.error(e.message); process.exit(1); });
