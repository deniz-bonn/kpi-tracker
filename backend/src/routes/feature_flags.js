const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

// GET /api/feature-flags — any authenticated user can read (used for frontend routing)
router.get('/', wrap(async (req, res) => {
  let rows;
  if (db.dialect === 'postgres') {
    rows = await db.all('SELECT feature, role FROM feature_flags ORDER BY feature, role', []);
  } else {
    rows = db.all('SELECT feature, role FROM feature_flags ORDER BY feature, role', []);
  }
  const flags = {};
  for (const r of rows) {
    if (!flags[r.feature]) flags[r.feature] = [];
    flags[r.feature].push(r.role);
  }
  res.json(flags);
}));

// POST /api/feature-flags — superadmin only
// Body: { feature: 'kpi_beta', roles: ['admin', 'backoffice'] }
router.post('/', requireRole('superadmin'), wrap(async (req, res) => {
  const { feature, roles } = req.body;
  if (!feature || !Array.isArray(roles)) {
    return res.status(400).json({ error: 'feature und roles erforderlich' });
  }

  const validRoles = ['admin', 'backoffice', 'bk_vertrieb', 'nk_vertrieb'];
  const safeRoles  = roles.filter(r => validRoles.includes(r));

  if (db.dialect === 'postgres') {
    await db.run('DELETE FROM feature_flags WHERE feature=$1', [feature]);
    for (const role of safeRoles) {
      await db.run('INSERT INTO feature_flags (feature, role) VALUES ($1,$2)', [feature, role]);
    }
  } else {
    db.run('DELETE FROM feature_flags WHERE feature=?', [feature]);
    for (const role of safeRoles) {
      db.run('INSERT INTO feature_flags (feature, role) VALUES (?,?)', [feature, role]);
    }
  }

  let rows;
  if (db.dialect === 'postgres') {
    rows = await db.all('SELECT feature, role FROM feature_flags ORDER BY feature, role', []);
  } else {
    rows = db.all('SELECT feature, role FROM feature_flags ORDER BY feature, role', []);
  }
  const flags = {};
  for (const r of rows) {
    if (!flags[r.feature]) flags[r.feature] = [];
    flags[r.feature].push(r.role);
  }
  res.json(flags);
}));

module.exports = router;
