const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

router.use(requireAuth);

// Lesen: alle eingeloggten Nutzer (fürs Anzeige-Umrechnen im Frontend)
router.get('/', wrap(async (req, res) => {
  res.json(await db.all('SELECT monat, rate FROM chf_eur_rates ORDER BY monat DESC'));
}));

// Upsert eines Monatskurses — nur Admin/Superadmin. rate = EUR pro 1 CHF.
router.put('/:monat', requireRole('admin'), wrap(async (req, res) => {
  const { monat } = req.params;
  const rate = Number(req.body.rate);
  if (!/^\d{4}-\d{2}$/.test(monat) || !(rate > 0)) {
    return res.status(400).json({ error: 'monat (YYYY-MM) und rate > 0 erforderlich' });
  }
  if (db.dialect === 'postgres') {
    await db.run(
      `INSERT INTO chf_eur_rates (monat, rate) VALUES ($1,$2)
       ON CONFLICT (monat) DO UPDATE SET rate=$2, updated_at=NOW()`,
      [monat, rate]
    );
  } else {
    db.run(
      `INSERT INTO chf_eur_rates (monat, rate) VALUES (?,?)
       ON CONFLICT(monat) DO UPDATE SET rate=?, updated_at=datetime('now')`,
      [monat, rate, rate]
    );
  }
  await logAudit({ user: req.user, action: 'upsert', entityType: 'chf_eur_rates', entityId: monat, newData: { rate } });
  const p = db.dialect === 'postgres' ? '$1' : '?';
  res.json(await db.get(`SELECT monat, rate FROM chf_eur_rates WHERE monat=${p}`, [monat]));
}));

module.exports = router;
