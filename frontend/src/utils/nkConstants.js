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

// ── Gesamt-Kennzahlen ueber eine Deal-Liste ──────────────────────────────────
// Am 12.10.2026 wortgleich aus DealsNK.jsx hierher verschoben, damit die Seite und der
// Monatsvergleich DENSELBEN Code ausfuehren. Keine Neudefinition: Felder, Rundung und
// Nenner-Guards sind unveraendert. rollenStats deckt nur Personenzeilen ab (Deals ohne
// Rollen-ID fallen dort heraus) — die Gesamtsummen leben hier.

/**
 * Klassische KPIs — angebotsbasiert.
 * @param angebote  nur Deals MIT Angebot (hatAngebot); Kein-Angebot-Deals aendern sie nicht
 * @param aeEur     (deal) => AE in EUR mit ae_ab_monat-Gate
 */
export function klassischeKpis(angebote, aeEur) {
  const gew = angebote.filter(d => d.status === 'Gewonnen');
  const ae  = gew.reduce((s, d) => s + aeEur(d), 0);
  const agw = angebote.reduce((s, d) => s + (Number(d.angebotswert_eur ?? d.angebotswert) || 0), 0);
  const n   = angebote.length;
  const autoJ = gew.filter(d => d.automatische_verlaengerung === 'Ja').length;
  const abgJ  = gew.filter(d => d.abgerechnet === 'Ja').length;
  return {
    total:                  n,
    gewonnen:               gew.length,
    verloren:               angebote.filter(d => d.status === 'Verloren').length,
    in_verhandlung:         angebote.filter(d => d.status === 'In Verhandlung').length,
    in_closing2:            angebote.filter(d => d.status === 'In Closing Call 2').length,
    ae_summe:               ae,
    angebotswert_gesamt:    agw,
    wert_offen:             angebote.filter(d => !['Gewonnen','Verloren'].includes(d.status))
                              .reduce((s, d) => s + (Number(d.angebotswert_eur ?? d.angebotswert) || 0), 0),
    gewonnen_cc:            gew.filter(d => d.quelle === 'Cold Calling').length,
    gewonnen_mail:          gew.filter(d => d.quelle === 'Mail').length,
    gewonnen_fax:           gew.filter(d => d.quelle === 'Fax').length,
    quote_angebote:         n > 0 ? (gew.length / n * 100).toFixed(2) : '0.00',
    quote_wert:             agw > 0 ? (ae / agw * 100).toFixed(2) : '0.00',
    quote_mit_av:           gew.length > 0
                              ? (gew.filter(d => Number(d.ae_wert) > 0).length / gew.length * 100).toFixed(2)
                              : '0.00',
    auto_verlaengerung:       autoJ,
    auto_verlaengerung_quote: gew.length > 0 ? (autoJ / gew.length * 100).toFixed(1) : '0.0',
    abgerechnet_ja:           abgJ,
    abgerechnet_quote:        gew.length > 0 ? (abgJ / gew.length * 100).toFixed(1) : '0.0',
  };
}

/**
 * Call-basierte Quoten ueber ALLE Closing Calls (inkl. ohne Angebot).
 * @param calls  alle Deals des Scopes
 */
export function callStats(calls) {
  const callsN = calls.length;
  const mitN   = calls.filter(hatAngebot).length;
  const gewN   = calls.filter(d => d.status === 'Gewonnen').length;   // Gewonnene sind stets mit Angebot
  const gruende = {};
  calls.filter(istKeinAngebot).forEach(d => { const g = d.kein_angebot_grund || 'unbekannt'; gruende[g] = (gruende[g] || 0) + 1; });
  return {
    callsN, mitN, ohneN: callsN - mitN, gewN,
    angebotsquote:  callsN > 0 ? (mitN / callsN * 100) : 0,
    rateKlassisch:  mitN   > 0 ? (gewN / mitN   * 100) : 0,   // Gewonnen ÷ Angebote
    rateBereinigt:  callsN > 0 ? (gewN / callsN * 100) : 0,   // Gewonnen ÷ alle Calls
    gruende: Object.entries(gruende).sort((a, b) => b[1] - a[1]),
  };
}

// ── Leadquellen ──────────────────────────────────────────────────────────────
// EINE Liste fuer Formular, Filter und Auswertung. deals_nk.quelle ist seit Migration 006
// Freitext ohne CHECK — eine neue Quelle kostet nur diesen Eintrag.
export const QUELLEN = ['Cold Calling', 'Mail', 'Fax', 'Ad', 'Empfehlung', 'Follow Up', 'Inbound', 'Leadhandy', 'Post', 'KI'];
export const OHNE_QUELLE = 'ohne Quelle';

/**
 * Quoten je Leadquelle. Keine eigenen Formeln: jede Zeile ist callStats + klassischeKpis ueber
 * die Calls dieser Quelle — dieselben Funktionen wie Kopfzeile und Gesamt-KPIs der NK-Seite.
 * Die Gesamt-Zeile ist damit per Konstruktion identisch mit den Seitenzahlen.
 *
 * Zeilen: alle Quellen aus QUELLEN (auch mit 0 Calls, damit eine neue Quelle wie KI sichtbar
 * bleibt, bevor sie Daten hat), danach Werte, die im Bestand vorkommen, aber nicht in der Liste
 * stehen (Altwerte wie 'DMC'), zuletzt 'ohne Quelle'. Sortiert nach Calls, absteigend.
 * @param calls  ALLE Closing Calls des Scopes (inkl. ohne Angebot)
 * @param aeEur  (deal) => AE in EUR mit ae_ab_monat-Gate
 */
export function quellenStats(calls, aeEur) {
  const gruppen = new Map(QUELLEN.map(q => [q, []]));
  for (const d of calls) {
    const q = String(d.quelle ?? '').trim() || OHNE_QUELLE;
    if (!gruppen.has(q)) gruppen.set(q, []);
    gruppen.get(q).push(d);
  }
  const zeile = (quelle, ds) => {
    const cs = callStats(ds);
    const kk = klassischeKpis(ds.filter(hatAngebot), aeEur);
    return {
      quelle,
      calls:         cs.callsN,
      angebote:      cs.mitN,
      gewonnen:      kk.gewonnen,
      angebotsquote: cs.angebotsquote,   // Angebote ÷ Calls
      rateKlassisch: cs.rateKlassisch,   // Gewonnen ÷ Angebote
      rateBereinigt: cs.rateBereinigt,   // Gewonnen ÷ alle Calls
      ae:            kk.ae_summe,
    };
  };
  const ohne = gruppen.get(OHNE_QUELLE);
  gruppen.delete(OHNE_QUELLE);
  const zeilen = [...gruppen].map(([q, ds]) => zeile(q, ds))
    .sort((a, b) => b.calls - a.calls || a.quelle.localeCompare(b.quelle, 'de'));
  if (ohne?.length) zeilen.push(zeile(OHNE_QUELLE, ohne));
  return { zeilen, gesamt: zeile('Gesamt', calls) };
}

// ── Monatsvergleich „Stand Tag X" ─────────────────────────────────────────────
// Prinzip gleicher Stichtag: der laufende Monat bis einschliesslich Tag X wird mit den
// Vormonaten bis Tag X verglichen. Nur dieser Gleich-Tage-Schnitt ist fair — ein halber
// Monat gegen volle Monate waere wertlos. Alle Zaehler kommen aus klassischeKpis/callStats,
// hier wird nur die EINGANGSLISTE je Monat geschnitten (zwei Achsen, siehe unten).
//
// SCHNITTREGEL (gemessen am Backup 22.09.2026, 2.242 Deals):
// Call-/Angebots-Achse: Spalte = Berichtsmonat `monat` (wie ueberall auf der Seite), das
// Datum entscheidet nur, ob der Deal am Stichtag schon da ist. `monat` ist ein freies
// Formularfeld, 1,5 % der Deals tragen ein Datum aus einem anderen Monat: ein Deal mit
// Datum VOR dem Berichtsmonat zaehlt ab Tag 1, einer mit Datum NACH dem Berichtsmonat erst
// am Monatsletzten (Datenfehler, 8 Faelle). Am Monatsletzten konvergiert die Regel damit
// exakt auf die Monatszahlen der Seite — die reine Datumsachse taete das nicht (±1–8/Monat).
// Gewonnen-Achse: gewonnen_monat = Spalte, gewonnen_datum <= Stichtag, NULL-sicher nach dem
// gewonnen_bis-Muster der Route (gewonnen_monat wird serverseitig aus gewonnen_datum
// abgeleitet, 0 Abweichler im Fenster).
//
// QUOTEN im Vergleich: Zaehler „Gewonnen" aus der Gewonnen-Achse, Nenner aus der Call-Achse —
// dieselbe Quotendefinition wie callStats (Gewonnen ÷ Angebote, Gewonnen ÷ alle Calls), aber
// stichtag-fair. Die Kohorten-Quote der Rollentabellen (Gewinne aus den Angeboten des Monats,
// egal wann gewonnen) waere im Vergleich unfair: der laufende Monat hatte noch keine Zeit zu
// reifen. Am Monatsletzten unterscheiden sich beide nur um monatsuebergreifend gewonnene
// Deals (29 von 1.053 im Bestand).

// Zeilen-Praedikat der Filterleiste (DealsNK.jsx) — eine Stelle fuer Seite und Vergleichsblock.
// Leere Werte = kein Filter. Vergleiche wortgleich mit der frueheren Inline-Fassung von listDeals.
export const dealFilterPred = ({ quelle, closer, opener, setter, status, standort } = {}) => (d) =>
  (!quelle   || d.quelle            === quelle) &&
  (!closer   || String(d.closer_id) === closer) &&
  (!opener   || String(d.opener_id) === opener) &&
  (!setter   || String(d.setter_id) === setter) &&
  (!status   || d.status            === status) &&
  (!standort || d.closer_standort   === standort);

export const VERGLEICH_DURCHSCHNITTE = [3, 6];     // Spalten „Ø letzte N Monate"
// Kein-Angebot-Tracking ist am 16.08.2026 live gegangen (KEIN_ANGEBOT_AB ist die
// Monatskonstante). Fuer einen Tagesschnitt zaehlt der Tag: der August-Stand „bis Tag 12"
// liegt VOR dem Go-live, obwohl der Monat als getrackt gilt (11 von 15 angebotslosen
// August-Calls bis Tag 12 wurden erst am 23.08. nachgepflegt).
export const KEIN_ANGEBOT_AB_TAG = '2026-08-16';

export const VERGLEICH_KPIS = [
  { key: 'calls',          label: 'Closing Calls',            art: 'anzahl', callNenner: true },
  { key: 'angebote',       label: 'Angebote erstellt',        art: 'anzahl' },
  { key: 'gewonnen',       label: 'Gewonnen',                 art: 'anzahl' },
  { key: 'ae',             label: 'AE realisiert',            art: 'eur' },
  { key: 'angebotsquote',  label: 'Angebotsquote',            art: 'pct',    callNenner: true },
  { key: 'rateKlassisch',  label: 'Abschlussquote klassisch', art: 'pct' },
  { key: 'rateBereinigt',  label: 'Quote alle Calls',         art: 'pct',    callNenner: true },
  { key: 'oeAngebotswert', label: 'Ø Angebotswert',           art: 'eur' },
  { key: 'oeDealgroesse',  label: 'Ø Deal-Größe (gewonnen)',  art: 'eur' },
];

export const ymd = (v) => (v == null ? '' : String(v).slice(0, 10));
export const tageImMonat = (monat) => {
  const [y, m] = monat.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};
export const shiftMonat = (monat, delta) => {
  const [y, m] = monat.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};
// Stichtag im Vergleichsmonat: min(Tag, Monatsletzter) — am 31. gegen den 30./28. schneiden.
export const stichtagYmd = (monat, tag) =>
  `${monat}-${String(Math.min(tag, tageImMonat(monat))).padStart(2, '0')}`;
export const vorTrackingAmStichtag = (monat, tag) => stichtagYmd(monat, tag) < KEIN_ANGEBOT_AB_TAG;
// Arbeitstage Mo–Fr bis Tag X (ohne Feiertage) — nur Fussnote, keine zweite Rechnung.
export const arbeitstageBis = (monat, tag) => {
  const [y, m] = monat.split('-').map(Number);
  const bis = Math.min(tag, tageImMonat(monat));
  let n = 0;
  for (let t = 1; t <= bis; t++) { const w = new Date(Date.UTC(y, m - 1, t)).getUTCDay(); if (w >= 1 && w <= 5) n++; }
  return n;
};

/** Call-/Angebots-Achse bis Stichtag (Regel siehe oben). */
export function bisStichtag(deals, monat, tag) {
  const cut  = stichtagYmd(monat, tag);
  const voll = tag >= tageImMonat(monat);
  return deals.filter(d => (d.monat || '').trim() === monat && (voll || ymd(d.datum) <= cut));
}
/** Gewonnen-Achse bis Stichtag, NULL-sicher wie gewonnen_bis in deals_nk.js. */
export function gewonnenBisStichtag(deals, monat, tag) {
  const cut = stichtagYmd(monat, tag);
  return deals.filter(d => d.status === 'Gewonnen'
    && (d.gewonnen_monat || '').trim() === monat
    && (!d.gewonnen_datum || ymd(d.gewonnen_datum) <= cut));
}

/** Ein Monatsstand „bis Tag X" — alle neun Kennzahlen aus klassischeKpis/callStats. */
export function monatsStand(deals, monat, tag, aeEur) {
  const calls    = bisStichtag(deals, monat, tag);
  const cs       = callStats(calls);
  const kk       = klassischeKpis(calls.filter(hatAngebot), aeEur);
  const kg       = klassischeKpis(gewonnenBisStichtag(deals, monat, tag).filter(hatAngebot), aeEur);
  const pct = (n, d) => (d > 0 ? (n / d) * 100 : 0);
  const div = (n, d) => (d > 0 ? n / d : 0);
  return {
    monat, stichtag: stichtagYmd(monat, tag), vorTracking: vorTrackingAmStichtag(monat, tag),
    calls:          cs.callsN,
    angebote:       cs.mitN,
    gewonnen:       kg.gewonnen,
    ae:             kg.ae_summe,
    angebotsquote:  cs.angebotsquote,
    rateKlassisch:  pct(kg.gewonnen, cs.mitN),
    rateBereinigt:  pct(kg.gewonnen, cs.callsN),
    oeAngebotswert: div(kk.angebotswert_gesamt, kk.total),
    oeDealgroesse:  div(kg.ae_summe, kg.gewonnen),
  };
}

// Ø = Mittel der Einzelmonats-Staende (auch fuer Quoten). KPIs mit Call-Nenner nur ueber
// getrackte Monate — sonst vergleicht der Oktober gegen die geschoente Alt-Angebotsquote.
function durchschnitt(staende, kpi) {
  const basis = kpi.callNenner ? staende.filter(s => !s.vorTracking) : staende;
  if (!basis.length) return { wert: null, n: 0, von: staende.length };
  return { wert: basis.reduce((s, x) => s + x[kpi.key], 0) / basis.length, n: basis.length, von: staende.length };
}

export const delta = (aktuell, vergleich) =>
  vergleich == null ? null
  : { abs: aktuell - vergleich, rel: vergleich !== 0 ? ((aktuell - vergleich) / Math.abs(vergleich)) * 100 : null };

/**
 * Vollstaendiger Vergleich fuer einen Basismonat.
 * @returns { tag, basisMonat, aktuell, vormonate[maxN], durchschnitte[{n, monate, werte{key:{wert,n,von}}}], fokus }
 * fokus = KPI mit der staerksten negativen relativen Abweichung von Ø(anzahlen[0]); null wenn keine.
 */
export function monatsvergleich({ deals, basisMonat, tag, aeEur, anzahlen = VERGLEICH_DURCHSCHNITTE }) {
  const maxN      = Math.max(...anzahlen);
  const aktuell   = monatsStand(deals, basisMonat, tag, aeEur);
  const vormonate = Array.from({ length: maxN }, (_, i) => monatsStand(deals, shiftMonat(basisMonat, -(i + 1)), tag, aeEur));
  const durchschnitte = anzahlen.map(n => {
    const staende = vormonate.slice(0, n);
    return { n, monate: staende.map(s => s.monat),
      werte: Object.fromEntries(VERGLEICH_KPIS.map(k => [k.key, durchschnitt(staende, k)])) };
  });
  let fokus = null, schlechtest = 0;
  const ref = durchschnitte[0];
  for (const k of VERGLEICH_KPIS) {
    if (k.callNenner && aktuell.vorTracking) continue;
    const r = ref.werte[k.key];
    if (r.wert == null || r.wert <= 0) continue;
    const rel = (aktuell[k.key] - r.wert) / r.wert;
    if (rel < schlechtest) { schlechtest = rel; fokus = k.key; }
  }
  return { tag, basisMonat, aktuell, vormonate, durchschnitte, fokus };
}
