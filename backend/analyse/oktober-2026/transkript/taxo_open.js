const L = require('./lib'); const fs = require('fs'); const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');
const stages = require('./stages.json'); const zu = require('./ff/zuordnung.json'); const kl = Object.fromEntries(require('./ff/klassen.json').map(x => [x.id, x]));
const client = new Anthropic();
const pick = (stufe, n, seed, personen) => { const pool = stages.filter(c => c.imKreis && c.stufe === stufe && (!personen || personen.includes(c.person))); const byP = {}; for (const c of L.shuffle(pool, seed)) (byP[c.person] ||= []).push(c);
  const out = []; const ps = Object.keys(byP); for (let i = 0; out.length < n && i < 50; i++) { const p = ps[i % ps.length]; const c = byP[p].shift(); if (c) out.push(c); } return out; };
const sample = [
  ...pick('Opening', 16, 11, ['Markus Bauer', 'Andreas Buharin', 'Brian Groten', 'Mikail Kotaman', 'Dominik Bous']),
  ...pick('Setting', 12, 12, ['Markus Bauer', 'Andreas Buharin', 'Clemens Näkel', 'Brian Groten']),
  ...pick('Nachfassung', 10, 13), ...pick('Sonstiges', 6, 14, ['Clemens Näkel', 'Markus Bauer', 'Brian Groten', 'Andreas Buharin']), ...pick('Closing', 4, 15),
].map(c => ({ quelle: 'close', id: c.callId, leadId: c.leadId, person: c.person, stufeH: c.stufe, warum: c.warum, datum: c.datum }));
const ff = L.shuffle(zu.filter(z => z.stufe === 'sicher' && z.leadId), 16).slice(0, 12).map(z => ({ quelle: 'fireflies', id: z.ffId, leadId: z.leadId, person: null, stufeH: 'Closing', warum: 'Fireflies-Videocall, zugeordnet', datum: z.datum }));
const alle = [...sample, ...ff];
const STUFEN = `Stufen: Opening = Erstgespraech/Kaltakquise bis ein Termin vereinbart wird oder nicht; Setting = Qualifizierungsgespraech (QC) mit einem Interessenten, an dessen Ende ein Sales-Call-Termin (SC) steht oder nicht; Closing = Sales Call/Beratungsgespraech mit Angebot und Abschlussversuch; Nachfassung = Telefonat nach einem Follow-up/Absage/No-Show; Sonstiges = Terminbestaetigung, Vorbereitung, Technik, Kundenservice.`;
const SYS = `Du wertest aufgezeichnete B2B-Vertriebsgespraeche eines Dienstleisters (Marke HiOffice) aus. Sprecher sind als "MA" (Mitarbeiter) und "Kunde" markiert. ${STUFEN}
Ziel dieses Schritts ist OFFENE Codierung: beschreibe in eigenen Worten, woran es im Gespraech lag, dass der Funnel an dieser Stelle weiterlief oder abbrach. Es zaehlt nur der Gespraechsinhalt; Statusangaben sind Kontext, die Zusammenfassung ist eine zweite Quelle (bei Widerspruch gilt das Transkript).
Strikte Regeln: Nenne keine Namen von Kunden, Firmen oder Personen und gib keine woertlichen Kundenzitate wieder; paraphrasiere. Nenne hoechstens drei Gruende. Gruende sollen kurze, wiederverwendbare Themen sein (z. B. "Entscheider nicht im Gespraech"), keine Einzelfall-Beschreibungen.`;
const schema = { type: 'object', additionalProperties: false, required: ['stufe', 'ergebnis', 'entscheider_im_gespraech', 'bedarf_erkannt', 'naechster_schritt_mit_datum', 'ma_fragte_aktiv_nach_termin', 'gruende', 'einzeiler', 'widerspruch_zusammenfassung'], properties: {
  stufe: { type: 'string', enum: ['Opening', 'Setting', 'Closing', 'Nachfassung', 'Sonstiges'] }, ergebnis: { type: 'string' },
  entscheider_im_gespraech: { type: 'string', enum: ['ja', 'nein', 'unklar'] }, bedarf_erkannt: { type: 'string', enum: ['ja', 'nein', 'unklar'] },
  naechster_schritt_mit_datum: { type: 'string', enum: ['ja', 'nein'] }, ma_fragte_aktiv_nach_termin: { type: 'string', enum: ['ja', 'nein'] },
  gruende: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['thema', 'beleg'], properties: { thema: { type: 'string' }, beleg: { type: 'string' } } } },
  einzeiler: { type: 'string' }, widerspruch_zusammenfassung: { type: 'string' } } };
const sleep = L.sleep; const res = []; const leaks = []; let i = 0, kosten = { in: 0, out: 0 };
async function one(s) {
  const k = L.leadKontext(s.leadId);
  const d = s.quelle === 'close' ? await L.closeCall(s.id) : await L.ffMeeting(s.id);
  if (!d) return;
  const ma = s.quelle === 'close' ? d.ma : d.ma; s.person = s.person || ma; s.dauer = d.dauer; s.redeanteil = d.redeanteil ?? d.redeanteilMA;
  const user = `Kontext (nicht Quelle der Wahrheit): Stufe laut Zeitlinie: ${s.stufeH} (${s.warum}). Status der Opportunity heute: ${k.statusHeute || '?'}. Setting-Ausgang: ${k.setting || '-'}; Sales-Call-Ausgang: ${k.sc || '-'}; gewonnen: ${k.gewonnen ? 'ja' : 'nein'}.\nClose-/Fireflies-Zusammenfassung: ${d.summary ? d.summary.replace(/\s+/g, ' ').slice(0, 1500) : '(keine)'}\n\nTranskript:\n${d.text}`;
  for (let a = 0; a < 4; a++) { try {
    const r = await client.messages.create({ model: 'claude-opus-5-5', max_tokens: 3000, system: SYS, output_config: { effort: 'medium', format: { type: 'json_schema', schema } }, messages: [{ role: 'user', content: user }] });
    kosten.in += r.usage.input_tokens; kosten.out += r.usage.output_tokens;
    const txt = r.content.filter(b => b.type === 'text').map(b => b.text).join(''); const j = JSON.parse(txt);
    const blob = JSON.stringify(j).toLowerCase(); const namen = [...(d.kundenNamen || []), k.leadName || ''].flatMap(n => n.toLowerCase().split(/[\s,.&-]+/)).filter(t => t.length >= 5 && !/gmbh|gesellschaft|verwaltung|service/.test(t));
    const treffer = namen.filter(t => blob.includes(t)); if (treffer.length) leaks.push({ id: s.id, n: treffer.length });
    res.push({ ...s, ...j }); return;
  } catch (e) { if (a === 3) { console.log('Fehler', s.id.slice(0, 14), e.status || '', (e.message || '').slice(0, 100)); return; } await sleep(2500 * (a + 1)); } }
}
(async () => { const q = [...alle]; await Promise.all([1, 2, 3, 4, 5].map(async () => { while (q.length) await one(q.shift()); }));
  fs.writeFileSync(__dirname + '/taxo/open_codes.json', JSON.stringify(res));
  console.log('Stichprobe', alle.length, '| codiert', res.length, '| Namens-Treffer in Ausgabe', leaks.length, '| Tokens in/out', kosten.in, '/', kosten.out, '| ca. $', ((kosten.in * 4 + kosten.out * 20) / 1e6).toFixed(2));
  const c = {}; for (const r of res) c[r.stufe] = (c[r.stufe] || 0) + 1; console.log('Stufen laut Inhalt', JSON.stringify(c)); const ab = res.filter(r => r.stufe !== r.stufeH).length; console.log('Stufe laut Inhalt weicht von Zeitlinie ab:', ab, 'von', res.length);
})();
