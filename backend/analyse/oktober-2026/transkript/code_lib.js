// Gemeinsame Codierung: Prompt, Schema, Fall-Aufbau (Transkripte nur im Speicher), Kosten.
const L = require('./lib'); const fs = require('fs'); const E = L.E;
const tax = require('./taxo/taxonomie.json');
const RULE_IDS = new Set(['B4-02', 'B4-03', 'B4-07', 'B4-08', 'B4-09']);   // regelbasiert bzw. nicht aus Transkript
const gruende = tax.bruchstellen.filter(b => b.id !== 'B3').flatMap(b => b.gruende.map(g => ({ ...g, bs: b.id }))).filter(g => !RULE_IDS.has(g.id) && !/^sonstiger/i.test(g.name));
const GRUND_IDS = [...gruende.map(g => g.id), 'SONSTIG'];
const ERGEBNISSE = [...new Set(tax.ergebnisse_je_stufe.flatMap(s => s.werte.map(w => w.wert))), 'kein Ergebnis erkennbar'];
const STUFEN = ['Opening', 'Setting', 'Closing', 'Nachfassung', 'Sonstiges_Bestaetigung', 'Sonstiges_Rueckfrage_Service', 'Sonstiges_Technik_Kurz', 'Sonstiges_Anderes'];
const JNU = { type: 'string', enum: ['ja', 'nein', 'unklar'] }, JNA = { type: 'string', enum: ['ja', 'nein', 'n.a.'] }, KONF = { type: 'string', enum: ['hoch', 'mittel', 'niedrig'] };
const SCHEMA = { type: 'object', additionalProperties: false, required: ['stufe', 'ergebnis', 'erfolg', 'konfidenz', 'gruende', 'entscheider_im_gespraech', 'bedarf_bestaetigt', 'naechster_schritt_mit_datum', 'ma_fragte_aktiv_nach_termin', 'abschlussfrage_gestellt', 'closing_aktiv_angeboten', 'termin_verbindlich_fixiert', 'abschluss_aktiv_versucht', 'warnsignale_b4', 'einzeiler', 'widerspruch_zusammenfassung'], properties: {
  stufe: { type: 'string', enum: STUFEN }, ergebnis: { type: 'string', enum: ERGEBNISSE }, erfolg: JNA, konfidenz: KONF,
  gruende: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'freitext', 'konfidenz'], properties: { id: { type: 'string', enum: GRUND_IDS }, freitext: { type: 'string' }, konfidenz: KONF } } },
  entscheider_im_gespraech: JNU, bedarf_bestaetigt: JNU, naechster_schritt_mit_datum: { type: 'string', enum: ['ja', 'nein'] }, ma_fragte_aktiv_nach_termin: { type: 'string', enum: ['ja', 'nein'] },
  abschlussfrage_gestellt: JNA, closing_aktiv_angeboten: JNA, termin_verbindlich_fixiert: JNA, abschluss_aktiv_versucht: JNA,
  warnsignale_b4: { type: 'array', items: { type: 'string', enum: ['B4-01', 'B4-04', 'B4-05', 'B4-06'] } },
  einzeiler: { type: 'string' }, widerspruch_zusammenfassung: { type: 'string', enum: ['ja', 'nein'] } } };
const taxText = tax.bruchstellen.filter(b => b.id !== 'B3').map(b => `${b.id} ${b.name}\n` + b.gruende.filter(g => !RULE_IDS.has(g.id) && !/^sonstiger/i.test(g.name)).map(g => `  ${g.id} ${g.name}: ${g.definition}`).join('\n')).join('\n\n');
const ergText = tax.ergebnisse_je_stufe.map(s => `${s.stufe}: ` + s.werte.map(w => `"${w.wert}" (${w.definition})`).join('; ')).join('\n');
const SYSTEM = `Du codierst aufgezeichnete B2B-Vertriebsgespraeche eines Dienstleisters fuer Personalgewinnung (Kandidatenprofile, Einstellungsgarantie, Marke HiOffice). Sprecher sind als "MA" (Mitarbeiter) und "Kunde" markiert. Du bekommst Kontext aus dem CRM, eine automatische Zusammenfassung (zweite Quelle) und das Transkript. Bei Widerspruch zwischen Zusammenfassung und Transkript zaehlt das Transkript (dann widerspruch_zusammenfassung = ja). Statusangaben sind nur Kontext: codiere, was im Gespraech passiert.

FUNNEL: Opening (Erstgespraech/Kaltakquise bis ein Termin steht oder nicht) -> Setting (Qualifizierungsgespraech "QC"; Ziel: datierter Sales Call "SC") -> Closing (Sales Call/Beratung mit Angebot und Abschlussversuch) -> Nachfassung (Telefonat nach Follow-up, Absage oder No-Show). Weise die Stufe nach INHALT zu. Die "Stufe laut Zeitlinie" ist nur ein Hinweis (ca. jeder achte Call weicht ab). Gespraeche, die keine dieser Stufen sind, ordne einer Sonstiges-Kategorie zu: Sonstiges_Bestaetigung (Terminbestaetigung, Erinnerung, Link/Einladung klaeren), Sonstiges_Rueckfrage_Service (Rueckfragen des Kunden, Kundenservice, Vertragsfragen nach Abschluss), Sonstiges_Technik_Kurz (Technikprobleme, Mailbox-/Warteschleifen-Reste, Gespraech ohne Inhalt), Sonstiges_Anderes.

ERGEBNISWERTE je Stufe (waehle genau einen; passt keiner: "kein Ergebnis erkennbar"):
${ergText}
erfolg = ja, wenn die Stufe ihr Ziel erreicht hat: Opening -> "QC terminiert" oder "Direkter SC terminiert"; Setting -> "SC terminiert"; Closing -> "Gewonnen / muendliche Zusage"; Nachfassung -> "Erreicht mit neuem Termin" oder "Abschluss vorbereitet". Sonstiges -> n.a.

GRUENDE (nur bei erfolg = nein; bis zu zwei, der wichtigste zuerst; erfolg = ja oder Sonstiges -> leere Liste). Waehle aus dem Block der passenden Bruchstelle: Opening ohne Termin -> B1; Setting ohne SC -> B2; Closing ohne Abschluss -> B5; Nachfassung ohne Fortschritt -> B6. Passt kein Grund, nimm id "SONSTIG" und beschreibe ihn in "freitext" in wenigen Worten (ohne Namen); bei allen anderen Gruenden bleibt freitext leer. Jeder Grund bekommt eine eigene Konfidenz.
${taxText}

VERHALTENSFELDER (immer ausfuellen, "n.a." wenn die Stufe nicht passt; positive Formulierung, ja = Verhalten ist erfolgt):
- abschlussfrage_gestellt (Opening/Setting): MA hat aktiv um einen konkreten Termin gebeten. (nein = B1-09)
- closing_aktiv_angeboten (nur Setting): MA hat von sich aus den Sales Call/Closing-Termin angeboten und Slots genannt. (nein = B2-13)
- termin_verbindlich_fixiert (Opening/Setting): Datum UND Uhrzeit abgestimmt, nicht nur "melde mich". (nein = B2-14)
- abschluss_aktiv_versucht (nur Closing): MA hat nach Angebot/Preis aktiv um die Entscheidung bzw. Unterschrift gebeten. (nein = B5-13)
- naechster_schritt_mit_datum (alle Stufen): am Ende ist ein naechster Kontakt mit Datum fixiert. (nein = B5-15)
- ma_fragte_aktiv_nach_termin: MA hat irgendwann im Gespraech aktiv nach dem naechsten Termin gefragt.
- entscheider_im_gespraech: Person mit Freigabebefugnis sprach mit; bedarf_bestaetigt: Kunde bestaetigt eine konkrete Vakanz.
warnsignale_b4: NUR wenn der Kontext sagt, dass der folgende Sales Call geplatzt ist und dies ein Setting-Gespraech ist: Warnsignale aus {B4-01 Entscheider nicht fest zugesagt, B4-04 Kunde zoegerlich/ungeloeste Vorbehalte, B4-05 Termin vom Setter gedrueckt, B4-06 Format/Kanal ungeklaert}. Sonst leere Liste.

KONFIDENZ gesamt: hoch = Stufe und Ergebnis eindeutig belegt; mittel = plausibel, aber interpretiert; niedrig = Transkript zu kurz, unvollstaendig, nur ein Gespraechsteil oder mehrdeutig.

STRIKT: Keine Namen von Kunden, Firmen oder Personen und keine woertlichen Kundenzitate in der Ausgabe. "einzeiler" = ein paraphrasierter Satz (max. 35 Woerter) ueber Verlauf und Ausgang, ohne Namen; Mitarbeiter heissen im Text "der MA".`;
const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const merge = (lines) => { const out = []; for (const [w, t] of lines) { if (out.length && out[out.length - 1][0] === w) out[out.length - 1][1] += ' ' + t; else out.push([w, t]); } return out.map(([w, t]) => `${w}: ${t}`).join('\n'); };
const oppFuerLead = (leadId, ts) => { const recs = (E.OPPS.filter(r => r.o.lead_id === leadId)).sort((a, b) => a.o.date_created < b.o.date_created ? -1 : 1); if (!recs.length) return null; return [...recs].reverse().find(r => new Date(r.o.date_created).getTime() <= ts) || recs[0]; };
function kontext(c, rec) {
  const st = rec ? rec.termine.filter(t => t.art === 'setting') : [], sc = rec ? rec.termine.filter(t => t.art === 'closing') : [];
  const lastSt = st[st.length - 1], lastSc = sc[sc.length - 1];
  let b4 = '';
  if (lastSt && lastSc && lastSc.ausgang === 'nicht stattgefunden') b4 = ' Der auf das Setting folgende Sales Call ist GEPLATZT (No-Show/abgesagt) — falls dies ein Setting-Gespraech ist, pruefe die Warnsignale B4.';
  return `Stufe laut Zeitlinie: ${c.stufeH} (${c.warum}). Richtung: ${c.richtung === 'inbound' ? 'eingehend' : 'ausgehend'}. Status der Opportunity heute: ${rec ? rec.o.status_label : '?'}. Setting-Ausgang: ${lastSt ? lastSt.ausgang + (lastSt.ausgangStatus ? ' (' + lastSt.ausgangStatus + ')' : '') : '-'}; Sales-Call-Ausgang: ${lastSc ? lastSc.ausgang + (lastSc.ausgangStatus ? ' (' + lastSc.ausgangStatus + ')' : '') : '-'}; gewonnen: ${rec && E.wonNach((lastSc || lastSt || { rest: [] }).rest) ? 'ja' : 'nein'}.${b4}`;
}
// Fall aufbauen (Netzwerk: nur lesen). Rueckgabe: { customId, params, meta, namen } oder null.
async function baueFall(c, model, effort) {
  let d;
  if (c.quelle === 'fireflies') d = await L.ffMeeting(c.id); else d = await L.closeCall(c.callId);
  if (!d) return null;
  const T = new Date(c.zeit || `${c.datum}T12:00:00Z`).getTime(); const rec = oppFuerLead(c.leadId, T);
  let text;
  if (c.quelle === 'fireflies') { text = d.text.split('\n').map(l => { const m = /^\[[0-9:]+\] (MA|Kunde): (.*)$/.exec(l); return m ? [m[1], m[2]] : ['Kunde', l]; }); }
  else text = d.text.split('\n').map(l => { const m = /^\[[0-9:]+\] (MA|Kunde): (.*)$/.exec(l); return m ? [m[1], m[2]] : ['Kunde', l]; });
  const body = merge(text);
  const user = `Kontext (nicht Quelle der Wahrheit): ${kontext(c, rec)}\nZusammenfassung (zweite Quelle): ${d.summary ? d.summary.replace(/\s+/g, ' ').slice(0, 1500) : '(keine)'}\nDauer: ${mmss(d.dauer || 0)} Minuten. Quelle: ${c.quelle === 'fireflies' ? 'Videocall (Sales Call)' : 'Telefonat'}.\n\nTranskript:\n${body}`;
  const customId = (c.quelle === 'fireflies' ? 'ff_' : 'cl_') + String(c.quelle === 'fireflies' ? c.id : c.callId).replace(/[^A-Za-z0-9_-]/g, '').slice(-40);
  const params = { model, max_tokens: 4000, system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }], output_config: { effort, format: { type: 'json_schema', schema: SCHEMA } }, messages: [{ role: 'user', content: user }] };
  const meta = { customId, quelle: c.quelle, callId: c.callId || null, ffId: c.quelle === 'fireflies' ? c.id : null, leadId: c.leadId, oppId: rec ? rec.o.id : null, person: c.person || d.ma, mitsprecher: d.sprecher || null, datum: c.datum, dauer: d.dauer, redeanteil: d.redeanteil ?? d.redeanteilMA, stufeH: c.stufeH, warum: c.warum, zeichen: body.length, kundenNamen: d.kundenNamen || [], leadName: rec ? rec.o.lead_name : null };
  return { customId, params, meta };
}
const PREIS = { 'claude-opus-5-5': [4, 20], 'claude-sonnet-5-5': [2, 10] };
function kosten(model, u, batch) { const [i, o] = PREIS[model]; const f = batch ? 0.5 : 1; const cr = (u.cache_read_input_tokens || 0), cw = (u.cache_creation_input_tokens || 0), inp = (u.input_tokens || 0);
  return f * ((inp * i + cw * i * 1.25 + cr * i * 0.1 + (u.output_tokens || 0) * o) / 1e6); }
function logKosten(label, model, usage, batch) { const f = __dirname + '/run/costs.json'; const a = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : [];
  a.push({ label, model, batch: !!batch, in: usage.input_tokens || 0, out: usage.output_tokens || 0, cacheRead: usage.cache_read_input_tokens || 0, cacheWrite: usage.cache_creation_input_tokens || 0, usd: +kosten(model, usage, batch).toFixed(4) }); fs.writeFileSync(f, JSON.stringify(a)); }
module.exports = { SYSTEM, SCHEMA, GRUND_IDS, gruende, baueFall, kosten, logKosten, oppFuerLead, RULE_IDS, tax };
