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

// key -> label (für Anzeige in Auswertungen/Kontoauszug). 'altbestand' ist ein historischer
// Marker (Migration 093), NICHT im Dropdown wählbar, aber in Auswertungen lesbar beschriftet.
export const GRUND_LABEL = {
  ...Object.fromEntries(KEIN_ANGEBOT_GRUENDE.map(g => [g.key, g.label])),
  altbestand: 'Altbestand – Grund nicht erfasst',
};

// Erklärtexte für die Info-Popover im Block "Angebotsquote & bereinigte Closing Rate".
export const INFO_TEXTE = {
  closingCalls:  'Alle erfassten Closing Calls im Zeitraum – mit und ohne Angebot. Jeder geführte Closing Call wird als Deal erfasst.',
  mitAngebot:    'Closing Calls, in denen ein Angebot erstellt wurde (Anzahl · Anteil an allen Calls = Angebotsquote).',
  ohneAngebot:   'Closing Calls ohne Angebot (z. B. Lead unqualifiziert, Entscheider fehlte). Zählen nicht als Angebote, aber in der bereinigten Closing Rate.',
  rateKlassisch: 'Gewonnene Deals ÷ erstellte Angebote. Misst die Abschlussstärke, wenn es zum Angebot kam. Soll: 50 %.',
  quoteSetter:   'Gewonnen ÷ alle erfassten Closing Calls des Setters (inkl. Calls ohne Angebot). Ein Setter verantwortet die Qualität aller Termine, die er liefert — auch die, aus denen nie ein Angebot wurde. Die Spalte „mit Angebot" steht als Kontext daneben, rechnet aber nicht mit.',
  quoteOpener:   'Gewonnen ÷ alle erfassten Closing Calls des Openers (inkl. Calls ohne Angebot). Ein Opener verantwortet die Qualität aller Termine, die er liefert — auch die, aus denen nie ein Angebot wurde. Die Spalte „mit Angebot" steht als Kontext daneben, rechnet aber nicht mit.',
  rateBereinigt: 'Gewonnene Deals ÷ alle Closing Calls (inkl. ohne Angebot). Misst die echte Verwertung aller geführten Gespräche – die ehrlichere Gesamtquote. Differenz zur klassischen Rate = Effekt der angebotslosen Calls.',
};

// Robust: ist ein Deal ein "kein Angebot"-Deal? (Postgres BOOLEAN false / SQLite 0)
export const istKeinAngebot = (d) => d?.angebot_erstellt === false || d?.angebot_erstellt === 0;
export const hatAngebot = (d) => !istKeinAngebot(d);

// ── Zentrale Quoten-Rechnung je Rolle ─────────────────────────────────────────
// VERBINDLICH (KONZEPT.md §5): Setter und Opener rechnen ihre Abschlussquote auf ALLE
// erfassten Closing Calls (inkl. "kein Angebot erstellt"), NICHT auf Angebote.
// Begruendung: Ein Setter/Opener verantwortet die Qualitaet aller Termine, die er liefert —
// auch die, aus denen mangels Qualifizierung nie ein Angebot wurde. Genau diesen Fehleranteil
// blendet eine angebotsbasierte Quote aus. Der Closer behaelt beide Sichten (klassisch =
// Abschlussstaerke wenn es zum Angebot kam, Soll 50 %; bereinigt daneben).
// Aendert sich die Definition erneut, ist ROLLEN_BASIS die einzige Stelle, die es kostet.
export const ROLLEN_BASIS = { setter: 'calls', opener: 'calls', closer: 'angebote' };

const ROLLEN_FELD = { setter: 'setter_id', opener: 'opener_id', closer: 'closer_id' };

// Kein-Angebot-Tracking (Migration 092) ist am 16.08.2026 live gegangen. Davor wurden
// angebotslose Calls kaum erfasst -> zu kleiner Nenner -> zu gute Quote. Nur Transparenz,
// keine Rueckrechnung. Stichtag hier aendern, falls sich die Bewertung verschiebt.
export const KEIN_ANGEBOT_AB = '2026-08';
export const KEIN_ANGEBOT_HINWEIS =
  'Zeitraum liegt (teilweise) vor Einführung des Kein-Angebot-Trackings (August 2026) — '
  + 'angebotslose Calls wurden davor kaum erfasst. Der Nenner ist dadurch zu klein, die Quote ggf. überzeichnet.';

// Liegt der ausgewertete Zeitraum (teilweise) vor dem Stichtag?
export const zeitraumVorTracking = (zeitMode, monat, vonMonat) =>
  zeitMode === 'alle' ? true
  : zeitMode === 'zeitraum' ? String(vonMonat || '') < KEIN_ANGEBOT_AB
  : String(monat || '') < KEIN_ANGEBOT_AB;

/**
 * Personen-Statistik je Rolle aus einer Deal-Liste.
 * @param deals  ALLE Closing Calls des Scopes (inkl. angebotslose) — die Funktion filtert selbst.
 * @param rolle  'setter' | 'opener' | 'closer'
 * @param aeEur  (deal) => AE-Betrag in EUR, 0 wenn (noch) nicht getrackt
 * @param basis  optionaler Override von ROLLEN_BASIS (der Closer-Block rechnet bewusst auf 'calls')
 * @returns Zeilen sortiert nach realisierter AE (Rang-Basis der Medaillen), mit:
 *          calls (alle) · mitAngebot · ohne · gewonnen · verloren · ae_summe ·
 *          nenner/quote (gemaess basis) · angebotsquote · rateKlassisch · rateBereinigt ·
 *          ohneQuote · gruende · topGrund
 */
export function rollenStats(deals, rolle, aeEur, basis = ROLLEN_BASIS[rolle]) {
  const feld = ROLLEN_FELD[rolle];
  const m = new Map();
  for (const d of deals) {
    const id = d[feld];
    if (!id) continue;
    // Angebotsbasierte Sicht: angebotslose Calls gar nicht erst aufnehmen.
    if (basis === 'angebote' && istKeinAngebot(d)) continue;
    let e = m.get(id);
    if (!e) m.set(id, e = {
      id, name: d[`${rolle}_name`], standort: d[`${rolle}_standort`],
      calls: 0, mitAngebot: 0, ohne: 0, gewonnen: 0, verloren: 0, ae_summe: 0, gruende: {},
    });
    e.calls++;
    if (hatAngebot(d)) e.mitAngebot++;
    else { e.ohne++; const g = d.kein_angebot_grund || 'unbekannt'; e.gruende[g] = (e.gruende[g] || 0) + 1; }
    if (d.status === 'Gewonnen') { e.gewonnen++; e.ae_summe += aeEur(d); }
    if (d.status === 'Verloren') e.verloren++;
  }
  const pct = (n, d) => (d > 0 ? (n / d) * 100 : 0);
  return [...m.values()].map(e => {
    const nenner = basis === 'calls' ? e.calls : e.mitAngebot;
    const top    = Object.entries(e.gruende).sort((a, b) => b[1] - a[1])[0];
    return {
      ...e,
      offen:         e.calls - e.gewonnen - e.verloren,
      nenner,
      quote:         pct(e.gewonnen, nenner),
      angebotsquote: pct(e.mitAngebot, e.calls),
      rateKlassisch: pct(e.gewonnen, e.mitAngebot),
      rateBereinigt: pct(e.gewonnen, e.calls),
      ohneQuote:     pct(e.ohne, e.calls),
      topGrund:      top ? (GRUND_LABEL[top[0]] || top[0]) : '—',
    };
  }).sort((a, b) => b.ae_summe - a.ae_summe);
}
