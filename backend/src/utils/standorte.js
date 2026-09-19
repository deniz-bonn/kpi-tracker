// ── Standort-Gruppen für Filter ──────────────────────────────────────────────
//
// SPIEGEL-DATEI: Inhalt und Semantik muessen mit frontend/src/utils/standorte.js uebereinstimmen.
// Getrennt, weil das Frontend ESM und das Backend CommonJS ist — dasselbe Muster und derselbe
// Warnhinweis wie bei rollen.js.
//
// REINE FILTER-DARSTELLUNG, KEINE DATENÄNDERUNG: Bonn und Braunschweig bleiben in den Daten
// zwei getrennte Standorte (employees.standort). Sie werden hier nur als EINE Filter-Option
// angeboten, weil die Auswertung sie als "Deutschland" zusammen betrachtet. Es gibt kein neues
// Standort-Feld und keine Gruppe in der Datenbank.
//
// Maßgeblich ist immer der Standort des MITARBEITERS (employees.standort des Meeting-Führers
// bzw. des Deal-KAM über kam_id) — niemals die Company. Ein Bonner KAM mit einem Schweizer
// Kunden zählt nach Bonn.
const STANDORT_GRUPPEN = [
  { key: 'de', label: 'Bonn / Braunschweig', standorte: ['Bonn', 'Braunschweig'] },
  { key: 'at', label: 'Österreich',          standorte: ['Österreich'] },
  { key: 'ch', label: 'Schweiz',             standorte: ['Schweiz'] },
];

const standorteVonGruppe   = (key) => STANDORT_GRUPPEN.find(g => g.key === key)?.standorte || null;
const standortGruppeLabel  = (key) => STANDORT_GRUPPEN.find(g => g.key === key)?.label || '';

// Kein Filter gesetzt -> alles passt. Sonst muss der Standort in der Gruppe liegen; ein
// Mitarbeiter OHNE Standort fällt bei jedem konkreten Filter heraus — genau wie im VL-Bereich.
const passtZuStandortGruppe = (standort, key) =>
  !key || (standorteVonGruppe(key) || []).includes(standort);

/**
 * SQL-Fragment `<spalte> IN ('Bonn','Braunschweig')` fuer eine Gruppe.
 * Die Standort-Namen stehen als Literale im Modul, nicht aus Nutzereingaben — deshalb ist die
 * Interpolation hier sicher. Ein unbekannter Schluessel liefert null; der Aufrufer MUSS das
 * als Fehler behandeln und darf nicht still ungefiltert weiterlaufen.
 */
function standortInSql(key, spalte) {
  const liste = standorteVonGruppe(key);
  if (!liste) return null;
  return `${spalte} IN (${liste.map(s => `'${s.replace(/'/g, "''")}'`).join(',')})`;
}

module.exports = { STANDORT_GRUPPEN, standorteVonGruppe, standortGruppeLabel,
  passtZuStandortGruppe, standortInSql };
