// ── Leere Formularfelder auf NULL normalisieren ──────────────────────────────
//
// Ein geleertes Eingabefeld liefert im Browser den LEEREN STRING, nicht null. Fuer Text-Spalten
// ist das harmlos, fuer alles andere nicht: Postgres lehnt '' als Zahl, Ganzzahl und Datum ab
// ("invalid input syntax for type numeric: """) — die Route antwortet mit 500 und der Nutzer
// kann einen Wert nicht mehr loeschen oder leer lassen.
//
// UNTER SQLITE FAELLT DAS NICHT AUF: dort landet '' klaglos in der Spalte. Der Fehler zeigt sich
// also ausschliesslich in Produktion — derselbe Dialekt-Graben wie bei den DATE-Spalten.
//
// WARUM DIE LISTE AUS DEM SCHEMA KOMMT, NICHT AUS DER HAND:
// Die erste Fassung dieser Datei trug eine handgepflegte Liste von rund 25 Spaltennamen. Sie
// deckte die Deal-Formulare ab — und liess 110 weitere Nicht-Text-Spalten offen. Der naechste
// Fehlerbericht kam zehn Tage spaeter aus genau dieser Luecke: "Monatsziel laesst sich nicht
// speichern", weil BK- und VL-Ziel leer blieben. Eine Liste, die jemand pflegen muss, hinkt der
// Datenbank immer hinterher. Deshalb fragt diese Schicht das Schema EINMAL beim Start und
// kennt danach jede Spalte, die kein Text ist — auch jede kuenftige.
const db = require('../db');

// Rueckfall, falls die Introspektion scheitert (fruehe Anfrage, Rechte, kaputte Verbindung).
// Deckt die Formulare ab, die am haeufigsten bedient werden; besser als gar nichts.
const RUECKFALL = new Set([
  'company_id', 'kam_id', 'closer_id', 'opener_id', 'setter_id', 'employee_id',
  'deal_bk_id', 'deals_vl_id', 'umstellung_deal_bk_id', 'gefuehrt_von',
  'wie_vielt_verlaengerung', 'laufzeit_monate',
  'angebotswert', 'ae_wert', 'upsale_summe', 'upsale_angenommen_summe', 'dauervertrag_ae_wert',
  'angebotsvolumen', 'angenommenes_volumen',
  'nk_ziel', 'bk_ziel', 'vl_ziel', 'ziel_gesamt', 'ziel_ae',
  'datum', 'gewonnen_datum', 'gekuendigt_am', 'auslaufend_am', 'dauervertrag_datum',
  'vertragsbeginn', 'ende_laufzeit', 'ende_kuendigungsfrist',
]);

// Verschachtelte Deal-Koerper: die Willkommensmeetings schicken ihr Angebot unter `angebot`,
// die Verlaengerungen ihre Umstellung unter `umstellung`.
const UNTER_OBJEKTE = ['angebot', 'umstellung'];

// CHAR/VARCHAR/TEXT bleiben aussen vor: dort ist '' ein gueltiger Wert, und ihn in NULL zu
// verwandeln waere eine stille Bedeutungsaenderung (z.B. monat CHAR(7)).
const TEXT_TYPEN = new Set(['text', 'character varying', 'character', 'boolean', 'json', 'jsonb', 'USER-DEFINED']);

let geladen = null;   // Promise<Set<string>>, einmal pro Prozess

async function spaltenLaden() {
  if (db.dialect === 'postgres') {
    const rows = await db.all(
      `SELECT DISTINCT column_name, data_type FROM information_schema.columns WHERE table_schema='public'`);
    return new Set(rows.filter(r => !TEXT_TYPEN.has(r.data_type)).map(r => r.column_name));
  }
  // SQLite kennt kein information_schema — Tabellen durchgehen und PRAGMA auswerten.
  const tabellen = await db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`);
  const menge = new Set();
  for (const t of tabellen) {
    for (const c of await db.all(`PRAGMA table_info(${t.name})`)) {
      const typ = String(c.type || '').toUpperCase();
      if (!/CHAR|TEXT|CLOB|BLOB|JSON/.test(typ) && typ) menge.add(c.name);
    }
  }
  return menge;
}

async function nichtTextSpalten() {
  if (!geladen) {
    geladen = spaltenLaden().catch(e => {
      console.error('[leereFelder] Schema-Introspektion fehlgeschlagen, nutze Rueckfallliste:', e.message);
      geladen = null;                 // beim naechsten Mal neu versuchen
      return RUECKFALL;
    });
  }
  return geladen;
}

/** Setzt leere Strings dieser Felder auf null — IN PLACE, damit auch Leser von req.body es sehen. */
function leereZuNull(body, spalten) {
  if (!body || typeof body !== 'object') return body;
  for (const f of Object.keys(body)) {
    if (body[f] === '' && spalten.has(f)) body[f] = null;
  }
  for (const u of UNTER_OBJEKTE) {
    if (body[u] && typeof body[u] === 'object') leereZuNull(body[u], spalten);
  }
  return body;
}

/**
 * Als Express-Middleware — EINMAL global in index.js, nicht je Route.
 * Route fuer Route einzuhaengen hat genau den Fehler erzeugt, den diese Datei behebt: die
 * Deal-Routen waren versorgt, die Ziel-Routen nicht, und niemandem fiel es auf, bis es jemand
 * meldete.
 */
const normalisiereLeereFelder = (req, _res, next) => {
  if (!req.body || typeof req.body !== 'object') return next();
  nichtTextSpalten()
    .then(spalten => { leereZuNull(req.body, spalten); next(); })
    .catch(() => { leereZuNull(req.body, RUECKFALL); next(); });
};

module.exports = { RUECKFALL, UNTER_OBJEKTE, leereZuNull, nichtTextSpalten, normalisiereLeereFelder };
