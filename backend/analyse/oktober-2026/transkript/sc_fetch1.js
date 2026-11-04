// Read-only: Opportunities der relevanten Status (voll) + komplette Statushistorie aller Opportunities.
const L = require('./lib'); const close = L.close; const fs = require('fs'); const E = L.E; const S = E.S;
const SCOPE = [S.SC_STATT_FU, 'stat_8Ljfbt6VeWwSuoZW4BXgvgnuDypEi1IXkTG8l1HBq4t'].filter(Boolean);
(async () => {
  const meta = require('./run/opps_alle_status.json'); const labels = {}; for (const o of meta) labels[o.s] = o.l;
  const ids = Object.entries(labels).filter(([id, l]) => /SC\/ Statt\. FU|Follow-Up\/Inaktiv|Closing Follow-Up|Closing #High|Closing Call #2|Soft-Close|QC=SC Ausstehend|^SC Terminiert$/.test(l)).map(([id, l]) => ({ id, l }));
  console.log('Status im Umfang:', ids.map(x => x.l).join(' | '));
  const opps = []; for (const s of ids) { const r = await close.getAll('/opportunity/', { status_id: s.id }, { max: 5000, limit: 100 }); opps.push(...r); console.log(' ', s.l, r.length); }
  fs.writeFileSync('run/sc/opps.json', JSON.stringify(opps.map(o => ({ id: o.id, lead_id: o.lead_id, lead_name: o.lead_name, status_id: o.status_id, status_label: o.status_label, value: o.value, user_id: o.user_id, user_name: o.user_name, closer: o['custom.cf_QiksFSC1OxIQUYhxfHNnKipDAS8XU46KRzuPiwfzZyF'] || null, setter: o['custom.cf_vfla9UhCxsjL5LQO4BAdqTN86LKBHqBaAKxXmmG4qVp'] || null, date_created: o.date_created, date_updated: o.date_updated }))));
  const t0 = Date.now(); const ev = await close.getAll('/activity/status_change/opportunity/', {}, { max: 200000, limit: 100 });
  fs.writeFileSync('run/sc/events.json', JSON.stringify(ev.map(e => ({ opp: e.opportunity_id, lead: e.lead_id, from: e.old_status_id, to: e.new_status_id, toL: e.new_status_label, t: e.date_created, u: e.user_id, un: e.user_name }))));
  console.log('Opportunities', opps.length, '| Statuswechsel-Events gesamt', ev.length, '| aelteste', ev.map(e => e.date_created).sort()[0].slice(0, 10), '| Dauer', Math.round((Date.now() - t0) / 1000), 's');
})().catch(e => { console.error('FEHLER', e.message); process.exit(1); });
