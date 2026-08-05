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
      // realisierte Werte mit gewonnen_monat umrechnen, sonst mit Angebotsmonat
      const monat = (src === 'ae_wert' || src === 'angenommenes_volumen') ? (r.gewonnen_monat || r.monat) : r.monat;
      r[dest] = r[src] == null ? null : toEur(r[src], cur, monat, rates);
    }
  }
  return rows;
}

// SQL-Ausdruck: beliebiges Betragsfeld in EUR. CHF-Companies (currency='CHF') mit dem Monatskurs
// des angegebenen Monats-Feldes umrechnen, sonst unverändert. Erfordert JOIN auf companies (Alias c).
function moneyEurSql(field, monatCol, dealAlias = 'd', compAlias = 'c') {
  return `(COALESCE(${dealAlias}.${field},0) * CASE WHEN ${compAlias}.currency = 'CHF'
    THEN COALESCE((SELECT r.rate FROM chf_eur_rates r WHERE r.monat = ${dealAlias}.${monatCol}), 1)
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

module.exports = { loadRates, rateFor, toEur, enrichDealsEur, aeEurSql, aeEurGatedSql, moneyEurSql };
