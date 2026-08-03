const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendInvite, sendPasswordReset } = require('../utils/email');
const { logAudit } = require('../utils/audit');

// All admin routes require auth + admin role
router.use(requireAuth);
router.use(requireRole('admin'));

const userFields = 'id,email,name,role,employee_id,active,created_at,last_login';

// ── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', wrap(async (req, res) => {
  const sql = `
    SELECT u.id, u.email, u.name, u.role, u.employee_id, u.active,
           u.created_at, u.last_login, u.invite_token,
           e.name as employee_name
    FROM users u
    LEFT JOIN employees e ON e.id = u.employee_id
    ORDER BY u.created_at ASC
  `;
  const rows = db.dialect === 'postgres' ? await db.all(sql) : db.all(sql);
  res.json(rows);
}));

// ── POST /api/admin/users  (create + send invite) ────────────────────────────
router.post('/users', wrap(async (req, res) => {
  const { email, name, role, employee_id } = req.body;
  if (!email || !name || !role) {
    return res.status(400).json({ error: 'email, name und role sind Pflichtfelder' });
  }

  const token   = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  let user;
  if (db.dialect === 'postgres') {
    user = await db.get(
      `INSERT INTO users (email, name, role, employee_id, active, invite_token, invite_expires)
       VALUES ($1,$2,$3,$4,false,$5,$6)
       RETURNING id,email,name,role,employee_id,active`,
      [email, name, role, employee_id || null, token, expires.toISOString()]
    );
  } else {
    const result = db.run(
      `INSERT INTO users (email, name, role, employee_id, active, invite_token, invite_expires)
       VALUES (?,?,?,?,0,?,?)`,
      [email, name, role, employee_id || null, token, expires.toISOString()]
    );
    user = { id: result.lastInsertRowid, email, name, role, employee_id: employee_id || null, active: 0 };
  }

  const emailResult = await sendInvite(email, name, token);
  res.status(201).json({
    ...user,
    invite_link: !emailResult.email_sent ? emailResult.link : undefined,
  });
}));

// ── PATCH /api/admin/users/:id ───────────────────────────────────────────────
router.patch('/users/:id', wrap(async (req, res) => {
  const { name, role, employee_id, active } = req.body;
  const id = req.params.id;

  if (db.dialect === 'postgres') {
    const updates = [];
    const vals = [];
    let i = 1;
    if (name        !== undefined) { updates.push(`name=$${i++}`);        vals.push(name); }
    if (role        !== undefined) { updates.push(`role=$${i++}`);        vals.push(role); }
    if (employee_id !== undefined) { updates.push(`employee_id=$${i++}`); vals.push(employee_id || null); }
    if (active      !== undefined) { updates.push(`active=$${i++}`);      vals.push(active); }
    if (!updates.length) return res.status(400).json({ error: 'Keine Felder angegeben' });
    vals.push(id);
    const row = await db.get(
      `UPDATE users SET ${updates.join(',')} WHERE id=$${i} RETURNING id,email,name,role,employee_id,active`,
      vals
    );
    res.json(row);
  } else {
    const updates = [];
    const vals = [];
    if (name        !== undefined) { updates.push('name=?');        vals.push(name); }
    if (role        !== undefined) { updates.push('role=?');        vals.push(role); }
    if (employee_id !== undefined) { updates.push('employee_id=?'); vals.push(employee_id || null); }
    if (active      !== undefined) { updates.push('active=?');      vals.push(active ? 1 : 0); }
    if (!updates.length) return res.status(400).json({ error: 'Keine Felder angegeben' });
    vals.push(id);
    db.run(`UPDATE users SET ${updates.join(',')} WHERE id=?`, vals);
    res.json(db.get(`SELECT id,email,name,role,employee_id,active FROM users WHERE id=?`, [id]));
  }
}));

// ── POST /api/admin/users/:id/resend-invite ───────────────────────────────────
router.post('/users/:id/resend-invite', wrap(async (req, res) => {
  const token   = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const user = db.dialect === 'postgres'
    ? await db.get(`SELECT * FROM users WHERE id=$1`, [req.params.id])
    : db.get(`SELECT * FROM users WHERE id=?`, [req.params.id]);

  if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

  if (db.dialect === 'postgres') {
    await db.run(
      `UPDATE users SET invite_token=$1, invite_expires=$2 WHERE id=$3`,
      [token, expires.toISOString(), user.id]
    );
  } else {
    db.run(
      `UPDATE users SET invite_token=?, invite_expires=? WHERE id=?`,
      [token, expires.toISOString(), user.id]
    );
  }

  const emailResult = await sendInvite(user.email, user.name, token);
  res.json({
    ok: true,
    invite_link: !emailResult.email_sent ? emailResult.link : undefined,
  });
}));

// ── POST /api/admin/users/:id/reset-password ─────────────────────────────────
router.post('/users/:id/reset-password', wrap(async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 8) {
    return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen haben' });
  }

  const hash = await bcrypt.hash(new_password, 10);
  if (db.dialect === 'postgres') {
    await db.run(`UPDATE users SET password_hash=$1 WHERE id=$2`, [hash, req.params.id]);
  } else {
    db.run(`UPDATE users SET password_hash=? WHERE id=?`, [hash, req.params.id]);
  }
  res.json({ ok: true });
}));

// ── POST /api/admin/users/:id/reset-link  (Passwort-Reset-Link erzeugen) ─────
router.post('/users/:id/reset-link', wrap(async (req, res) => {
  const user = db.dialect === 'postgres'
    ? await db.get(`SELECT * FROM users WHERE id=$1`, [req.params.id])
    : db.get(`SELECT * FROM users WHERE id=?`, [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

  const token   = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden

  if (db.dialect === 'postgres') {
    await db.run(
      `UPDATE users SET reset_token=$1, reset_expires=$2 WHERE id=$3`,
      [token, expires.toISOString(), user.id]
    );
  } else {
    db.run(
      `UPDATE users SET reset_token=?, reset_expires=? WHERE id=?`,
      [token, expires.toISOString(), user.id]
    );
  }

  const result = await sendPasswordReset(user.email, user.name, token);
  res.json({ ok: true, email_sent: result.email_sent, reset_link: result.link });
}));

// ── DELETE /api/admin/users/:id  (Benutzer endgültig löschen) ─────────────────
// Löscht NUR den Login-Benutzer. Der verknüpfte Mitarbeiter (employees) bleibt
// unberührt — die Fremdschlüssel-Richtung ist users.employee_id -> employees.id,
// es gibt also keinen Weg, auf dem ein Mitarbeiter mitgelöscht würde.
// login_logs.user_id und audit_logs.user_id sind ON DELETE SET NULL: die Historie
// bleibt erhalten (audit_logs.user_name ist denormalisiert und bleibt lesbar).
router.delete('/users/:id', wrap(async (req, res) => {
  const p = db.dialect === 'postgres' ? '$1' : '?';
  const user = await db.get(`SELECT * FROM users WHERE id=${p}`, [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });

  // 1) Kein Selbstlöschen — sonst sperrt sich der Admin mitten in der Aktion aus.
  if (String(user.id) === String(req.user.id)) {
    return res.status(400).json({ error: 'Der eigene Benutzer kann nicht gelöscht werden.' });
  }

  // 2) Superadmins darf nur ein Superadmin löschen.
  if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Nur ein Superadmin darf einen Superadmin löschen.' });
  }

  // 3) Aussperr-Schutz: es muss mindestens ein aktiver Admin/Superadmin übrig bleiben.
  //    Auswertung in JS, damit BOOLEAN (Postgres) und INTEGER (SQLite) gleich behandelt werden.
  const admins = await db.all(`SELECT id, role, active FROM users WHERE role IN ('admin','superadmin')`);
  const restAktiv = admins.filter(a => !!a.active && String(a.id) !== String(user.id)).length;
  if (!!user.active && restAktiv === 0) {
    return res.status(400).json({
      error: 'Das ist der letzte aktive Admin-Zugang. Vorher einen weiteren Admin anlegen.',
    });
  }

  await db.run(`DELETE FROM users WHERE id=${p}`, [user.id]);

  const { password_hash, invite_token, reset_token, ...safe } = user; // Secrets nicht ins Audit-Log
  await logAudit({
    user: req.user, action: 'delete', entityType: 'user', entityId: Number(user.id), oldData: safe,
  });

  res.json({
    ok: true,
    deleted_user: { id: user.id, name: user.name, email: user.email },
    // Zur Bestätigung nach aussen: der Mitarbeiter bleibt bestehen.
    employee_id_unveraendert: user.employee_id ?? null,
  });
}));

// ── GET /api/admin/online-users ──────────────────────────────────────────────
// Users with last_seen within the last 3 minutes (superadmin only)
router.get('/online-users', requireRole('superadmin'), wrap(async (req, res) => {
  let rows;
  if (db.dialect === 'postgres') {
    rows = await db.all(
      `SELECT id, name, email, role, last_seen FROM users
       WHERE last_seen > NOW() - INTERVAL '3 minutes'
       ORDER BY last_seen DESC`
    );
  } else {
    rows = db.all(
      `SELECT id, name, email, role, last_seen FROM users
       WHERE last_seen > datetime('now', '-3 minutes')
       ORDER BY last_seen DESC`
    );
  }
  res.json(rows);
}));

// ── GET /api/admin/login-logs ─────────────────────────────────────────────────
router.get('/login-logs', wrap(async (req, res) => {
  const sql = db.dialect === 'postgres'
    ? `SELECT ll.*, u.name as user_name FROM login_logs ll
       LEFT JOIN users u ON u.id=ll.user_id
       ORDER BY ll.created_at DESC LIMIT 200`
    : `SELECT ll.*, u.name as user_name FROM login_logs ll
       LEFT JOIN users u ON u.id=ll.user_id
       ORDER BY ll.created_at DESC LIMIT 200`;
  res.json(db.dialect === 'postgres' ? await db.all(sql) : db.all(sql));
}));

module.exports = router;
