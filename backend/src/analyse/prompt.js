// Codier-Prompt und JSON-Schema. Basis ist WOERTLICH der Oktober-Prompt
// (backend/analyse/oktober-2026/transkript/code_lib.js), damit die Codierung mit der Oktober-Basis
// vergleichbar bleibt. Prompt v2 ergaenzt nur zwei Felder am Ende (naechster Schritt: Datum und
// Paraphrase) fuer die Verbleib-Liste; alle anderen Felder und Definitionen sind unveraendert.
const { TAXONOMIE: tax } = require('./basis');

const PROMPT_VERSION = 'v2';
const TAXONOMIE_VERSION = tax.version;

const RULE_IDS = new Set(['B4-02', 'B4-03', 'B4-07', 'B4-08', 'B4-09']);
const gruende = tax.bruchstellen.filter(b => b.id !== 'B3')
  .flatMap(b => b.gruende.map(g => ({ ...g, bs: b.id })))
  .filter(g => !RULE_IDS.has(g.id) && !/^sonstiger/i.test(g.name));
const GRUND_IDS = [...gruende.map(g => g.id), 'SONSTIG'];
const ERGEBNISSE = [...new Set(tax.ergebnisse_je_stufe.flatMap(s => s.werte.map(w => w.wert))), 'kein Ergebnis erkennbar'];
const STUFEN = ['Opening', 'Setting', 'Closing', 'Nachfassung', 'Sonstiges_Bestaetigung', 'Sonstiges_Rueckfrage_Service', 'Sonstiges_Technik_Kurz', 'Sonstiges_Anderes'];
const JNU = { type: 'string', enum: ['ja', 'nein', 'unklar'] };
const JNA = { type: 'string', enum: ['ja', 'nein', 'n.a.'] };
const KONF = { type: 'string', enum: ['hoch', 'mittel', 'niedrig'] };

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['stufe', 'ergebnis', 'erfolg', 'konfidenz', 'gruende', 'entscheider_im_gespraech', 'bedarf_bestaetigt', 'naechster_schritt_mit_datum',
    'ma_fragte_aktiv_nach_termin', 'abschlussfrage_gestellt', 'closing_aktiv_angeboten', 'termin_verbindlich_fixiert', 'abschluss_aktiv_versucht',
    'warnsignale_b4', 'einzeiler', 'widerspruch_zusammenfassung', 'naechster_schritt_datum', 'naechster_schritt'],
  properties: {
    stufe: { type: 'string', enum: STUFEN }, ergebnis: { type: 'string', enum: ERGEBNISSE }, erfolg: JNA, konfidenz: KONF,
    gruende: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'freitext', 'konfidenz'],
      properties: { id: { type: 'string', enum: GRUND_IDS }, freitext: { type: 'string' }, konfidenz: KONF } } },
    entscheider_im_gespraech: JNU, bedarf_bestaetigt: JNU,
    naechster_schritt_mit_datum: { type: 'string', enum: ['ja', 'nein'] }, ma_fragte_aktiv_nach_termin: { type: 'string', enum: ['ja', 'nein'] },
    abschlussfrage_gestellt: JNA, closing_aktiv_angeboten: JNA, termin_verbindlich_fixiert: JNA, abschluss_aktiv_versucht: JNA,
    warnsignale_b4: { type: 'array', items: { type: 'string', enum: ['B4-01', 'B4-04', 'B4-05', 'B4-06'] } },
    einzeiler: { type: 'string' }, widerspruch_zusammenfassung: { type: 'string', enum: ['ja', 'nein'] },
    naechster_schritt_datum: { type: 'string' },
    naechster_schritt: { type: 'string' },
  },
};

const taxText = tax.bruchstellen.filter(b => b.id !== 'B3').map(b => `${b.id} ${b.name}\n` + b.gruende
  .filter(g => !RULE_IDS.has(g.id) && !/^sonstiger/i.test(g.name)).map(g => `  ${g.id} ${g.name}: ${g.definition}`).join('\n')).join('\n\n');
const ergText = tax.ergebnisse_je_stufe.map(s => `${s.stufe}: ` + s.werte.map(w => `"${w.wert}" (${w.definition})`).join('; ')).join('\n');

const SYSTEM_OKTOBER = `Du codierst aufgezeichnete B2B-Vertriebsgespraeche eines Dienstleisters fuer Personalgewinnung (Kandidatenprofile, Einstellungsgarantie, Marke HiOffice). Sprecher sind als "MA" (Mitarbeiter) und "Kunde" markiert. Du bekommst Kontext aus dem CRM, eine automatische Zusammenfassung (zweite Quelle) und das Transkript. Bei Widerspruch zwischen Zusammenfassung und Transkript zaehlt das Transkript (dann widerspruch_zusammenfassung = ja). Statusangaben sind nur Kontext: codiere, was im Gespraech passiert.

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

// Prompt v2: nur Ergaenzung, nichts von oben geaendert.
const SYSTEM = SYSTEM_OKTOBER + `

NAECHSTER SCHRITT (ergaenzt ab Prompt v2, fuer alle Stufen):
- naechster_schritt_datum: Datum des am Ende vereinbarten naechsten Kontakts (Termin, Rueckruf, Entscheidungsfrist) im Format JJJJ-MM-TT. Relative Angaben ("naechsten Dienstag", "in zwei Wochen", "Anfang Dezember" = erster Werktag des Monats) rechnest du vom Gespraechsdatum aus um. Ohne vereinbarten Zeitpunkt: leerer String. Muss zu naechster_schritt_mit_datum passen (leer genau dann, wenn dort nein steht).
- naechster_schritt: was als naechster Schritt vereinbart wurde, paraphrasiert in hoechstens 15 Woertern, ohne Namen (z. B. "Kunde meldet sich nach interner Abstimmung", "Sales Call mit Inhaber am Termin"). Ohne naechsten Schritt: "keiner vereinbart".`;

const WOCHENTAG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

/** Zusammenhaengende Zeilen desselben Sprechers zusammenfassen (merge() in code_lib.js). */
function transkriptText(zeilen) {
  const out = [];
  for (const [w, t] of zeilen) {
    if (out.length && out[out.length - 1][0] === w) out[out.length - 1][1] += ' ' + t;
    else out.push([w, t]);
  }
  return out.map(([w, t]) => `${w}: ${t}`).join('\n');
}

function userText({ kontext, summary, dauerSek, quelle, datum, zeilen }) {
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const tag = WOCHENTAG[new Date(datum + 'T12:00:00Z').getUTCDay()];
  return `Kontext (nicht Quelle der Wahrheit): ${kontext}\nGespraechsdatum: ${datum} (${tag}).\nZusammenfassung (zweite Quelle): ${summary ? summary.replace(/\s+/g, ' ').slice(0, 1500) : '(keine)'}\nDauer: ${mmss(dauerSek || 0)} Minuten. Quelle: ${quelle === 'fireflies' ? 'Videocall (Sales Call)' : 'Telefonat'}.\n\nTranskript:\n${transkriptText(zeilen)}`;
}

module.exports = { SYSTEM, SYSTEM_OKTOBER, SCHEMA, GRUND_IDS, gruende, ERGEBNISSE, STUFEN, PROMPT_VERSION, TAXONOMIE_VERSION, userText, RULE_IDS };
