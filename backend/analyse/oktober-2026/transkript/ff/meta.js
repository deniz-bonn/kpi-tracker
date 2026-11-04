// Read-only: Fireflies-Metadaten (ohne Transkripttext) fuer 01.10.2026 bis heute.
const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const fs = require('fs');
const KEY = process.env.FIREFLIES_API_KEY;
if (!KEY) { console.error('FIREFLIES_API_KEY fehlt'); process.exit(1); }
async function gql(query, variables) {
  const r = await fetch('https://api.fireflies.ai/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY }, body: JSON.stringify({ query, variables }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.errors) throw new Error('HTTP ' + r.status + ' ' + JSON.stringify(j.errors || j).slice(0, 400));
  return j.data;
}
const Q = `query($from: DateTime, $to: DateTime, $limit: Int, $skip: Int) {
  transcripts(fromDate: $from, toDate: $to, limit: $limit, skip: $skip) {
    id title date dateString duration host_email organizer_email participants
    meeting_attendees { displayName email name }
    summary { short_summary overview }
  } }`;
(async () => {
  const all = []; let skip = 0;
  for (;;) {
    const d = await gql(Q, { from: '2026-10-01T00:00:00.000Z', to: new Date().toISOString(), limit: 50, skip });
    const rows = d.transcripts || []; all.push(...rows);
    if (rows.length < 50) break; skip += 50;
    await new Promise(r => setTimeout(r, 600));
  }
  fs.writeFileSync(__dirname + '/meta.json', JSON.stringify(all));
  const tage = {}; for (const m of all) { const k = (m.dateString || '').slice(0, 7); tage[k] = (tage[k] || 0) + 1; }
  const hosts = {}; for (const m of all) hosts[m.host_email || m.organizer_email || '?'] = (hosts[m.host_email || m.organizer_email || '?'] || 0) + 1;
  console.log('Meetings gesamt', all.length, '| je Monat', JSON.stringify(tage));
  console.log('Hosts', JSON.stringify(Object.entries(hosts).sort((a, b) => b[1] - a[1])));
  const dur = all.map(m => m.duration || 0);
  console.log('Dauer (Min) Median', Math.round(dur.sort((a, b) => a - b)[Math.floor(dur.length / 2)]), '| mit Summary', all.filter(m => m.summary && (m.summary.overview || m.summary.short_summary)).length);
})().catch(e => { console.error('Fehler:', e.message); process.exit(1); });
