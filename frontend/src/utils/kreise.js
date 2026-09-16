// ── Abrechnungskreise (Frontend-Spiegel von backend/src/utils/kreise.js) ─────
//
// SPIEGEL-DATEI: Schluessel und Labels muessen mit dem Backend uebereinstimmen.
// Getrennt, weil das Frontend ESM und das Backend CommonJS ist. Kommt ein Kreis dazu,
// muss er in BEIDEN Dateien stehen — das Backend lehnt unbekannte Kreise mit 400 ab,
// ein hier vergessener Kreis faellt also laut auf statt still.
//
// Vorher stand die Kreis-Liste im Frontend an vier Stellen verstreut (Provisionen.jsx,
// MeineProvision.jsx, MeinDashboard.jsx, Settings.jsx). Die MeinDashboard-Variante war eine
// Ternary ohne Default und beschriftete JEDEN unbekannten Kreis als "Österreich".

export const KREISE = [
  {
    key: 'bonn', label: 'Bonn',
    zyklus: 'Abrechnungszeitraum 21.–20.',
    zyklusLang: 'Abrechnungszeitraum jeweils 21. des Vormonats bis 20. des Monats.',
    hint: 'Bonn: klassische %-Sätze + Team-Staffel (Zyklus 21.–20.).',
  },
  {
    key: 'braunschweig', label: 'Braunschweig',
    zyklus: 'Abrechnung je Kalendermonat · Opener 125 € je Sales Call',
    zyklusLang: 'Abrechnungszeitraum: voller Kalendermonat (1. bis Monatsende).',
    hint: 'Braunschweig (Kalendermonat): Opener = 125 € Fixbetrag je Sales Call (strukturell, nicht hier editierbar). Setter/Closer/Pauschale wie unten.',
  },
  {
    key: 'oesterreich', label: 'Österreich',
    zyklus: 'Abrechnung je Kalendermonat · Opener/Setter-Staffel · Closer 7 %/5 %',
    zyklusLang: 'Abrechnungszeitraum: voller Kalendermonat (1. bis Monatsende).',
    hint: 'Österreich (Kalendermonat): Opener/Setter über Staffeltabelle (strukturell). Editierbar hier: Closer 7 % (Auto-VL) = „Closer hoch", 5 % (ohne) = „Closer Basis".',
  },
  {
    key: 'bestandskunden', label: 'Bestandskundenvertrieb',
    zyklus: 'Abrechnung je Kalendermonat · Upsell 3 % · Verlängerung 2 % · Auszahlung im Folgemonat',
    zyklusLang: 'Abrechnungszeitraum: voller Kalendermonat (1. bis Monatsende), Auszahlung im Folgemonat.',
    hint: 'Bestandskundenvertrieb (Kalendermonat): Empfänger ist der KAM des Deals. Upsell = 3 % vom AE eines gewonnenen Bestandskunden-Deals, Verlängerung = 2 % vom AE einer gewonnenen Verlängerung. Abrechnungsachse ist der Gewonnen-Monat.',
  },
];

export const KREIS_MAP = Object.fromEntries(KREISE.map((k) => [k.key, k]));
export const kreisLabel = (key) => KREIS_MAP[key]?.label || key || '—';
export const kreisZyklus = (key) => KREIS_MAP[key]?.zyklusLang || '';
// Kalendermonats-Kreise lassen sich zu EINEM Lohnlauf je Monat zusammenfassen (Sammelexport);
// Bonn bleibt wegen des 21.–20.-Zyklus aussen vor.
export const KALENDERMONAT_KREISE = KREISE.filter((k) => k.key !== 'bonn').map((k) => k.key);
