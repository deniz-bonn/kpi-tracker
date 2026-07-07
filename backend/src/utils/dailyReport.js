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

// KPI-Mail bezieht sich nur auf diesen Standort
const KPI_REPORT_STANDORT = process.env.KPI_REPORT_STANDORT || 'Bonn';

async function buildKpiEmailData(datum, monat) {
  const d = db.dialect;
  const p = i => d === 'postgres' ? `$${i}` : '?';
  const standort = KPI_REPORT_STANDORT;

  const [logs, monthAgg, inboundAgg, nkAgg] = await Promise.all([
    db.all(
      `SELECT a.*, e.name AS employee_name, e.rolle AS employee_rolle, e.standort
       FROM activity_logs a
       LEFT JOIN employees e ON e.id = a.employee_id
       WHERE a.datum=${p(1)} AND e.standort=${p(2)}
       ORDER BY e.name`,
      [datum, standort]
    ),
    // Monat kumuliert (nur Standort)
    db.get(
      `SELECT
         COALESCE(SUM(a.entscheider_erreicht),0)     AS entscheider,
         COALESCE(SUM(a.entscheider_terminiert),0)   AS terminiert,
         COALESCE(SUM(a.settings_geplant),0)         AS settings_geplant,
         COALESCE(SUM(a.settings_stattgefunden),0)   AS settings,
         COALESCE(SUM(a.beratung_vereinbart),0)      AS beratung_vereinbart,
         COALESCE(SUM(a.beratungen_geplant),0)       AS beratungen_geplant,
         COALESCE(SUM(a.beratungen_stattgefunden),0) AS beratungen
       FROM activity_logs a
       LEFT JOIN employees e ON e.id = a.employee_id
       WHERE a.monat=${p(1)} AND e.standort=${p(2)}`,
      [monat, standort]
    ),
    // Inbound-Leads Monat (für Lead-Terminierungsquote — keine Standort-Dimension)
    db.get(
      `SELECT
         COALESCE(SUM(COALESCE(inbound_mail,0)+COALESCE(inbound_fax,0)+COALESCE(inbound_ad,0)),0)          AS leads,
         COALESCE(SUM(COALESCE(terminiert_mail,0)+COALESCE(terminiert_fax,0)+COALESCE(terminiert_ad,0)),0) AS terminiert
       FROM inbound_daily WHERE monat=${p(1)}`,
      [monat]
    ),
    // NK-Deals Monat (für Closing-Rate — Closer oder Setter am Standort)
    db.get(
      `SELECT COUNT(*) AS angebote,
         COALESCE(SUM(CASE WHEN dl.status='Gewonnen' THEN 1 ELSE 0 END),0) AS gewonnen
       FROM deals_nk dl
       LEFT JOIN employees ec ON ec.id = dl.closer_id
       LEFT JOIN employees es ON es.id = dl.setter_id
       WHERE dl.monat=${p(1)} AND (ec.standort=${p(2)} OR es.standort=${p(3)})`,
      [monat, standort, standort]
    ),
  ]);

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

  // Tages-Detailsummen (für Quoten heute)
  const day = {
    settings_geplant:    logs.reduce((s, l) => s + n(l.settings_geplant), 0),
    beratung_vereinbart: logs.reduce((s, l) => s + n(l.beratung_vereinbart), 0),
    beratungen_geplant:  logs.reduce((s, l) => s + n(l.beratungen_geplant), 0),
  };

  // Arbeitstage (Mo–Fr): gesamt + bis einschließlich `datum` vergangen
  const [y, m] = monat.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const elapsedUntil = datum.startsWith(monat) ? Number(datum.slice(8, 10)) : daysInMonth;
  let workdays = 0, elapsedWorkdays = 0;
  for (let dd = 1; dd <= daysInMonth; dd++) {
    const wd = new Date(y, m - 1, dd).getDay();
    if (wd !== 0 && wd !== 6) {
      workdays++;
      if (dd <= elapsedUntil) elapsedWorkdays++;
    }
  }

  const month = {
    entscheider:         n(monthAgg?.entscheider),
    terminiert:          n(monthAgg?.terminiert),
    settings_geplant:    n(monthAgg?.settings_geplant),
    settings:            n(monthAgg?.settings),
    beratung_vereinbart: n(monthAgg?.beratung_vereinbart),
    beratungen_geplant:  n(monthAgg?.beratungen_geplant),
    beratungen:          n(monthAgg?.beratungen),
  };
  const inbound = { leads: n(inboundAgg?.leads), terminiert: n(inboundAgg?.terminiert) };
  const nk      = { angebote: n(nkAgg?.angebote), gewonnen: n(nkAgg?.gewonnen) };

  return { datum, monat, standort, perEmployee, totals, day, month, inbound, nk, workdays, elapsedWorkdays };
}

module.exports = { buildDashboardEmailData, buildKpiEmailData, fmtEuro, fmt, fmtMonth };
