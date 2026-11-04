// Read-only: Umfang + Transkriptlaengen (Texte nur im Speicher, nur Laengen werden ausgegeben).
const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const close = require(B + '/src/utils/closeClient');
const { out } = require('./leads.json');
const { users } = require('./raw.json');
const un = Object.fromEntries(users.map(u => [u.id, u.name]));
(async () => {
  const calls = Object.values(out).flatMap(l => l.acts.filter(a => a._type === 'Call' && a.date_created >= '2026-10-01'));
  const ab60 = calls.filter(c => c.duration >= 60);
  const mitAuf = ab60.filter(c => c.recording_url);
  const proPerson = {}; for (const c of mitAuf) { const n = un[c.user_id] || c.user_name || '?'; proPerson[n] = (proPerson[n] || 0) + 1; }
  console.log('Calls ab 01.10. in den 452 Leads:', calls.length, '| ab 60 s:', ab60.length, '| davon mit Aufnahme:', mitAuf.length);
  console.log('Aufnahmen ab 60 s je Mitarbeiter:', JSON.stringify(Object.entries(proPerson).sort((a, b) => b[1] - a[1])));
  const dur = mitAuf.map(c => c.duration).sort((a, b) => a - b);
  console.log('Dauer Median', dur[Math.floor(dur.length / 2)], 's | Mittel', Math.round(dur.reduce((s, x) => s + x, 0) / dur.length), 's | Summe', Math.round(dur.reduce((s, x) => s + x, 0) / 3600), 'h');
  const step = Math.floor(mitAuf.length / 40); const sample = mitAuf.filter((_, i) => i % step === 0).slice(0, 40);
  let mit = 0, chars = [], sumChars = [], perSec = [];
  for (const c of sample) {
    const r = await close.get(`/activity/call/${c.id}/`, { _fields: 'id,recording_transcript' });
    const t = r.recording_transcript;
    if (t && t.utterances && t.utterances.length) {
      mit++; const n = t.utterances.reduce((s, u) => s + (u.text || '').length + 4, 0);
      chars.push(n); sumChars.push((t.summary_text || '').length); perSec.push(n / c.duration);
    }
  }
  const avg = a => Math.round(a.reduce((s, x) => s + x, 0) / a.length);
  console.log(`Stichprobe ${sample.length}: mit Transkript ${mit} | Zeichen je Transkript Ø ${avg(chars)} (max ${Math.max(...chars)}) | Zusammenfassung Ø ${avg(sumChars)} Zeichen | Zeichen pro Sekunde Ø ${(perSec.reduce((s, x) => s + x, 0) / perSec.length).toFixed(1)}`);
  // Hochrechnung Gesamtzeichen ueber Dauer
  const cps = perSec.reduce((s, x) => s + x, 0) / perSec.length;
  console.log('Hochrechnung Transkript-Zeichen gesamt:', Math.round(dur.reduce((s, x) => s + x, 0) * cps));
})();
