const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

const pg = () => db.dialect === 'postgres';
const validRoles    = ['admin', 'vertriebsleitung', 'backoffice', 'bk_vertrieb', 'nk_vertrieb'];
// Bekannte, steuerbare Features (Sync mit CONTROLLED_FEATURES im Frontend). Einzel-
// Freischaltungen sind nur für diese Keys erlaubt.
const KNOWN_FEATURES = ['kpi_beta', 'bestenliste', 'provisionen', 'backup'];

// feature -> [role] Map aus feature_flags aufbauen.
async function loadRoleFlags() {
  const rows = await db.all('SELECT feature, role FROM feature_flags ORDER BY feature, role', []);
  const flags = {};
  for (const r of rows) (flags[r.feature] = flags[r.feature] || []).push(r.role);
  return flags;
}

// feature -> [{user_id, name, role, active}] Map aus feature_flag_users (mit User-Details).
async function loadUserFlags() {
  const rows = await db.all(
    `SELECT ffu.feature, ffu.user_id, u.name, u.role, u.active
       FROM feature_flag_users ffu JOIN users u ON u.id = ffu.user_id
      ORDER BY ffu.feature, u.name`, []);
  const map = {};
  for (const r of rows) (map[r.feature] = map[r.feature] || []).push({
    user_id: r.user_id, name: r.name, role: r.role, active: r.active === true || r.active === 1,
  });
  return map;
}

// GET /api/feature-flags — jeder angemeldete User. Liefert die Rollen-Map (fürs Routing) plus
// die Features, für die GENAU DIESER User einzeln freigeschaltet ist (userFeatures).
router.get('/', wrap(async (req, res) => {
  const flags = await loadRoleFlags();
  const rows = await db.all(
    `SELECT feature FROM feature_flag_users WHERE user_id = ${pg() ? '$1' : '?'}`, [req.user.id]);
  res.json({ flags, userFeatures: rows.map(r => r.feature) });
}));

// GET /api/feature-flags/users — superadmin: volle Einzel-Freischaltungs-Übersicht (für die UI-Chips + Audit).
router.get('/users', requireRole('superadmin'), wrap(async (req, res) => {
  res.json(await loadUserFlags());
}));

// POST /api/feature-flags — superadmin: Rollen je Feature setzen (unverändert).
router.post('/', requireRole('superadmin'), wrap(async (req, res) => {
  const { feature, roles } = req.body;
  if (!feature || !Array.isArray(roles)) {
    return res.status(400).json({ error: 'feature und roles erforderlich' });
  }
  const safeRoles = roles.filter(r => validRoles.includes(r));
  await db.run(`DELETE FROM feature_flags WHERE feature=${pg() ? '$1' : '?'}`, [feature]);
  for (const role of safeRoles) {
    await db.run(`INSERT INTO feature_flags (feature, role) VALUES (${pg() ? '$1,$2' : '?,?'})`, [feature, role]);
  }
  res.json(await loadRoleFlags());
}));

// POST /api/feature-flags/users — superadmin: einzelnen Nutzer freischalten (idempotent).
router.post('/users', requireRole('superadmin'), wrap(async (req, res) => {
  const { feature, user_id } = req.body;
  if (!feature || !user_id) return res.status(400).json({ error: 'feature und user_id erforderlich' });
  if (!KNOWN_FEATURES.includes(feature)) return res.status(400).json({ error: 'Unbekanntes Feature' });
  const u = await db.get(`SELECT id FROM users WHERE id=${pg() ? '$1' : '?'}`, [user_id]);
  if (!u) return res.status(404).json({ error: 'Nutzer nicht gefunden' });

  if (pg()) {
    await db.run(
      `INSERT INTO feature_flag_users (feature, user_id, created_by) VALUES ($1,$2,$3)
         ON CONFLICT (feature, user_id) DO NOTHING`,
      [feature, user_id, req.user.id]);
  } else {
    db.run(
      `INSERT OR IGNORE INTO feature_flag_users (feature, user_id, created_by) VALUES (?,?,?)`,
      [feature, user_id, req.user.id]);
  }
  res.json(await loadUserFlags());
}));

// DELETE /api/feature-flags/users — superadmin: Einzel-Freischaltung entfernen.
router.delete('/users', requireRole('superadmin'), wrap(async (req, res) => {
  const { feature, user_id } = req.body || {};
  if (!feature || !user_id) return res.status(400).json({ error: 'feature und user_id erforderlich' });
  await db.run(
    `DELETE FROM feature_flag_users WHERE feature=${pg() ? '$1' : '?'} AND user_id=${pg() ? '$2' : '?'}`,
    [feature, user_id]);
  res.json(await loadUserFlags());
}));

module.exports = router;
