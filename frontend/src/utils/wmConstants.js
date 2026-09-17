// ── Willkommensmeetings: Festlegungen und Trichter-Rechnung ──────────────────

// Angebots-Typ am MEETING, nicht am Deal.
//
// Begruendung: deals_bk.dienstleistung kennt weder "Jahresbetreuung" noch "Jahresvertrag" — die
// haeufigsten Werte im Bestand sind "RaaS Kontingente" (127), "Kontingente " (122, mit
// Leerzeichen) und "Kontingenterweiterung" (115). Das Feld ist ausserdem verschmutzt:
// "Kontingente " steht neben "Kontingente" und "Kontingentvertrag". Die Haupt-KPI daraus
// abzuleiten waere ab Tag eins unzuverlaessig — deshalb eine eigene, kurze, gepflegte Liste.
export const ANGEBOTS_TYPEN = ['Jahresbetreuung', 'Jahresvertrag', 'Sonstiges'];

// Die beiden Typen, die als "Jahres-Angebot" zaehlen — die eigentliche Haupt-KPI.
export const JAHRES_TYPEN = ['Jahresbetreuung', 'Jahresvertrag'];
export const istJahresTyp = (typ) => JAHRES_TYPEN.includes(typ);

// ── Uebergangs-Ehrlichkeit ───────────────────────────────────────────────────
// Ab wann wurden Willkommensmeetings ueberhaupt erfasst? Fuer frueher liegende Monate sind die
// Quoten nicht aussagekraeftig — es fehlen nicht die Angebote, es fehlen die MEETINGS.
// Gleiches Muster und derselbe Zweck wie KEIN_ANGEBOT_AB in nkConstants.js: lieber ein
// sichtbarer Hinweis als eine Zahl, die jemand fuer bare Muenze nimmt.
export const WM_ERFASSUNG_AB = '2026-09';
export const vorErfassung = (monat) => !!monat && String(monat) < WM_ERFASSUNG_AB;
export const ERFASSUNG_HINWEIS =
  `Willkommensmeetings werden erst seit ${WM_ERFASSUNG_AB.slice(5)}/${WM_ERFASSUNG_AB.slice(0, 4)} erfasst. ` +
  'Für frühere Monate fehlen nicht die Angebote, sondern die Meetings — die Quoten sind dort nicht aussagekräftig.';

/**
 * Der Trichter einer Meeting-Menge.
 *
 * KOHORTE: Die Menge ist bereits nach MEETING-Monat gefiltert. Ein Meeting vom 12.09. bleibt in
 * der September-Kohorte, auch wenn sein Angebot erst im Oktober gewonnen wird — dann steigt
 * rueckwirkend die September-Quote. Der Deal-Status wird dafuer LIVE gelesen (deal_status aus
 * dem Join), nie kopiert.
 *
 * Die AE-Zaehlung des Deals selbst folgt unveraendert gewonnen_monat; sie wird hier nicht
 * angefasst. `ae` unten ist die Summe der WM-Angebote dieser Kohorte, keine Monats-AE.
 */
export function trichter(meetings = []) {
  const n         = meetings.length;
  const mitAngebot = meetings.filter(m => m.deal_bk_id);
  const jahres     = mitAngebot.filter(m => istJahresTyp(m.angebots_typ));
  const gewonnen   = mitAngebot.filter(m => m.deal_status === 'Gewonnen');
  const jahresGew  = jahres.filter(m => m.deal_status === 'Gewonnen');
  // AE in EUR: der Server liefert deal_ae_wert in Company-Waehrung mit, die Liste reicht
  // deal_ae_wert_eur nach. Fallback auf den Rohwert, damit nichts stillschweigend 0 wird.
  const ae = gewonnen.reduce((s, m) => s + (Number(m.deal_ae_wert_eur ?? m.deal_ae_wert) || 0), 0);
  const q = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : null);
  return {
    meetings: n,
    angebote: mitAngebot.length,
    jahresAngebote: jahres.length,
    gewonnen: gewonnen.length,
    jahresGewonnen: jahresGew.length,
    entfernt: meetings.filter(m => !m.deal_bk_id && Number(m.deal_entfernt) === 1).length,
    ae: Math.round(ae * 100) / 100,
    quoteAngebot:  q(mitAngebot.length, n),           // Meeting -> Angebot
    quoteJahres:   q(jahres.length, n),               // Meeting -> Jahres-Angebot (Haupt-KPI)
    quoteAbschluss: q(gewonnen.length, mitAngebot.length), // Angebot -> Abschluss
    quoteDurchgriff: q(gewonnen.length, n),           // Meeting -> Abschluss
  };
}

export const fmtQuote = (q) => (q == null ? '—' : String(q).replace('.', ',') + ' %');
