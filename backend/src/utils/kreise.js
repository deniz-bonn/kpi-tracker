// ── Abrechnungskreise: DIE EINE WAHRHEIT ─────────────────────────────────────
//
// Vorher stand die Kreis-Liste als Literal an acht Stellen (Engine 2x, Route 1x, Frontend 5x).
// Jede vergessene Stelle fiel STILL auf 'bonn' zurueck oder beschriftete den Kreis falsch —
// z.B. zeigte MeinDashboard einen unbekannten Kreis als "Österreich" an. Deshalb: eine Quelle,
// und unbekannte Kreise FEHLERN, statt sich auf Bonn zu retten. Ein Tippfehler im Kreis-Schluessel
// muss laut scheitern, nicht leise die Bonner Zahlen zeigen (oder, bei PUT /config, ueberschreiben).
//
// Ein Kreis hat zwei unabhaengige Eigenschaften, die frueher vermischt waren:
//   quelle — aus welcher Deal-Tabelle er gespeist wird ('nk' | 'bk')
//   achse  — welches Feld die Abrechnungsperiode bestimmt
//
// Die NK-Kreise sind eine STANDORT-Dimension: der Kreis eines Beteiligten folgt aus
// employees.standort, ein Deal kann in mehrere Kreise streuen. 'bestandskunden' ist das NICHT —
// er ist eine QUELLEN-Dimension: Empfaenger ist der KAM des Deals, unabhaengig von dessen
// Standort. Darum hat er standort:null und taucht in kreisFor() nicht auf. Eine Person kann
// deshalb in zwei Kreisen Provision haben (z.B. Closer-KAM: NK ueber den Standort, BK ueber
// seine Bestandskunden-Deals) — die werden strikt getrennt gefuehrt, nie verrechnet.

const KREISE = {
  bonn: {
    key: 'bonn', label: 'Bonn', standort: 'Bonn',
    quelle: 'nk', zyklus: '21-20', achse: 'gewonnen_datum',
    zyklusText: 'Abrechnungszeitraum 21.–20.',
  },
  braunschweig: {
    key: 'braunschweig', label: 'Braunschweig', standort: 'Braunschweig',
    quelle: 'nk', zyklus: 'kalendermonat', achse: 'gewonnen_datum',
    zyklusText: 'Abrechnung je Kalendermonat · Opener 125 € je Sales Call',
  },
  oesterreich: {
    key: 'oesterreich', label: 'Österreich', standort: 'Österreich',
    quelle: 'nk', zyklus: 'kalendermonat', achse: 'gewonnen_datum',
    zyklusText: 'Abrechnung je Kalendermonat · Opener/Setter Staffel · Closer 7 % / 5 %',
  },
  bestandskunden: {
    key: 'bestandskunden', label: 'Bestandskundenvertrieb', standort: null,
    quelle: 'bk', zyklus: 'kalendermonat', achse: 'gewonnen_monat',
    zyklusText: 'Abrechnung je Kalendermonat · Upsell 3 % · Verlängerung 2 % · Auszahlung im Folgemonat',
  },
};

const KREIS_KEYS   = Object.keys(KREISE);
const NK_KREISE    = KREIS_KEYS.filter(k => KREISE[k].quelle === 'nk');
const BK_KREISE    = KREIS_KEYS.filter(k => KREISE[k].quelle === 'bk');
// Kreise, deren Periode ein voller Kalendermonat ist — die lassen sich zu EINEM Lohnlauf je
// Monat zusammenfassen (Sammelexport). Bonn bleibt wegen des 21.–20.-Zyklus aussen vor.
const KALENDERMONAT_KREISE = KREIS_KEYS.filter(k => KREISE[k].zyklus === 'kalendermonat');

/** standort (employees) -> Kreis-Schluessel. NUR die NK-Standort-Dimension.
 *  Schweiz/null sind bewusst nicht im Modul; 'bestandskunden' hat keinen Standort. */
function kreisFor(standort) {
  const t = NK_KREISE.find(k => KREISE[k].standort === standort);
  return t || null;
}

const istKreis = k => Object.prototype.hasOwnProperty.call(KREISE, k);
const kreisInfo = k => (istKreis(k) ? KREISE[k] : null);
const labelFuer = k => kreisInfo(k)?.label || k;

/**
 * Kreis aus einer Anfrage validieren. Gibt den Schluessel zurueck ODER null.
 * BEWUSST ohne Default: Aufrufer muessen selbst entscheiden, ob "kein Kreis" ein 400 ist
 * (schreibende/exportierende Endpoints) oder "alle Kreise" (reine Listen). Frueher war der
 * Default 'bonn' fest eingebaut — genau das hat den destruktiven PUT /config ermoeglicht.
 */
const pruefeKreis = k => (istKreis(k) ? k : null);

module.exports = { KREISE, KREIS_KEYS, NK_KREISE, BK_KREISE, KALENDERMONAT_KREISE,
  kreisFor, istKreis, kreisInfo, labelFuer, pruefeKreis };
