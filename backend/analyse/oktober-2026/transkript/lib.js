// Gemeinsame Helfer: Transkripte holen (nur im Speicher), Sprecher anonymisieren, Close-/Fireflies-Kontext.
const B = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/kpi-tracker/backend';
require(B + '/node_modules/dotenv').config({ path: B + '/.env' });
const close = require(B + '/src/utils/closeClient');
const K = '/private/tmp/claude-501/-Users-denizakpinar-Desktop-Claude-Code-Test/98dcf60b-0ec9-4b71-ba14-2b062fa68231/scratchpad/kotaman';
const E = require(K + '/engine.js');
const INTERN_NAMEN = /n[aä]kel|b[oö]e?ttcher|kawka|bauer|buharin|groten|kotaman|bous|zocher|murciano|friedl|braun|akpinar|kaporse|probe woche|alo\b/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ffGql(query, variables) {
  for (let a = 0; a < 5; a++) {
    const r = await fetch('https://api.fireflies.ai/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.FIREFLIES_API_KEY }, body: JSON.stringify({ query, variables }) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 429 || (j.errors && /too many|rate/i.test(JSON.stringify(j.errors)))) { await sleep(3000 * (a + 1)); continue; }
    if (!r.ok || j.errors) throw new Error('FF ' + r.status + ' ' + JSON.stringify(j.errors || j).slice(0, 200)); return j.data;
  } throw new Error('FF Rate-Limit');
}
const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
// Close-Anruf -> { text (MA/Kunde), summary, ma, redeanteil, dauer, kundenNamen[] }
async function closeCall(callId) {
  const r = await close.get(`/activity/call/${callId}/`, { _fields: 'id,recording_transcript,user_name,duration' });
  const t = r.recording_transcript; if (!t || !t.utterances || !t.utterances.length) return null;
  const maSp = (t.speakers || []).find(s => s.speaker_side === 'close-user');
  const kunden = [...new Set(t.utterances.filter(u => u.speaker_side !== 'close-user').map(u => u.speaker_label))];
  const text = t.utterances.map(u => `[${mmss(u.start)}] ${u.speaker_side === 'close-user' ? 'MA' : 'Kunde'}: ${u.text}`).join('\n');
  return { text, summary: t.summary_text || '', ma: r.user_name, redeanteil: maSp ? Math.round(maSp.talk_percentage * 100) : null, dauer: r.duration, kundenNamen: kunden };
}
// Fireflies-Meeting -> { text, summary, sprecher: {name: Redeanteil%}, dauer }
async function ffMeeting(id) {
  const d = await ffGql(`query($id:String!){ transcript(id:$id){ duration sentences{speaker_name text start_time end_time} summary{short_summary overview} } }`, { id });
  const f = d.transcript; if (!f || !f.sentences || !f.sentences.length) return null;
  const clean = n => (n || '').replace(/[‎‏]/g, '').trim();
  const zeit = {}; for (const s of f.sentences) zeit[clean(s.speaker_name)] = (zeit[clean(s.speaker_name)] || 0) + Math.max(0, (s.end_time || 0) - (s.start_time || 0));
  const tot = Object.values(zeit).reduce((a, b) => a + b, 0) || 1;
  const sprecher = Object.fromEntries(Object.entries(zeit).map(([n, v]) => [n, Math.round(v / tot * 100)]));
  const label = n => INTERN_NAMEN.test(n) ? 'MA' : 'Kunde';
  const kunden = Object.keys(zeit).filter(n => label(n) === 'Kunde');
  const text = f.sentences.map(s => `[${mmss(s.start_time || 0)}] ${label(clean(s.speaker_name))}: ${s.text}`).join('\n');
  const maMain = Object.entries(zeit).filter(([n]) => label(n) === 'MA').sort((a, b) => b[1] - a[1])[0];
  return { text, summary: (f.summary && (f.summary.overview || f.summary.short_summary)) || '', ma: maMain ? maMain[0] : null, sprecher, redeanteilMA: Math.round(Object.entries(zeit).filter(([n]) => label(n) === 'MA').reduce((a, [, v]) => a + v, 0) / tot * 100), dauer: f.duration, kundenNamen: kunden };
}
const oppZuLead = {}; for (const r of E.OPPS) (oppZuLead[r.o.lead_id] ||= []).push(r);
function leadKontext(leadId) { const recs = oppZuLead[leadId] || []; const rec = recs[recs.length - 1]; if (!rec) return {};
  const sc = rec.termine.filter(t => t.art === 'closing').pop(), st = rec.termine.filter(t => t.art === 'setting').pop();
  return { leadName: rec.o.lead_name, statusHeute: rec.o.status_label, setting: st ? `${st.ausgang}${st.ausgangStatus ? ' (' + st.ausgangStatus + ')' : ''}` : null, sc: sc ? `${sc.ausgang}${sc.ausgangStatus ? ' (' + sc.ausgangStatus + ')' : ''}` : null, gewonnen: !!E.wonNach((sc || st || { rest: [] }).rest) }; }
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const shuffle = (arr, seed) => { const r = mulberry32(seed), a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
module.exports = { close, E, ffGql, closeCall, ffMeeting, leadKontext, shuffle, sleep, INTERN_NAMEN };
