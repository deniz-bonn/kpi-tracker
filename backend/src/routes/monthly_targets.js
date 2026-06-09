const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');

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
