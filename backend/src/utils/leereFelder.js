// ── Leere Formularfelder auf NULL normalisieren ──────────────────────────────
//
// Ein geleertes Eingabefeld liefert im Browser den LEEREN STRING, nicht null. Fuer TEXT-Spalten
// ist das harmlos, fuer alles andere nicht: Postgres lehnt '' als Zahl, Ganzzahl und Datum ab
// ("invalid input syntax for type numeric: """) — die Route antwortet mit 500 und der Nutzer
// kann einen Wert nicht mehr loeschen, nur noch ueberschreiben.
//
// Unter SQLite faellt das NICHT auf: dort landet '' klaglos in der Spalte. Der Fehler zeigt sich
// also ausschliesslich in Produktion — derselbe Dialekt-Graben wie bei den DATE-Spalten.
// Gemeldet am 21.09.2026 aus dem BK-Team: "AE-Wert leeren und speichern" -> Fehler, Dialog
// bleibt offen.
//
// Die Oberflaeche wandelt leere Zahlen-/Datumsfelder inzwischen selbst in null (DealModal).
// Diese Schicht ist die zweite Verteidigungslinie: API-Aufrufe, Importe und kuenftige Formulare
// duerfen nicht denselben 500er ausloesen koennen.

// Alle Spalten der Deal-Tabellen, die KEIN Text sind. Ein Name, den eine Tabelle nicht kennt,
// kommt dort schlicht nie an — die Liste darf deshalb gemeinsam gefuehrt werden.
const NICHT_TEXT = new Set([
  // Fremdschluessel und Zaehler
  'company_id', 'kam_id', 'closer_id', 'opener_id', 'setter_id', 'employee_id',
  'deal_bk_id', 'deals_vl_id', 'umstellung_deal_bk_id', 'gefuehrt_von',
  'wie_vielt_verlaengerung', 'laufzeit_monate',
  // Betraege
  'angebotswert', 'ae_wert', 'upsale_summe', 'upsale_angenommen_summe',
  'dauervertrag_ae_wert', 'angebotsvolumen', 'angenommenes_volumen',
  // Datumsfelder
  'datum', 'gewonnen_datum', 'gekuendigt_am', 'auslaufend_am', 'dauervertrag_datum',
  'vertragsbeginn', 'ende_laufzeit', 'ende_kuendigungsfrist',
]);

// Verschachtelte Deal-Koerper: die Willkommensmeetings schicken ihr Angebot unter `angebot`,
// die Verlaengerungen ihre Umstellung unter `umstellung`. Ohne diese beiden bliebe genau der
// Nachreich-Pfad auf dem alten Fehler sitzen.
const UNTER_OBJEKTE = ['angebot', 'umstellung'];

/** Setzt leere Strings dieser Felder auf null — IN PLACE, damit auch Leser von req.body es sehen. */
function leereZuNull(body) {
  if (!body || typeof body !== 'object') return body;
  for (const f of NICHT_TEXT) {
    if (body[f] === '') body[f] = null;
  }
  for (const u of UNTER_OBJEKTE) {
    if (body[u] && typeof body[u] === 'object') leereZuNull(body[u]);
  }
  return body;
}

/** Als Express-Middleware: `router.use(normalisiereLeereFelder);` */
const normalisiereLeereFelder = (req, _res, next) => { leereZuNull(req.body); next(); };

module.exports = { NICHT_TEXT, UNTER_OBJEKTE, leereZuNull, normalisiereLeereFelder };
