const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');
const { requireRole } = require('../middleware/auth');

// ── Monatsziele Auftragseingang je STANDORT ───────────────────────────────────
// Getrennt vom Gruppenziel (monthly_targets.ziel_gesamt), das unverändert bleibt.
// GET /api/monthly-targets/standort?year=2026  bzw. ?monat=2026-08
router.get('/standort', wrap(async (req, res) => {
  const { year, monat } = req.query;
  const d = db.dialect;
  let i = 1;
  const p = () => d === 'postgres' ? `$${i++}` : '?';
  if (monat) {
    return res.json(await db.all(
      `SELECT monat, standort, ziel_ae FROM monthly_targets_standort WHERE monat = ${p()} ORDER BY standort`,
      [monat]));
  }
  if (year) {
    return res.json(await db.all(
      `SELECT monat, standort, ziel_ae FROM monthly_targets_standort WHERE monat LIKE ${p()} ORDER BY monat, standort`,
      [`${year}-%`]));
  }
  res.json(await db.all(
    'SELECT monat, standort, ziel_ae FROM monthly_targets_standort ORDER BY monat DESC, standort'));
}));

// POST /api/monthly-targets/standort  { monat, standort, ziel_ae }  (Admin/Superadmin)
router.post('/standort', requireRole('admin'), wrap(async (req, res) => {
  const { monat, standort, ziel_ae } = req.body;
  if (!monat || !standort) return res.status(400).json({ error: 'monat und standort sind erforderlich' });
  const wert = Number(ziel_ae) || 0;

  if (db.dialect === 'postgres') {
    const row = await db.get(
      `INSERT INTO monthly_targets_standort (monat, standort, ziel_ae) VALUES ($1,$2,$3)
       ON CONFLICT (monat, standort) DO UPDATE SET ziel_ae=$4, updated_at=NOW()
       RETURNING monat, standort, ziel_ae`,
      [monat, standort, wert, wert]);
    return res.json(row);
  }
  db.run(
    `INSERT INTO monthly_targets_standort (monat, standort, ziel_ae) VALUES (?,?,?)
     ON CONFLICT (monat, standort) DO UPDATE SET ziel_ae=excluded.ziel_ae, updated_at=datetime('now')`,
    [monat, standort, wert]);
  res.json(await db.get(
    'SELECT monat, standort, ziel_ae FROM monthly_targets_standort WHERE monat=? AND standort=?',
    [monat, standort]));
}));

// GET /api/monthly-targets?year=2026
router.get('/', wrap(async (req, res) => {
  const { year } = req.query;
  const d = db.dialect;
  if (year) {
    let i = 1;
    const p = () => d === 'postgres' ? `$${i++}` : '?';
    const rows = await db.all(`SELECT monat, ziel_gesamt FROM monthly_targets WHERE monat LIKE ${p()} ORDER BY monat`, [`${year}-%`]);
    return res.json(rows);
  }
  res.json(await db.all('SELECT monat, ziel_gesamt FROM monthly_targets ORDER BY monat DESC'));
}));

// POST /api/monthly-targets  { monat, ziel_gesamt }
router.post('/', wrap(async (req, res) => {
  const { monat, ziel_gesamt } = req.body;
  if (!monat) return res.status(400).json({ error: 'monat required' });
  const d = db.dialect;

  if (d === 'postgres') {
    let i = 1;
    const p = () => `$${i++}`;
    const row = await db.get(
      `INSERT INTO monthly_targets (monat, ziel_gesamt) VALUES (${p()},${p()})
       ON CONFLICT (monat) DO UPDATE SET ziel_gesamt=${p()}, updated_at=NOW()
       RETURNING *`,
      [monat, ziel_gesamt ?? 0, ziel_gesamt ?? 0]
    );
    return res.json(row);
  } else {
    db.run(
      `INSERT INTO monthly_targets (monat, ziel_gesamt) VALUES (?,?)
       ON CONFLICT (monat) DO UPDATE SET ziel_gesamt=excluded.ziel_gesamt, updated_at=datetime('now')`,
      [monat, ziel_gesamt ?? 0]
    );
    return res.json(await db.get('SELECT monat, ziel_gesamt FROM monthly_targets WHERE monat=?', [monat]));
  }
}));

module.exports = router;
