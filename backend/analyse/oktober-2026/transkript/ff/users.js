const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const KEY = process.env.FIREFLIES_API_KEY;
async function gql(query, variables) {
  const r = await fetch('https://api.fireflies.ai/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY }, body: JSON.stringify({ query, variables }) });
  const j = await r.json().catch(() => ({})); return { s: r.status, j };
}
(async () => {
  let r = await gql(`query { user { name email is_admin num_transcripts } users { name email is_admin num_transcripts } }`);
  if (r.j.errors) console.log('users-Abfrage:', JSON.stringify(r.j.errors).slice(0, 300));
  else { console.log('Key-Inhaber:', JSON.stringify(r.j.data.user)); console.log('Team-Mitglieder:'); for (const u of r.j.data.users) console.log('  ', u.name, '|', u.email, '| admin', u.is_admin, '| Transkripte', u.num_transcripts); }
  for (const f of ['host_email', 'participant_email']) for (const e of ['j.kawka@hioffice.com', 'julius.kawka@hioffice.com']) {
    const q = await gql(`query($e:String){ transcripts(${f}:$e, fromDate:"2026-10-01T00:00:00.000Z", limit:50){ id dateString duration } }`, { e });
    console.log(f, e, '->', q.j.errors ? 'Fehler ' + JSON.stringify(q.j.errors).slice(0, 120) : (q.j.data.transcripts || []).length + ' Meetings');
  }
})();
