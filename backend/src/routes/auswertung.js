const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');

// Berechnet den vollständigen KPI-Block für einen Datensatz
function calcKpis(rows) {
  if (!rows.length) return null;
  const r = rows[0];
  const total = Number(r.total) || 0;
  const gewonnen = Number(r.gewonnen) || 0;
  const verloren = Number(r.verloren) || 0;
  const offen = Number(r.offen) || 0;
  const in_verhandlung = Number(r.in_verhandlung) || 0;
  const in_closing2 = Number(r.in_closing2) || 0;
  const ae_summe = Number(r.ae_summe) || 0;
  const angebotswert_gesamt = Number(r.angebotswert_gesamt) || 0;
  const wert_offen = Number(r.wert_offen) || 0;
  const gewonnen_cc = Number(r.gewonnen_cc) || 0;
  const gewonnen_mail = Number(r.gewonnen_mail) || 0;
  const gewonnen_fax = Number(r.gewonnen_fax) || 0;
  const gewonnen_mit_av = Number(r.gewonnen_mit_av) || 0;

  return {
    total, gewonnen, verloren, offen, in_verhandlung, in_closing2,
    ae_summe, angebotswert_gesamt, wert_offen,
    gewonnen_cc, gewonnen_mail, gewonnen_fax, gewonnen_mit_av,
    quote_angebote: total > 0 ? Math.round((gewonnen / total) * 100 * 10) / 10 : 0,
    quote_wert: angebotswert_gesamt > 0 ? Math.round((ae_summe / angebotswert_gesamt) * 100 * 10) / 10 : 0,
    quote_mit_av: gewonnen > 0 ? Math.round((gewonnen_mit_av / gewonnen) * 100 * 10) / 10 : 0,
  };
}

function calcKpisBK(rows) {
  if (!rows.length) return null;
  const r = rows[0];
  const total = Number(r.total) || 0;
  const gewonnen = Number(r.gewonnen) || 0;
  const verloren = Number(r.verloren) || 0;
  const ae_summe = Number(r.ae_summe) || 0;
  const angebotswert_gesamt = Number(r.angebotswert_gesamt) || 0;
  const wert_offen = Number(r.wert_offen) || 0;

  return {
    total, gewonnen, verloren,
    offen: total - gewonnen - verloren,
    ae_summe, angebotswert_gesamt, wert_offen,
    quote_angebote: total > 0 ? Math.round((gewonnen / total) * 100 * 10) / 10 : 0,
    quote_wert: angebotswert_gesamt > 0 ? Math.round((ae_summe / angebotswert_gesamt) * 100 * 10) / 10 : 0,
  };
}

// NK-Query: Gesamt oder nach Closer/Standort
function buildNKQuery(filters) {
  const conds = [...filters];
  return `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN d.status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
      SUM(CASE WHEN d.status='Verloren' THEN 1 ELSE 0 END) as verloren,
      SUM(CASE WHEN d.status='Offen' THEN 1 ELSE 0 END) as offen,
      SUM(CASE WHEN d.status='In Verhandlung' THEN 1 ELSE 0 END) as in_verhandlung,
      SUM(CASE WHEN d.status='In Closing Call 2' THEN 1 ELSE 0 END) as in_closing2,
      SUM(CASE WHEN d.status='Gewonnen' THEN COALESCE(d.ae_wert,0) ELSE 0 END) as ae_summe,
      SUM(COALESCE(d.angebotswert,0)) as angebotswert_gesamt,
      SUM(CASE WHEN d.status NOT IN ('Gewonnen','Verloren') THEN COALESCE(d.angebotswert,0) ELSE 0 END) as wert_offen,
      SUM(CASE WHEN d.status='Gewonnen' AND d.quelle='Cold Calling' THEN 1 ELSE 0 END) as gewonnen_cc,
      SUM(CASE WHEN d.status='Gewonnen' AND d.quelle='Mail' THEN 1 ELSE 0 END) as gewonnen_mail,
      SUM(CASE WHEN d.status='Gewonnen' AND d.quelle='Fax' THEN 1 ELSE 0 END) as gewonnen_fax,
      SUM(CASE WHEN d.status='Gewonnen' AND COALESCE(d.ae_wert,0) > 0 THEN 1 ELSE 0 END) as gewonnen_mit_av
    FROM deals_nk d
    LEFT JOIN employees e ON e.id = d.closer_id
    ${conds.length ? 'WHERE ' + conds.join(' AND ') : ''}
  `;
}

// BK/VL-Query
function buildBKQuery(table, filters) {
  const conds = [...filters];
  return `
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN d.status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
      SUM(CASE WHEN d.status='Verloren' THEN 1 ELSE 0 END) as verloren,
      SUM(CASE WHEN d.status='Gewonnen' THEN COALESCE(d.ae_wert,0) ELSE 0 END) as ae_summe,
      SUM(COALESCE(d.angebotswert,0)) as angebotswert_gesamt,
      SUM(CASE WHEN d.status NOT IN ('Gewonnen','Verloren') THEN COALESCE(d.angebotswert,0) ELSE 0 END) as wert_offen
    FROM ${table} d
    LEFT JOIN employees e ON e.id = d.kam_id
    ${conds.length ? 'WHERE ' + conds.join(' AND ') : ''}
  `;
}

// GET /api/auswertung/nk?company_id=&monat=&closer_id=&standort=
router.get('/nk', wrap(async (req, res) => {
  const { company_id, monat, closer_id, standort } = req.query;
  const d = db.dialect;
  let i = 1;
  const p = () => d === 'postgres' ? `$${i++}` : '?';

  const baseConds = [];
  const baseParams = [];
  if (company_id) { baseConds.push(`d.company_id = ${p()}`); baseParams.push(company_id); }
  if (monat) { baseConds.push(`d.monat = ${p()}`); baseParams.push(monat); }
  if (closer_id) { baseConds.push(`d.closer_id = ${p()}`); baseParams.push(closer_id); }
  if (standort) { baseConds.push(`e.standort = ${p()}`); baseParams.push(standort); }

  // Gesamt
  const gesamt = calcKpis(await db.all(buildNKQuery(baseConds), baseParams));

  // Pro Closer
  i = baseParams.length + 1;
  const closerRows = await db.all(`
    SELECT e.id, e.name, e.standort,
      COUNT(*) as total,
      SUM(CASE WHEN d.status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
      SUM(CASE WHEN d.status='Verloren' THEN 1 ELSE 0 END) as verloren,
      SUM(CASE WHEN d.status='Offen' THEN 1 ELSE 0 END) as offen,
      SUM(CASE WHEN d.status='In Verhandlung' THEN 1 ELSE 0 END) as in_verhandlung,
      SUM(CASE WHEN d.status='In Closing Call 2' THEN 1 ELSE 0 END) as in_closing2,
      SUM(CASE WHEN d.status='Gewonnen' THEN COALESCE(d.ae_wert,0) ELSE 0 END) as ae_summe,
      SUM(COALESCE(d.angebotswert,0)) as angebotswert_gesamt,
      SUM(CASE WHEN d.status NOT IN ('Gewonnen','Verloren') THEN COALESCE(d.angebotswert,0) ELSE 0 END) as wert_offen,
      SUM(CASE WHEN d.status='Gewonnen' AND d.quelle='Cold Calling' THEN 1 ELSE 0 END) as gewonnen_cc,
      SUM(CASE WHEN d.status='Gewonnen' AND d.quelle='Mail' THEN 1 ELSE 0 END) as gewonnen_mail,
      SUM(CASE WHEN d.status='Gewonnen' AND d.quelle='Fax' THEN 1 ELSE 0 END) as gewonnen_fax,
      SUM(CASE WHEN d.status='Gewonnen' AND COALESCE(d.ae_wert,0) > 0 THEN 1 ELSE 0 END) as gewonnen_mit_av
    FROM deals_nk d
    JOIN employees e ON e.id = d.closer_id
    ${baseConds.length ? 'WHERE ' + baseConds.join(' AND ') : ''}
    GROUP BY e.id, e.name, e.standort
    ORDER BY ae_summe DESC
  `, baseParams);

  const nach_closer = closerRows.map(r => ({
    id: r.id, name: r.name, standort: r.standort,
    ...calcKpis([r]),
  }));

  res.json({ gesamt, nach_closer });
}));

// GET /api/auswertung/bk?company_id=&monat=&kam_id=&standort=
router.get('/bk', wrap(async (req, res) => {
  const { company_id, monat, kam_id, standort } = req.query;
  const d = db.dialect;
  let i = 1;
  const p = () => d === 'postgres' ? `$${i++}` : '?';

  const baseConds = [];
  const baseParams = [];
  if (company_id) { baseConds.push(`d.company_id = ${p()}`); baseParams.push(company_id); }
  if (monat) { baseConds.push(`d.monat = ${p()}`); baseParams.push(monat); }
  if (kam_id) { baseConds.push(`d.kam_id = ${p()}`); baseParams.push(kam_id); }
  if (standort) { baseConds.push(`e.standort = ${p()}`); baseParams.push(standort); }

  const gesamt = calcKpisBK(await db.all(buildBKQuery('deals_bk', baseConds), baseParams));

  const kamRows = await db.all(`
    SELECT e.id, e.name, e.standort,
      COUNT(*) as total,
      SUM(CASE WHEN d.status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
      SUM(CASE WHEN d.status='Verloren' THEN 1 ELSE 0 END) as verloren,
      SUM(CASE WHEN d.status='Gewonnen' THEN COALESCE(d.ae_wert,0) ELSE 0 END) as ae_summe,
      SUM(COALESCE(d.angebotswert,0)) as angebotswert_gesamt,
      SUM(CASE WHEN d.status NOT IN ('Gewonnen','Verloren') THEN COALESCE(d.angebotswert,0) ELSE 0 END) as wert_offen
    FROM deals_bk d
    JOIN employees e ON e.id = d.kam_id
    ${baseConds.length ? 'WHERE ' + baseConds.join(' AND ') : ''}
    GROUP BY e.id, e.name, e.standort
    ORDER BY ae_summe DESC
  `, baseParams);

  const nach_kam = kamRows.map(r => ({ id: r.id, name: r.name, standort: r.standort, ...calcKpisBK([r]) }));

  res.json({ gesamt, nach_kam });
}));

// GET /api/auswertung/vl?company_id=&monat=&kam_id=&standort=
router.get('/vl', wrap(async (req, res) => {
  const { company_id, monat, kam_id, standort } = req.query;
  const d = db.dialect;
  let i = 1;
  const p = () => d === 'postgres' ? `$${i++}` : '?';

  const baseConds = [];
  const baseParams = [];
  if (company_id) { baseConds.push(`d.company_id = ${p()}`); baseParams.push(company_id); }
  if (monat) { baseConds.push(`d.monat = ${p()}`); baseParams.push(monat); }
  if (kam_id) { baseConds.push(`d.kam_id = ${p()}`); baseParams.push(kam_id); }
  if (standort) { baseConds.push(`e.standort = ${p()}`); baseParams.push(standort); }

  const gesamt = calcKpisBK(await db.all(buildBKQuery('deals_vl', baseConds), baseParams));

  const kamRows = await db.all(`
    SELECT e.id, e.name, e.standort,
      COUNT(*) as total,
      SUM(CASE WHEN d.status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
      SUM(CASE WHEN d.status='Verloren' THEN 1 ELSE 0 END) as verloren,
      SUM(CASE WHEN d.status='Gewonnen' THEN COALESCE(d.ae_wert,0) ELSE 0 END) as ae_summe,
      SUM(COALESCE(d.angebotswert,0)) as angebotswert_gesamt,
      SUM(CASE WHEN d.status NOT IN ('Gewonnen','Verloren') THEN COALESCE(d.angebotswert,0) ELSE 0 END) as wert_offen
    FROM deals_vl d
    JOIN employees e ON e.id = d.kam_id
    ${baseConds.length ? 'WHERE ' + baseConds.join(' AND ') : ''}
    GROUP BY e.id, e.name, e.standort
    ORDER BY ae_summe DESC
  `, baseParams);

  const nach_kam = kamRows.map(r => ({ id: r.id, name: r.name, standort: r.standort, ...calcKpisBK([r]) }));

  res.json({ gesamt, nach_kam });
}));

// GET /api/auswertung/auftragseingang?year=&company_id=
// Gewonnene Deals nach Monat und Standort (für die Auftragseingang-Übersicht)
router.get('/auftragseingang', wrap(async (req, res) => {
  const { company_id, year } = req.query;
  const d = db.dialect;
  const yr = year || String(new Date().getFullYear());

  const buildQ = (table, joinCol, extraSelect = '') => {
    let i = 1;
    const p = () => d === 'postgres' ? `$${i++}` : '?';
    const conds = [`d.status = ${p()}`, `d.gewonnen_monat LIKE ${p()}`];
    const params = ['Gewonnen', `${yr}-%`];
    if (company_id) { conds.push(`d.company_id = ${p()}`); params.push(company_id); }
    return {
      sql: `SELECT d.id, d.gewonnen_monat as monat, d.gewonnen_datum,
            d.kunde, COALESCE(d.ae_wert,0) as ae_wert,${extraSelect}
            COALESCE(e.standort,'') as standort, e.name as mitarbeiter
            FROM ${table} d LEFT JOIN employees e ON e.id = d.${joinCol}
            WHERE ${conds.join(' AND ')} ORDER BY d.gewonnen_monat, d.ae_wert DESC`,
      params
    };
  };

  const nkQ = buildQ('deals_nk', 'closer_id');
  const bkQ = buildQ('deals_bk', 'kam_id', ' d.dienstleistung,');
  const vlQ = buildQ('deals_vl', 'kam_id', ' d.dienstleistung,');

  const [nkDeals, bkDeals, vlDeals] = await Promise.all([
    db.all(nkQ.sql, nkQ.params),
    db.all(bkQ.sql, bkQ.params),
    db.all(vlQ.sql, vlQ.params),
  ]);

  const months = Array.from({ length: 12 }, (_, i) => `${yr}-${String(i + 1).padStart(2, '0')}`);

  const pickLoc = (deals, monat, standorte) =>
    deals.filter(d => d.monat === monat && standorte.includes(d.standort))
         .map(d => ({ kunde: d.kunde, ae_wert: Number(d.ae_wert), mitarbeiter: d.mitarbeiter, datum: d.gewonnen_datum, dienstleistung: d.dienstleistung || null }));

  const result = months.map(monat => {
    const nk = {
      bonn:         pickLoc(nkDeals, monat, ['Bonn']),
      braunschweig: pickLoc(nkDeals, monat, ['Braunschweig']),
      oesterreich:  pickLoc(nkDeals, monat, ['Österreich']),
      schweiz:      pickLoc(nkDeals, monat, ['Schweiz']),
    };
    nk.gesamt = [...nk.bonn, ...nk.braunschweig, ...nk.oesterreich, ...nk.schweiz]
      .reduce((s, d) => s + d.ae_wert, 0);

    const bk = {
      deutschland: pickLoc(bkDeals, monat, ['Bonn', 'Braunschweig']),
      oesterreich: pickLoc(bkDeals, monat, ['Österreich']),
      schweiz:     pickLoc(bkDeals, monat, ['Schweiz']),
    };
    bk.gesamt = [...bk.deutschland, ...bk.oesterreich, ...bk.schweiz]
      .reduce((s, d) => s + d.ae_wert, 0);

    const vl = {
      deutschland: pickLoc(vlDeals, monat, ['Bonn', 'Braunschweig']),
      oesterreich: pickLoc(vlDeals, monat, ['Österreich']),
      schweiz:     pickLoc(vlDeals, monat, ['Schweiz']),
    };
    vl.gesamt = [...vl.deutschland, ...vl.oesterreich, ...vl.schweiz]
      .reduce((s, d) => s + d.ae_wert, 0);

    return { monat, nk, bk, vl };
  });

  res.json(result);
}));

// Alle Standorte aus Mitarbeitern
router.get('/standorte', wrap(async (req, res) => {
  const rows = await db.all("SELECT DISTINCT standort FROM employees WHERE standort IS NOT NULL AND standort != '' ORDER BY standort");
  res.json(rows.map(r => r.standort));
}));

module.exports = router;
