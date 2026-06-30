const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');

function whereClause(conditions) {
  return conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
}

// GET /api/kpis/overview?company_id=&monat=
// Angebots-KPIs nach Erstellungsmonat; AE-Summe nach gewonnen_monat
router.get('/overview', wrap(async (req, res) => {
  const { company_id, monat } = req.query;
  const d = db.dialect;

  const buildFilter = (alias, col = 'monat') => {
    const conds = [];
    const params = [];
    let i = 1;
    const p = () => d === 'postgres' ? `$${i++}` : '?';
    if (company_id) { conds.push(`${alias}.company_id = ${p()}`); params.push(company_id); }
    if (monat) { conds.push(`${alias}.${col} = ${p()}`); params.push(monat); }
    return { conds, params };
  };

  const querySummary = async (table) => {
    const f = buildFilter('d', 'monat');
    const aeF = buildFilter('d', 'gewonnen_monat');
    const [counts, ae] = await Promise.all([
      db.all(`SELECT COUNT(*) as total,
        SUM(CASE WHEN status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
        SUM(CASE WHEN status='Verloren' THEN 1 ELSE 0 END) as verloren,
        SUM(CASE WHEN status='Offen' THEN 1 ELSE 0 END) as offen
        FROM ${table} d${whereClause(f.conds)}`, f.params),
      db.get(`SELECT SUM(ae_wert) as ae_summe FROM ${table} d
        WHERE status='Gewonnen'${aeF.conds.length ? ' AND '+aeF.conds.join(' AND ') : ''}`, aeF.params),
    ]);
    const r = counts[0] || {};
    const total = Number(r.total) || 0;
    const gewonnen = Number(r.gewonnen) || 0;
    return {
      total, gewonnen,
      verloren: Number(r.verloren) || 0,
      offen: Number(r.offen) || 0,
      ae_summe: Number(ae?.ae_summe) || 0,
      quote: total > 0 ? Math.round((gewonnen / total) * 100) : 0,
    };
  };

  const nkF = buildFilter('d', 'monat');
  const nkQuelle = await db.all(`
    SELECT quelle, COUNT(*) as total,
      SUM(CASE WHEN status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen
    FROM deals_nk d${whereClause(nkF.conds)}
    GROUP BY quelle
  `, nkF.params);

  const [nk, bk, vl] = await Promise.all([
    querySummary('deals_nk'),
    querySummary('deals_bk'),
    querySummary('deals_vl'),
  ]);

  res.json({
    nk: {
      ...nk,
      nach_quelle: nkQuelle.map(q => ({
        quelle: q.quelle,
        total: Number(q.total),
        gewonnen: Number(q.gewonnen),
        quote: Number(q.total) > 0 ? Math.round((Number(q.gewonnen) / Number(q.total)) * 100) : 0,
      })),
    },
    bk,
    vl,
  });
}));

// GET /api/kpis/monthly?company_id=&year=
router.get('/monthly', wrap(async (req, res) => {
  const { company_id, year } = req.query;
  const d = db.dialect;

  const buildFilter = (alias, col) => {
    const conds = [];
    const params = [];
    let i = 1;
    const p = () => d === 'postgres' ? `$${i++}` : '?';
    if (company_id) { conds.push(`${alias}.company_id = ${p()}`); params.push(company_id); }
    if (year) { conds.push(`${alias}.${col} LIKE ${p()}`); params.push(`${year}-%`); }
    return { conds, params };
  };

  const aggregate = async (table) => {
    const f = buildFilter('d', 'monat');
    const aeF = buildFilter('d', 'gewonnen_monat');

    const [rows, aeRows] = await Promise.all([
      db.all(`SELECT monat, COUNT(*) as total,
        SUM(CASE WHEN status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
        SUM(CASE WHEN status='Verloren' THEN 1 ELSE 0 END) as verloren,
        SUM(CASE WHEN status='Offen' THEN 1 ELSE 0 END) as offen
        FROM ${table} d${whereClause(f.conds)}
        GROUP BY monat ORDER BY monat`, f.params),
      db.all(`SELECT gewonnen_monat as monat, SUM(ae_wert) as ae_summe
        FROM ${table} d WHERE status='Gewonnen' AND gewonnen_monat IS NOT NULL
        ${aeF.conds.length ? 'AND '+aeF.conds.join(' AND ') : ''}
        GROUP BY gewonnen_monat ORDER BY gewonnen_monat`, aeF.params),
    ]);

    return rows.map(r => ({
      ...r,
      total: Number(r.total), gewonnen: Number(r.gewonnen),
      verloren: Number(r.verloren), offen: Number(r.offen),
      ae_summe: Number(aeRows.find(a => a.monat === r.monat)?.ae_summe) || 0,
      quote: Number(r.total) > 0 ? Math.round((Number(r.gewonnen) / Number(r.total)) * 100) : 0,
    }));
  };

  const [nk, bk, vl] = await Promise.all([
    aggregate('deals_nk'),
    aggregate('deals_bk'),
    aggregate('deals_vl'),
  ]);

  res.json({ nk, bk, vl });
}));

// GET /api/kpis/employees?company_id=&monat=&year=
router.get('/employees', wrap(async (req, res) => {
  const { company_id, monat, year } = req.query;
  const d = db.dialect;

  const buildFilter = (alias) => {
    const conds = [];
    const params = [];
    let i = 1;
    const p = () => d === 'postgres' ? `$${i++}` : '?';
    if (company_id) { conds.push(`${alias}.company_id = ${p()}`); params.push(company_id); }
    if (monat) { conds.push(`${alias}.monat = ${p()}`); params.push(monat); }
    else if (year) { conds.push(`${alias}.monat LIKE ${p()}`); params.push(`${year}-%`); }
    return { conds, params };
  };

  const addQuote = rows => rows.map(r => ({
    ...r,
    total: Number(r.total), gewonnen: Number(r.gewonnen),
    verloren: Number(r.verloren), offen: Number(r.offen),
    ae_summe: Number(r.ae_summe) || 0,
    quote: Number(r.total) > 0 ? Math.round((Number(r.gewonnen) / Number(r.total)) * 100) : 0,
  }));

  const nkCloserF = buildFilter('d');
  const nkOpenerF = buildFilter('d');
  const nkSetterF = buildFilter('d');
  const bkKamF = buildFilter('d');
  const vlKamF = buildFilter('d');

  const [nkCloser, nkOpener, nkSetter, bkKam, vlKam] = await Promise.all([
    db.all(`SELECT e.id, e.name,
      COUNT(*) as total,
      SUM(CASE WHEN d.status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
      SUM(CASE WHEN d.status='Verloren' THEN 1 ELSE 0 END) as verloren,
      SUM(CASE WHEN d.status='Offen' THEN 1 ELSE 0 END) as offen,
      SUM(CASE WHEN d.status='Gewonnen' THEN COALESCE(d.ae_wert,0) ELSE 0 END) as ae_summe
      FROM deals_nk d JOIN employees e ON e.id=d.closer_id
      WHERE e.show_in_kpi != 0 ${nkCloserF.conds.length ? 'AND '+nkCloserF.conds.join(' AND ') : ''}
      GROUP BY e.id,e.name ORDER BY ae_summe DESC`, nkCloserF.params),

    db.all(`SELECT e.id, e.name,
      COUNT(*) as total,
      SUM(CASE WHEN d.status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
      SUM(CASE WHEN d.status='Verloren' THEN 1 ELSE 0 END) as verloren,
      SUM(CASE WHEN d.status='Offen' THEN 1 ELSE 0 END) as offen,
      0 as ae_summe
      FROM deals_nk d JOIN employees e ON e.id=d.opener_id
      WHERE e.show_in_kpi != 0 ${nkOpenerF.conds.length ? 'AND '+nkOpenerF.conds.join(' AND ') : ''}
      GROUP BY e.id,e.name ORDER BY gewonnen DESC`, nkOpenerF.params),

    db.all(`SELECT e.id, e.name,
      COUNT(*) as total,
      SUM(CASE WHEN d.status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
      SUM(CASE WHEN d.status='Verloren' THEN 1 ELSE 0 END) as verloren,
      SUM(CASE WHEN d.status='Offen' THEN 1 ELSE 0 END) as offen,
      0 as ae_summe
      FROM deals_nk d JOIN employees e ON e.id=d.setter_id
      WHERE e.show_in_kpi != 0 ${nkSetterF.conds.length ? 'AND '+nkSetterF.conds.join(' AND ') : ''}
      GROUP BY e.id,e.name ORDER BY gewonnen DESC`, nkSetterF.params),

    db.all(`SELECT e.id, e.name,
      COUNT(*) as total,
      SUM(CASE WHEN d.status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
      SUM(CASE WHEN d.status='Verloren' THEN 1 ELSE 0 END) as verloren,
      SUM(CASE WHEN d.status='Offen' THEN 1 ELSE 0 END) as offen,
      SUM(CASE WHEN d.status='Gewonnen' THEN COALESCE(d.ae_wert,0) ELSE 0 END) as ae_summe
      FROM deals_bk d JOIN employees e ON e.id=d.kam_id
      WHERE e.show_in_kpi != 0 ${bkKamF.conds.length ? 'AND '+bkKamF.conds.join(' AND ') : ''}
      GROUP BY e.id,e.name ORDER BY ae_summe DESC`, bkKamF.params),

    db.all(`SELECT e.id, e.name,
      COUNT(*) as total,
      SUM(CASE WHEN d.status='Gewonnen' THEN 1 ELSE 0 END) as gewonnen,
      SUM(CASE WHEN d.status='Verloren' THEN 1 ELSE 0 END) as verloren,
      SUM(CASE WHEN d.status='Offen' THEN 1 ELSE 0 END) as offen,
      SUM(CASE WHEN d.status='Gewonnen' THEN COALESCE(d.ae_wert,0) ELSE 0 END) as ae_summe
      FROM deals_vl d JOIN employees e ON e.id=d.kam_id
      WHERE e.show_in_kpi != 0 ${vlKamF.conds.length ? 'AND '+vlKamF.conds.join(' AND ') : ''}
      GROUP BY e.id,e.name ORDER BY ae_summe DESC`, vlKamF.params),
  ]);

  res.json({
    nk_closer: addQuote(nkCloser),
    nk_opener: addQuote(nkOpener),
    nk_setter: addQuote(nkSetter),
    bk_kam: addQuote(bkKam),
    vl_kam: addQuote(vlKam),
  });
}));

// GET /api/kpis/targets-vs-actual?company_id=&monat=
router.get('/targets-vs-actual', wrap(async (req, res) => {
  const { company_id, monat } = req.query;
  const d = db.dialect;
  const conds = [];
  const params = [];
  let i = 1;
  const p = () => d === 'postgres' ? `$${i++}` : '?';
  if (company_id) { conds.push(`t.company_id = ${p()}`); params.push(company_id); }
  if (monat) { conds.push(`t.monat = ${p()}`); params.push(monat); }

  const targets = await db.all(
    `SELECT t.*, c.name as company_name FROM targets t JOIN companies c ON c.id=t.company_id${whereClause(conds)} ORDER BY t.monat`,
    params
  );

  const result = await Promise.all(targets.map(async (t) => {
    const ph = d === 'postgres' ? ['$1','$2'] : ['?','?'];
    const [nkAE, bkAE, vlAE] = await Promise.all([
      db.get(`SELECT SUM(ae_wert) as ae FROM deals_nk WHERE company_id=${ph[0]} AND gewonnen_monat=${ph[1]} AND status='Gewonnen'`, [t.company_id, t.monat]),
      db.get(`SELECT SUM(ae_wert) as ae FROM deals_bk WHERE company_id=${ph[0]} AND gewonnen_monat=${ph[1]} AND status='Gewonnen'`, [t.company_id, t.monat]),
      db.get(`SELECT SUM(ae_wert) as ae FROM deals_vl WHERE company_id=${ph[0]} AND gewonnen_monat=${ph[1]} AND status='Gewonnen'`, [t.company_id, t.monat]),
    ]);
    return { ...t, nk_ist: Number(nkAE?.ae)||0, bk_ist: Number(bkAE?.ae)||0, vl_ist: Number(vlAE?.ae)||0 };
  }));

  res.json(result);
}));

// GET /api/kpis/dashboard?year=&company_id=
// Monatliche AE-Übersicht nach Standort (Google-Sheet-Stil)
router.get('/dashboard', wrap(async (req, res) => {
  const { company_id, year } = req.query;
  const d = db.dialect;
  const yr = year || String(new Date().getFullYear());

  // Baut WHERE-Clause + params für eine Query
  const mk = () => {
    let i = 1;
    const p = () => d === 'postgres' ? `$${i++}` : '?';
    const conds = [];
    const params = [];
    if (company_id) { conds.push(`d.company_id = ${p()}`); params.push(company_id); }
    conds.push(`d.gewonnen_monat LIKE ${p()}`); params.push(`${yr}-%`);
    conds.push(`d.status = ${p()}`); params.push('Gewonnen');
    return { where: 'WHERE ' + conds.join(' AND '), params };
  };

  // Load authoritative monthly totals from AE Gesamt import
  const aeGesamtRows = await db.all(
    `SELECT * FROM ae_gesamt_monthly WHERE monat LIKE ${d === 'postgres' ? '$1' : '?'} ORDER BY monat`,
    [`${yr}-%`]
  );
  const aeGesamt = (monat) => aeGesamtRows.find(r => r.monat === monat) || null;

  const [nkByLoc, bkByLoc, vlByLoc, nkTotal, bkTotal, vlTotal, zieleRows, nkCntByLoc] = await Promise.all([
    // NK AE nach Closer-Standort
    (() => { const f = mk(); return db.all(
      `SELECT d.gewonnen_monat as monat, COALESCE(e.standort,'') as standort, SUM(d.ae_wert) as ae
       FROM deals_nk d LEFT JOIN employees e ON e.id=d.closer_id ${f.where}
       GROUP BY d.gewonnen_monat, e.standort`, f.params); })(),
    // BK nach KAM-Standort
    (() => { const f = mk(); return db.all(
      `SELECT d.gewonnen_monat as monat, COALESCE(e.standort,'') as standort, SUM(d.ae_wert) as ae
       FROM deals_bk d LEFT JOIN employees e ON e.id=d.kam_id ${f.where}
       GROUP BY d.gewonnen_monat, e.standort`, f.params); })(),
    // VL nach KAM-Standort
    (() => { const f = mk(); return db.all(
      `SELECT d.gewonnen_monat as monat, COALESCE(e.standort,'') as standort, SUM(d.ae_wert) as ae
       FROM deals_vl d LEFT JOIN employees e ON e.id=d.kam_id ${f.where}
       GROUP BY d.gewonnen_monat, e.standort`, f.params); })(),
    // NK Gesamt
    (() => { const f = mk(); return db.all(
      `SELECT d.gewonnen_monat as monat, SUM(d.ae_wert) as ae FROM deals_nk d ${f.where} GROUP BY d.gewonnen_monat`, f.params); })(),
    // BK Gesamt
    (() => { const f = mk(); return db.all(
      `SELECT d.gewonnen_monat as monat, SUM(d.ae_wert) as ae FROM deals_bk d ${f.where} GROUP BY d.gewonnen_monat`, f.params); })(),
    // VL Gesamt
    (() => { const f = mk(); return db.all(
      `SELECT d.gewonnen_monat as monat, SUM(d.ae_wert) as ae FROM deals_vl d ${f.where} GROUP BY d.gewonnen_monat`, f.params); })(),
    // Monatsziele
    (() => {
      let i = 1; const p = () => d === 'postgres' ? `$${i++}` : '?';
      return db.all(`SELECT monat, ziel_gesamt FROM monthly_targets WHERE monat LIKE ${p()} ORDER BY monat`, [`${yr}-%`]);
    })(),
    // NK Anzahl (Gewonnene Neukunden) nach Closer-Standort
    (() => { const f = mk(); return db.all(
      `SELECT d.gewonnen_monat as monat, COALESCE(e.standort,'') as standort, COUNT(*) as cnt
       FROM deals_nk d LEFT JOIN employees e ON e.id=d.closer_id ${f.where}
       GROUP BY d.gewonnen_monat, e.standort`, f.params); })(),
  ]);

  const locAE = (arr, monat, standorte) => (arr || [])
    .filter(r => r.monat === monat && standorte.includes(r.standort))
    .reduce((s, r) => s + (Number(r.ae) || 0), 0);
  const totAE = (arr, monat) => Number((arr || []).find(r => r.monat === monat)?.ae) || 0;
  const locCnt = (arr, monat, standorte) => (arr || [])
    .filter(r => r.monat === monat && standorte.includes(r.standort))
    .reduce((s, r) => s + (Number(r.cnt) || 0), 0);

  const months = Array.from({ length: 12 }, (_, i) => `${yr}-${String(i + 1).padStart(2, '0')}`);

  const rows = months.map(monat => {
    const ag = aeGesamt(monat); // authoritative AE Gesamt record (may be null)

    // NK – immer aus Live-Deals (deals_nk), damit neue gewonnene Deals sofort erscheinen
    // und nk_gesamt korrekt als Summe aller Standorte ausgewiesen wird.
    const n = (v) => Number(v ?? 0) || 0;
    const useAG = ag && ag.gesamt > 0; // noch für BK/VL-Gesamt-Overrides genutzt

    const nk_bonn   = locAE(nkByLoc, monat, ['Bonn']);
    const nk_bs     = locAE(nkByLoc, monat, ['Braunschweig']);
    const nk_at     = locAE(nkByLoc, monat, ['Österreich']);
    const nk_ch     = locAE(nkByLoc, monat, ['Schweiz']);
    const nk_gesamt = nk_bonn + nk_bs + nk_at + nk_ch;

    const nk_bonn_anz = locCnt(nkCntByLoc, monat, ['Bonn']);
    const nk_bs_anz   = locCnt(nkCntByLoc, monat, ['Braunschweig']);
    const nk_at_anz   = locCnt(nkCntByLoc, monat, ['Österreich']);
    const nk_ch_anz   = locCnt(nkCntByLoc, monat, ['Schweiz']);
    const nk_gesamt_anz = nk_bonn_anz + nk_bs_anz + nk_at_anz + nk_ch_anz;

    // BK / VL – Gesamt aus ae_gesamt_monthly als Override; Standort-Aufschlüsselung immer Live
    const bk_de     = locAE(bkByLoc, monat, ['Bonn', 'Braunschweig']);
    const bk_at     = locAE(bkByLoc, monat, ['Österreich']);
    const bk_ch     = locAE(bkByLoc, monat, ['Schweiz']);
    const bk_gesamt = useAG ? n(ag.bk_gesamt) : totAE(bkTotal, monat);

    const vl_de     = locAE(vlByLoc, monat, ['Bonn', 'Braunschweig']);
    const vl_at     = locAE(vlByLoc, monat, ['Österreich']);
    const vl_ch     = locAE(vlByLoc, monat, ['Schweiz']);
    const vl_gesamt = useAG ? n(ag.vl_gesamt) : totAE(vlTotal, monat);

    const gesamt = nk_gesamt + bk_gesamt + vl_gesamt;
    const pct = v => gesamt > 0 ? Math.round((v / gesamt) * 10000) / 100 : 0;

    const ziel = Number(zieleRows.find(t => t.monat === monat)?.ziel_gesamt) || 0;

    return {
      monat,
      nk_bonn, nk_bs, nk_at, nk_ch, nk_gesamt,
      nk_bonn_anz, nk_bs_anz, nk_at_anz, nk_ch_anz, nk_gesamt_anz,
      nk_anteil: pct(nk_gesamt),
      bk_de, bk_at, bk_ch, bk_gesamt,
      bk_anteil: pct(bk_gesamt),
      vl_de, vl_at, vl_ch, vl_gesamt,
      vl_anteil: pct(vl_gesamt),
      gesamt,
      ziel,
      differenz: ziel > 0 ? gesamt - ziel : null,
    };
  });

  res.json(rows);
}));

module.exports = router;
