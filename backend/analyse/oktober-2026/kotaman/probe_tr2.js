const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const close = require(B + '/src/utils/closeClient');
const { out } = require('./leads.json');
(async () => {
  const all = Object.values(out).flatMap(l => l.acts.filter(a => a._type === 'Call' && a.date_created >= '2026-10-01'));
  const rec = all.filter(a => a.recording_url);
  // gleichmaessige Stichprobe: jede n-te Aufnahme, getrennt nach Dauer
  const pick = (arr, n) => arr.filter((_, i) => i % Math.max(1, Math.floor(arr.length / n)) === 0).slice(0, n);
  const kurz = pick(rec.filter(a => a.duration < 60), 10), lang = pick(rec.filter(a => a.duration >= 60), 20);
  let speakerInfo = null;
  for (const [name, set] of [['unter 60 s', kurz], ['ab 60 s', lang]]) {
    let mit = 0, sum = 0;
    for (const c of set) {
      const r = await close.get(`/activity/call/${c.id}/`, { _fields: 'id,recording_transcript' });
      const t = r.recording_transcript;
      if (t && t.utterances && t.utterances.length) { mit++; if (t.summary_text) sum++; if (!speakerInfo) speakerInfo = { labels: t.has_speaker_labels, speakers: (t.speakers || []).map(s => Object.keys(s)), utt: Object.keys(t.utterances[0]) }; }
    }
    console.log(`Aufnahmen ${name}: Stichprobe ${set.length}, mit Transkript ${mit}, davon mit Zusammenfassung ${sum}`);
  }
  console.log('Oktober-Calls gesamt', all.length, '| mit Aufnahme', rec.length, '| Aufnahme ab 60 s', rec.filter(a => a.duration >= 60).length);
  console.log('Struktur:', JSON.stringify(speakerInfo));
  const meets = Object.values(out).flatMap(l => l.acts.filter(a => a._type === 'Meeting'));
  console.log('Meetings', meets.length, 'mit summary', meets.filter(m => m.summary).length);
})();
