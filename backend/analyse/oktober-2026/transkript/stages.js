// Schritt 1: Call-Typ je Aufzeichnung (heuristisch aus Statuswechsel-Zeitpunkten). Nur Metadaten, keine Transkripte.
const K = '/private/tmp/claude-501/-Users-denizakpinar-Desktop-Claude-Code-Test/98dcf60b-0ec9-4b71-ba14-2b062fa68231/scratchpad/kotaman';
const E = require(K + '/engine.js'); const { S } = E; const fs = require('fs');
const ACHT = ['Markus Bauer', 'Andreas Buharin', 'Brian Groten', 'Mikail Kotaman', 'Dominik Bous', 'Clemens Näkel', 'Julius Kawka', 'Tobias Böttcher'];
const LAB = Object.fromEntries(Object.entries(S).map(([k, v]) => [v, k]));
// Statuszeitleiste je Lead (Opp-Anlage + Statuswechsel)
const tl = {};
for (const rec of E.OPPS) { const lid = rec.o.lead_id; const arr = tl[lid] ||= [];
  const initial = rec.hist.length ? rec.hist[0].old_status_id : rec.o.status_id;
  arr.push({ t: new Date(rec.o.date_created).getTime(), from: null, to: initial, opp: rec.o.id, anlage: true });
  for (const e of rec.hist) arr.push({ t: new Date(e.date_created).getTime(), from: e.old_status_id, to: e.new_status_id, opp: rec.o.id }); }
for (const a of Object.values(tl)) a.sort((x, y) => x.t - y.t);
const QC_OUT = new Set([S.QC_FOLLOWUP, S.QC_NOSHOW, S.QC_ABGESAGT, S.QC_VERSCHOBEN, S.QC_SC_AUSSTEH, S.SC_TERMINIERT]);
const SC_OUT = new Set([S.SC_STATT_FU, S.SC_STATT_KEINA, S.WON, S.LOST, S.SC_ABGESAGT, S.SC_NOSHOW, S.ALT_CLOSING_NOSHOW, S.ALT_HIGHPOT, S.ALT_CC2, S.ALT_SOFTCLOSE, S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_UNQUAL]);
const FU = new Set([S.QC_FOLLOWUP, S.SC_STATT_FU, S.QC_SC_AUSSTEH, S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_FOLLOWUP]);
const GRACE = 25 * 60 * 1000;
function stufe(call) {
  const T = new Date(call.activity_at || call.date_created).getTime(), end = T + (call.duration || 0) * 1000;
  const ev = tl[call.lead_id] || [];
  const zustand = [...ev].reverse().find(e => e.t <= T);               // Status bei Gespraechsbeginn
  const ausloeser = ev.find(e => e.t > T && e.t <= end + GRACE && !e.anlage);  // Wechsel direkt nach dem Call
  const anlageNah = ev.find(e => e.anlage && e.t >= T - 5 * 60 * 1000 && e.t <= end + GRACE);
  const trig = ausloeser || anlageNah;
  if (trig) {
    if (trig.to === S.QC_TERMINIERT) return ['Opening', 'loest QC Terminiert aus'];
    if (trig.to === S.SC_TERMINIERT && (!zustand || zustand.to !== S.QC_TERMINIERT)) return ['Opening', 'direkter SC (ohne vorheriges QC)'];
    if (QC_OUT.has(trig.to) && zustand && (zustand.to === S.QC_TERMINIERT || zustand.to === S.QC_FOLLOWUP || zustand.to === S.QC_VERSCHOBEN)) return ['Setting', 'Ausgang ' + LAB[trig.to]];
    if (SC_OUT.has(trig.to)) return ['Closing', 'Ausgang ' + LAB[trig.to]];
    if (trig.to === S.LOST || trig.to === S.BLACKLIST) return ['Sonstiges', 'Lost/Blacklist'];
  }
  if (!zustand) return ['Opening', 'vor erstem Termin'];
  const z = zustand.to;
  if (z === S.QC_TERMINIERT) return ['Sonstiges', 'zwischen QC Terminiert und Ausgang (Bestaetigung/Vorbereitung?)'];
  if (z === S.SC_TERMINIERT) return ['Sonstiges', 'zwischen SC Terminiert und Ausgang (Bestaetigung/Vorbereitung?)'];
  if (FU.has(z)) return ['Nachfassung', 'nach ' + LAB[z]];
  if (z === S.QC_NOSHOW || z === S.QC_ABGESAGT || z === S.SC_NOSHOW || z === S.SC_ABGESAGT) return ['Nachfassung', 'nach ' + LAB[z] + ' (Reterminierung)'];
  return ['Sonstiges', 'Status ' + (LAB[z] || 'anderer')];
}
const calls = [];
for (const [lid, l] of Object.entries(require(K + '/leads.json').out)) for (const a of l.acts) {
  if (a._type !== 'Call' || a.date_created < '2026-10-01' || !(a.duration >= 60) || !a.recording_url) continue;
  const person = E.un[a.user_id] || a.user_name || '?'; const [st, warum] = stufe({ ...a, lead_id: lid });
  calls.push({ callId: a.id, leadId: lid, oppIds: [...new Set((tl[lid] || []).map(e => e.opp))], person, imKreis: ACHT.includes(person), datum: E.ymd(a.activity_at || a.date_created), dauer: a.duration, richtung: a.direction, stufe: st, warum });
}
fs.writeFileSync(__dirname + '/stages.json', JSON.stringify(calls));
const inK = calls.filter(c => c.imKreis);
console.log('Aufnahmen ab 60 s gesamt', calls.length, '| von den acht', inK.length, '| andere (nur Kontext)', calls.length - inK.length);
const stufen = ['Opening', 'Setting', 'Closing', 'Nachfassung', 'Sonstiges']; console.log('Person'.padEnd(18) + stufen.map(s => s.padStart(12)).join('') + 'gesamt'.padStart(8));
for (const p of ACHT) { const c = inK.filter(x => x.person === p); console.log(p.padEnd(18) + stufen.map(s => String(c.filter(x => x.stufe === s).length).padStart(12)).join('') + String(c.length).padStart(8)); }
console.log('Summe'.padEnd(18) + stufen.map(s => String(inK.filter(x => x.stufe === s).length).padStart(12)).join('') + String(inK.length).padStart(8));
const w = {}; for (const c of inK.filter(c => c.stufe === 'Sonstiges')) w[c.warum] = (w[c.warum] || 0) + 1; console.log('Sonstiges nach Grund:', JSON.stringify(w));
