const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const close = require(B + '/src/utils/closeClient');
const stages = require('./stages.json'); const z = require('./ff/zuordnung.json');
(async () => {
  const c = stages.find(x => x.imKreis && x.stufe === 'Setting');
  const r = await close.get(`/activity/call/${c.callId}/`, { _fields: 'id,recording_transcript,user_name,duration' });
  const t = r.recording_transcript;
  console.log('Close: Sprecher', JSON.stringify((t.speakers || []).map(s => ({ label: s.speaker_label, side: s.speaker_side, pct: s.talk_percentage }))), '| Äusserung-Schluessel', Object.keys(t.utterances[0]).join(','), '| Seiten', [...new Set(t.utterances.map(u => u.speaker_side))].join(','));
  const KEY = process.env.FIREFLIES_API_KEY;
  const id = z[0].ffId;
  const rr = await fetch('https://api.fireflies.ai/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY }, body: JSON.stringify({ query: `query($id:String!){ transcript(id:$id){ id duration speakers{id name} sentences{speaker_name text start_time end_time} summary{short_summary overview} } }`, variables: { id } }) });
  const j = await rr.json(); if (j.errors) { console.log('FF Fehler', JSON.stringify(j.errors).slice(0, 300)); return; }
  const f = j.data.transcript;
  console.log('Fireflies: Sprecher', JSON.stringify(f.speakers), '| Saetze', f.sentences.length, '| Satz-Schluessel', Object.keys(f.sentences[0]).join(','), '| Zeichen', f.sentences.reduce((s, x) => s + x.text.length, 0));
})();
