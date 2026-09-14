// Zwei Sichten auf denselben Umsatz — beide richtig, sie beantworten verschiedene Fragen.
//
// Die Bereichsseiten (VL, BK) gruppieren nach `monat`: dem Monat, in dem die Verlängerung bzw.
// das Angebot fällig war — eine Kohorte. Die Monatsübersicht auf dem Dashboard gruppiert nach
// `gewonnen_monat`: dem Monat des Abschlusses. Ein Deal, der im August fällig war und im
// September abgeschlossen wurde, steht deshalb auf der Bereichsseite im August und in der
// Monatsübersicht im September. Das ist kein Fehler, sondern der Unterschied zwischen
// "was war in diesem Monat dran" und "was haben wir in diesem Monat geholt".
//
// Für Provisionen und AE-Ziele gilt der Abschlussmonat (KONZEPT.md §7).
//
// Anlass: Diskrepanz-Meldung Stefan Morawitz, 11.09.2026 (VL Österreich Sep-26: 114.300 € auf
// der VL-Seite gegen 124.100 € in der Monatsübersicht). Alle Texte hier zentral, damit eine
// Formulierungsänderung nur eine Stelle kostet.

const VERWEIS_UMSEITIG = 'Beide Zahlen sind richtig und können auseinanderliegen.';

// Bereichsseiten (Kohorte nach Fälligkeitsmonat)
export const SICHT_KOHORTE_VL =
  'Kohorte nach VL-Monat: alle Verlängerungen, die in diesem Monat fällig waren und realisiert '
  + 'wurden — unabhängig davon, wann der Abschluss kam. Die Monatsübersicht auf dem Dashboard '
  + `zählt dagegen nach Abschlussmonat. ${VERWEIS_UMSEITIG}`;

// Monatsübersicht (Abschlussmonat)
export const SICHT_ABSCHLUSS_VL =
  'Abschlüsse des Monats: alle Verlängerungen, die in diesem Monat gewonnen wurden — auch wenn '
  + 'die Verlängerung in einem früheren Monat fällig war. Die Seite „Verlängerungen VL" gruppiert '
  + `dagegen nach VL-Monat (Fälligkeit). ${VERWEIS_UMSEITIG} `
  + 'Für Provisionen und AE-Ziele gilt der Abschlussmonat, also diese Spalte.';

export const SICHT_ABSCHLUSS_BK =
  'Abschlüsse des Monats: alle Angebote, die in diesem Monat gewonnen wurden — auch wenn das '
  + 'Angebot aus einem früheren Monat stammt. Die Seite „Bestandskunden BK" gruppiert dagegen nach '
  + `Angebotsmonat. ${VERWEIS_UMSEITIG} `
  + 'Für Provisionen und AE-Ziele gilt der Abschlussmonat, also diese Spalte.';

// Standort-Zuschnitt der Monatsübersicht
export const SICHT_DEUTSCHLAND =
  'Deutschland = Bonn und Braunschweig zusammen. Die Bereichsseiten filtern beide Standorte '
  + 'einzeln — ein dortiger Filter auf nur Bonn oder nur Braunschweig hat hier keine eigene Spalte '
  + 'und lässt sich mit dieser Zahl nicht direkt vergleichen.';
