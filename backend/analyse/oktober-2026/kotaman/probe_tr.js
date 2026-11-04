const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const close = require(B + '/src/utils/closeClient');
const { out } = require('./leads.json');
(async () => {
  const calls = Object.values(out).flatMap(l => l.acts.filter(a => a._type === 'Call' && a.recording_url && a.duration > 120))
    .sort((a, b) => a.date_created < b.date_created ? 1 : -1).slice(0, 3);
  for (const c of calls) {
    for (const f of ['recording_transcript', 'voicemail_transcript', 'transcript']) {
      try {
        const r = await close.get(`/activity/call/${c.id}/`, { _fields: `id,${f}` });
        const v = r[f];
        console.log(c.date_created.slice(0, 10), c.duration + 's', f, '->', v == null ? 'null' : typeof v === 'object' ? 'Objekt mit Schlüsseln ' + Object.keys(v).join(',') + (v.utterances ? ` (${v.utterances.length} Äußerungen)` : '') : 'Text ' + String(v).length + ' Zeichen');
      } catch (e) { console.log(f, 'Fehler', e.message.slice(0, 120)); }
    }
    const nh = (c.note_html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('   Notiz (Notetaker):', nh.length, 'Zeichen, Anfang:', nh.slice(0, 90));
  }
})();
