// Read-only: pro Lead mit SC im Oktober/Anfang November nur die Kunden-Domains aus Close (keine Mailadressen gespeichert).
const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const close = require(B + '/src/utils/closeClient');
const K = '/private/tmp/claude-501/-Users-denizakpinar-Desktop-Claude-Code-Test/98dcf60b-0ec9-4b71-ba14-2b062fa68231/scratchpad/kotaman';
const E = require(K + '/engine.js');
const fs = require('fs');
const leadIds = new Set();
for (const t of E.TERMINE) if (t.art === 'closing' && t.am >= '2026-09-25') leadIds.add(t.opp.o.lead_id);
for (const [id, l] of Object.entries(require(K + '/leads.json').out)) for (const tk of l.tasks) if (/^\s*sc\b/i.test(tk.text || '') && (tk.date || '') >= '2026-09-25') leadIds.add(id);
const ids = [...leadIds]; const res = {}; let i = 0;
const freemail = /^(gmail|googlemail|gmx|web|outlook|hotmail|t-online|yahoo|icloud|freenet|aol|live|me)\./i;
async function w() { while (i < ids.length) { const id = ids[i++];
  try { const l = await close.get(`/lead/${id}/`, { _fields: 'id,display_name,url,contacts' });
    const doms = new Set(); for (const c of (l.contacts || [])) for (const e of (c.emails || [])) { const d = (e.email || '').split('@')[1]; if (d && !freemail.test(d)) doms.add(d.toLowerCase()); }
    if (l.url) { const m = /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i.exec(l.url); if (m) doms.add(m[1].toLowerCase()); }
    res[id] = { name: l.display_name, domains: [...doms] };
  } catch (e) { res[id] = { error: e.message.slice(0, 80) }; } } }
(async () => { await Promise.all([w(), w(), w()]); fs.writeFileSync(__dirname + '/lead_domains.json', JSON.stringify(res));
  console.log('Leads', ids.length, '| mit Domain', Object.values(res).filter(x => x.domains && x.domains.length).length, '| Fehler', Object.values(res).filter(x => x.error).length); })();
