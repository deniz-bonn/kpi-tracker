// Gründe für "kein Angebot erstellt" (NK). Konfigurierbar — hier ergänzen/ändern reicht,
// gespeichert wird der `key` in deals_nk.kein_angebot_grund (keine Migration nötig).
// 'sonstiges' öffnet ein Pflicht-Freitextfeld (kein_angebot_grund_text).
export const KEIN_ANGEBOT_GRUENDE = [
  { key: 'lead_unqualifiziert',    label: 'Lead unqualifiziert (Zielgruppe/Größe passt nicht)' },
  { key: 'kein_entscheider',       label: 'Entscheider nicht im Gespräch' },
  { key: 'falsche_erwartung',      label: 'Falsche Erwartungshaltung (aus Setting/Vorqualifizierung)' },
  { key: 'kein_budget',            label: 'Kein Budget / wirtschaftlich nicht darstellbar' },
  { key: 'kein_bedarf',            label: 'Kein akuter Bedarf / falscher Zeitpunkt' },
  { key: 'anderweitig_versorgt',   label: 'Bereits anderweitig versorgt (Wettbewerber/intern gelöst)' },
  { key: 'sonstiges',              label: 'Sonstiges' },
];

// key -> label (für Anzeige in Auswertungen/Kontoauszug)
export const GRUND_LABEL = Object.fromEntries(KEIN_ANGEBOT_GRUENDE.map(g => [g.key, g.label]));

// Robust: ist ein Deal ein "kein Angebot"-Deal? (Postgres BOOLEAN false / SQLite 0)
export const istKeinAngebot = (d) => d?.angebot_erstellt === false || d?.angebot_erstellt === 0;
export const hatAngebot = (d) => !istKeinAngebot(d);
