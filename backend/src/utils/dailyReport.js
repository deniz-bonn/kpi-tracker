const db = require('../db');

const fmt = n => {
  const v = Number(n) || 0;
  return v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const fmtEuro = n => {
  const v = Number(n) || 0;
  return v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const fmtMonth = m => {
  if (!m) return '';
  const [y, mo] = m.split('-');
  return new Date(Number(y), Number(mo) - 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
};

async function buildDashboardEmailData(monat, today) {
  const d = db.dialect;
  const p = i => d === 'postgres' ? `$${i}` : '?';

  const [nkMonth, bkMonth, vlMonth, nkToday, bkToday, vlToday, zielRow] = await Promise.all([
    // NK Monatstotals nach Standort
    db.all(
      `SELECT COALESCE(e.standort,'—') as standort, COUNT(*) as cnt, SUM(d.ae_wert) as ae
       FROM deals_nk d LEFT JOIN employees e ON e.id=d.closer_id
       WHERE d.gewonnen_monat=${p(1)} AND d.status='Gewonnen'
       GROUP BY e.standort ORDER BY ae DESC`,
      [monat]
    ),
    // BK Monatstotals nach Standort
    db.all(
      `SELECT COALESCE(e.standort,'—') as standort, COUNT(*) as cnt, SUM(d.ae_wert) as ae
       FROM deals_bk d LEFT JOIN employees e ON e.id=d.kam_id
       WHERE d.gewonnen_monat=${p(1)} AND d.status='Gewonnen'
       GROUP BY e.standort ORDER BY ae DESC`,
      [monat]
    ),
    // VL Monatstotals nach Standort
    db.all(
      `SELECT COALESCE(e.standort,'—') as standort, COUNT(*) as cnt, SUM(d.ae_wert) as ae
       FROM deals_vl d LEFT JOIN employees e ON e.id=d.kam_id
       WHERE d.gewonnen_monat=${p(1)} AND d.status='Gewonnen'
       GROUP BY e.standort ORDER BY ae DESC`,
      [monat]
    ),
    // NK heute gewonnen
    db.all(
      `SELECT d.kunde, d.ae_wert, COALESCE(e.standort,'—') as standort, e.name as mitarbeiter, d.dienstleistung
       FROM deals_nk d LEFT JOIN employees e ON e.id=d.closer_id
       WHERE d.gewonnen_datum=${p(1)} AND d.status='Gewonnen'
       ORDER BY d.ae_wert DESC`,
      [today]
    ),
    // BK heute gewonnen
    db.all(
      `SELECT d.kunde, d.ae_wert, COALESCE(e.standort,'—') as standort, e.name as mitarbeiter, d.dienstleistung
       FROM deals_bk d LEFT JOIN employees e ON e.id=d.kam_id
       WHERE d.gewonnen_datum=${p(1)} AND d.status='Gewonnen'
       ORDER BY d.ae_wert DESC`,
      [today]
    ),
    // VL heute gewonnen
    db.all(
      `SELECT d.kunde, d.ae_wert, COALESCE(e.standort,'—') as standort, e.name as mitarbeiter, d.dienstleistung
       FROM deals_vl d LEFT JOIN employees e ON e.id=d.kam_id
       WHERE d.gewonnen_datum=${p(1)} AND d.status='Gewonnen'
       ORDER BY d.ae_wert DESC`,
      [today]
    ),
    // Monatsziel
    db.get(
      `SELECT ziel_gesamt FROM monthly_targets WHERE monat=${p(1)}`,
      [monat]
    ),
  ]);

  const monatsziel = Number(zielRow?.ziel_gesamt) || 0;
  return { monat, today, nkMonth, bkMonth, vlMonth, nkToday, bkToday, vlToday, monatsziel };
}

async function buildKpiEmailData(datum, monat) {
  const d = db.dialect;
  const p = i => d === 'postgres' ? `$${i}` : '?';

  const logs = await db.all(
    `SELECT a.*, e.name AS employee_name, e.rolle AS employee_rolle, e.standort
     FROM activity_logs a
     LEFT JOIN employees e ON e.id = a.employee_id
     WHERE a.datum=${p(1)}
     ORDER BY e.name`,
    [datum]
  );

  const n = (v) => Number(v) || 0;

  const perEmployee = logs.map(l => ({
    name:        l.employee_name || `MA #${l.employee_id}`,
    rolle:       l.employee_rolle || '—',
    standort:    l.standort || '—',
    entscheider: n(l.entscheider_erreicht),
    terminiert:  n(l.entscheider_terminiert),
    settings:    n(l.settings_stattgefunden),
    beratungen:  n(l.beratungen_stattgefunden),
  }));

  const sum = key => perEmployee.reduce((s, e) => s + e[key], 0);

  const totals = {
    entscheider: sum('entscheider'),
    terminiert:  sum('terminiert'),
    settings:    sum('settings'),
    beratungen:  sum('beratungen'),
  };

  return { datum, monat, perEmployee, totals };
}

module.exports = { buildDashboardEmailData, buildKpiEmailData, fmtEuro, fmt, fmtMonth };
