// Währungs-Umrechnung CHF → EUR. Beträge werden in Originalwährung (Company-currency)
// gespeichert; für Anzeige/Aggregation/Buchung wird in EUR umgerechnet.
// rate = EUR pro 1 CHF, gültig pro Monat (Tabelle chf_eur_rates).
const db = require('../db');

async function loadRates() {
  const rows = await db.all('SELECT monat, rate FROM chf_eur_rates');
  const map = {};
  rows.forEach(r => { map[r.monat] = Number(r.rate); });
  return map;
}

// Kurs für einen Monat: exakter Treffer, sonst jüngster Kurs davor, sonst ältester, sonst null.
function rateFor(monat, ratesMap) {
  if (!monat) monat = '';
  if (ratesMap[monat] != null) return ratesMap[monat];
  const keys = Object.keys(ratesMap).sort();
  if (keys.length === 0) return null;
  let best = null;
  for (const k of keys) { if (k <= monat) best = k; }
  if (best != null) return ratesMap[best];
  return ratesMap[keys[0]]; // gesuchter Monat liegt vor dem ersten Kurs → ältester
}

// Betrag der gegebenen Währung/Monat in EUR. EUR bleibt unverändert.
// Rückgabe null, wenn CHF und kein Kurs verfügbar (Aufrufer entscheidet Fallback/Anzeige).
function toEur(amount, currency, monat, ratesMap) {
  const a = Number(amount) || 0;
  if (!currency || currency === 'EUR') return a;
  const rate = rateFor(monat, ratesMap);
  if (rate == null) return null;
  return a * rate;
}

// Reichert Deal-Zeilen um EUR-Felder an: angebotswert_eur / ae_wert_eur (+ optionale weitere Felder).
// Originalfelder (Company-Währung) bleiben unverändert für Formulare. currency wird durchgereicht.
// fieldMap: { originalFeld: 'zielFeldEur' } — Standard deckt NK/BK/VL ab; Up-Sale übergibt eigene Map.
async function enrichDealsEur(rows, fieldMap) {
  const list = Array.isArray(rows) ? rows : (rows ? [rows] : []);
  const rates = await loadRates();
  const map = fieldMap || { angebotswert: 'angebotswert_eur', ae_wert: 'ae_wert_eur' };
  for (const r of list) {
    const cur = r.currency || 'EUR';
    r.currency = cur;
    for (const [src, dest] of Object.entries(map)) {
      // realisierte Werte mit gewonnen_monat umrechnen, sonst mit Angebotsmonat.
      // umstellung_ae_wert gehoert dem VERKNUEPFTEN Dauer-RaaS-Deal (deals_bk) und bringt dessen
      // eigene Achse mit — mit der Achse des Verlaengerungs-Deals umgerechnet stuenden Kursmonat
      // und Ereignismonat auseinander.
      const monat = src === 'umstellung_ae_wert'
        ? (r.umstellung_gewonnen_monat || r.umstellung_monat || r.gewonnen_monat || r.monat)
        : (src === 'ae_wert' || src === 'angenommenes_volumen')
          ? (r.gewonnen_monat || r.monat) : r.monat;
      r[dest] = r[src] == null ? null : toEur(r[src], cur, monat, rates);
    }
  }
  return rows;
}

// SQL-Ausdruck fuer den Kurs eines Monats — DIESELBE Regel wie rateFor(): exakter Monat, sonst
// juengster Kurs davor, sonst aeltester. NULL nur bei leerer Kurstabelle (dann faellt der Betrag
// aus der Summe, statt still 1:1 gezaehlt zu werden).
// Frueher stand in SQL `COALESCE(<exakter Monat>, 1)`: fehlte ein Monatskurs, zaehlten Dashboard,
// Auswertung, KPIs und Bestenliste CHF 1:1 als EUR, waehrend Listen und Formulare (rateFor) mit
// dem letzten Kurs rechneten — ab dem ersten ungepflegten Monat zeigten beide Seiten verschiedene
// Zahlen. Welche Monate gerade zurueckfallen, liefert kursStatus() (Hinweis in der Oberflaeche).
function rateSql(monatExpr) {
  return `COALESCE(
      (SELECT r.rate FROM chf_eur_rates r WHERE r.monat <= ${monatExpr} ORDER BY r.monat DESC LIMIT 1),
      (SELECT r.rate FROM chf_eur_rates r ORDER BY r.monat ASC LIMIT 1))`;
}

// SQL-Ausdruck: beliebiges Betragsfeld in EUR. CHF-Companies (currency='CHF') mit dem Monatskurs
// des angegebenen Monats-Feldes umrechnen, sonst unverändert. Erfordert JOIN auf companies (Alias c).
function moneyEurSql(field, monatCol, dealAlias = 'd', compAlias = 'c') {
  return `(COALESCE(${dealAlias}.${field},0) * CASE WHEN ${compAlias}.currency = 'CHF'
    THEN ${rateSql(`${dealAlias}.${monatCol}`)}
    ELSE 1 END)`;
}
// ae_wert in EUR (Kurs des Gewinnmonats) — häufigster Fall.
function aeEurSql(dealAlias = 'd', compAlias = 'c') {
  return moneyEurSql('ae_wert', 'gewonnen_monat', dealAlias, compAlias);
}

// ae_wert in EUR MIT AE-Startmonat-Gate: Umsatz zaehlt erst ab company.ae_ab_monat.
// Regel bezieht sich auf gewonnen_monat (nicht Angebotsdatum). ae_ab_monat NULL =>
// kein Filter (Company verhaelt sich exakt wie bisher). Setzt voraus, dass die Query
// companies als <compAlias> joint und der Deal gewonnen_monat hat — beides gilt ueberall,
// wo aeEurSql schon genutzt wird (aeEurSql referenziert selbst c.currency + gewonnen_monat).
// Wichtig: nur der EUR-BETRAG wird auf 0 gesetzt, die Deal-Anzahl (COUNT) bleibt unberuehrt.
function aeEurGatedSql(dealAlias = 'd', compAlias = 'c') {
  return `CASE WHEN ${compAlias}.ae_ab_monat IS NULL
      OR ${dealAlias}.gewonnen_monat >= ${compAlias}.ae_ab_monat
    THEN ${aeEurSql(dealAlias, compAlias)} ELSE 0 END`;
}

/**
 * Welche Monate rechnen gerade mit einem Rueckfall-Kurs? Fuer den Hinweis in der Oberflaeche.
 * Relevant sind Monate bis einschliesslich heute, in denen CHF-Deals einen Betrag tragen
 * (Angebots- oder Gewinnmonat), plus der laufende Monat. Kuenftige Monate (z. B. VL-Kohorten)
 * rechnen bewusst mit dem letzten Kurs, ohne Warnung — einen Kurs fuer die Zukunft gibt es nicht.
 * Der Folgemonat wird separat gemeldet: das ist die Pflege-Erinnerung fuer die Einstellungen.
 * @param heute 'YYYY-MM-DD' (Berlin)
 */
async function kursStatus(heute) {
  const rates = await loadRates();
  const aktMonat = heute.slice(0, 7);
  const [j, m] = aktMonat.split('-').map(Number);
  const folgemonat = `${m === 12 ? j + 1 : j}-${String(m === 12 ? 1 : m + 1).padStart(2, '0')}`;
  const monate = new Set([aktMonat]);
  for (const t of ['deals_nk', 'deals_bk', 'deals_vl']) {
    const rows = await db.all(
      `SELECT DISTINCT d.monat AS a, d.gewonnen_monat AS b FROM ${t} d
         JOIN companies c ON c.id = d.company_id WHERE c.currency = 'CHF'`);
    for (const r of rows) for (const v of [r.a, r.b]) if (v) nimmMonat(monate, String(v).trim().slice(0, 7), aktMonat);
  }
  const keys = Object.keys(rates).sort();
  const rueckfallMonat = (mon) => {
    let best = null;
    for (const k of keys) if (k <= mon) best = k;
    return best ?? keys[0] ?? null;
  };
  const fehlend = [...monate].sort()
    .filter((mon) => rates[mon] == null)
    .map((mon) => { const rm = rueckfallMonat(mon); return { monat: mon, rueckfall_monat: rm, rate: rm ? rates[rm] : null }; });
  const letzter = keys.length ? { monat: keys[keys.length - 1], rate: rates[keys[keys.length - 1]] } : null;
  return { fehlend, folgemonat: { monat: folgemonat, gepflegt: rates[folgemonat] != null }, letzter_kurs: letzter };
}
function nimmMonat(set, mon, bis) { if (/^\d{4}-\d{2}$/.test(mon) && mon <= bis) set.add(mon); }

module.exports = { loadRates, rateFor, toEur, enrichDealsEur, aeEurSql, aeEurGatedSql, moneyEurSql, rateSql, kursStatus };
