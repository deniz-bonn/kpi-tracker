const L = require('./lib'); const close = L.close; const fs = require('fs');
(async () => {
  const pl = (await close.get('/pipeline/', { _limit: 50 })).data || [];
  const alle = {}; for (const p of pl) for (const s of p.statuses) alle[s.id] = { pipeline: p.name, label: s.label, type: s.type };
  console.log('Pipelines:', pl.map(p => p.name + ' (' + p.statuses.length + ')').join(' | '));
  const opps = await close.getAll('/opportunity/', { _fields: 'id,status_id,status_label,status_type,pipeline_name,date_created,date_updated' }, { max: 50000, limit: 100 });
  fs.writeFileSync('run/opps_alle_status.json', JSON.stringify(opps.map(o => ({ id: o.id, s: o.status_id, l: o.status_label, t: o.status_type, p: o.pipeline_name, c: o.date_created, u: o.date_updated }))));
  const cnt = {}; for (const o of opps) { const k = (o.pipeline_name || '?') + ' | ' + o.status_label + ' | ' + o.status_type; cnt[k] = (cnt[k] || 0) + 1; }
  console.log('Opportunities gesamt in Close:', opps.length);
  for (const [k, n] of Object.entries(cnt).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(5), k);
  const leer = Object.values(alle).filter(s => !cnt[s.pipeline + ' | ' + s.label + ' | ' + s.type]).map(s => s.pipeline + ' | ' + s.label); console.log('\nStatus ohne Opportunities:', leer.join('; '));
})().catch(e => { console.error(e.message); process.exit(1); });
