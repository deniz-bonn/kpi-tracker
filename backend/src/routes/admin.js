const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { sendInvite, sendPasswordReset } = require('../utils/email');
const { logAudit } = require('../utils/audit');
const { requireVerwaltung, benutzerSperre, kontenMitEinzelfreigaben } = require('../utils/verwaltung');

// Alle Admin-Routen brauchen eine Anmeldung. Die Benutzerverwaltung (/users…) haengt seit dem
// 30.10.2026 am Recht 'benutzer_verwaltung' (Rollen-Haken oder Chip, Superadmin implizit) statt
// pauschal an der Admin-Rolle — mit den Leitplanken aus utils/verwaltung.js. Loeschen, Passwort
// direkt setzen und die Protokolle bleiben zusaetzlich Admin.
router.use(requireAuth);
const benutzer = requireVerwaltung('benutzer');
const nurAdmin = requireRole('admin');

const ph = (n) => (db.dialect === 'postgres' ? `$${n}` : '?');
// Secrets nie in Antworten oder ins Audit-Log.
const ohneSecrets = (u) => {
  if (!u) return u;
  const { password_hash, invite_token, invite_expires, reset_token, reset_expires, employee_standort, ...safe } = u;
  return safe;
};

/** Zielkonto samt Standort des verknuepften Mitarbeiters (fuer den Standort-Scope). */
const ladeZiel = (id) => db.get(
  `SELECT u.*, e.standort AS employee_standort
     FROM users u LEFT JOIN employees e ON e.id = u.employee_id WHERE u.id = ${ph(1)}`, [id]);

/** Leitplanken fuer ein Zielkonto pruefen; schickt bei Verstoss selbst die Antwort. */
async function zielGesperrt(req, res, ziel) {
  if (!ziel) { res.status(404).json({ error: 'Benutzer nicht gefunden' }); return true; }
  const grund = benutzerSperre(req.verwaltung, ziel, req.user.id, await kontenMitEinzelfreigaben());
  if (grund) { res.status(403).json({ error: grund }); return true; }
  return false;
}

/**
 * Darf der Delegierte ein Konto mit diesem Mitarbeiter verknuepfen? Nur am eigenen Standort (bei
 * Scope) und nur, wenn der Mitarbeiter noch kein ANDERES aktives Konto hat — sonst liesse sich ein
 * zweites Konto auf fremde Provisions- und Dashboard-Daten setzen. Liefert Sperrgrund oder null.
 */
async function verknuepfungSperre(z, employeeId, eigeneUserId = null) {
  if (z.ebene !== 'delegiert') return null;
  if (!employeeId) {
    return z.scope === 'standort' ? 'Konto muss mit einem Mitarbeiter am eigenen Standort verknüpft sein.' : null;
  }
  const e = await db.get(`SELECT id, standort FROM employees WHERE id = ${ph(1)}`, [employeeId]);
  if (!e) return 'Mitarbeiter nicht gefunden.';
  if (z.scope === 'standort' && e.standort !== z.standort) return `Nur Mitarbeiter am eigenen Standort (${z.standort}).`;
  const t = db.dialect === 'postgres' ? 'TRUE' : '1';
  const belegt = await db.get(
    `SELECT id FROM users WHERE employee_id = ${ph(1)} AND active = ${t} AND id <> ${ph(2)}`,
    [employeeId, eigeneUserId ?? 0]);
  return belegt ? 'Dieser Mitarbeiter hat bereits ein aktives Konto.' : null;
}

// ── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', benutzer, wrap(async (req, res) => {
  const sql = `
    SELECT u.id, u.email, u.name, u.role, u.employee_id, u.active,
           u.created_at, u.last_login, u.invite_token,
           e.name as employee_name, e.standort as employee_standort
    FROM users u
    LEFT JOIN employees e ON e.id = u.employee_id
    ORDER BY u.created_at ASC
  `;
  const rows = db.dialect === 'postgres' ? await db.all(sql) : db.all(sql);
  const z = req.verwaltung;
  const chips = await kontenMitEinzelfreigaben();
  // Mit Standort-Scope nur Konten am eigenen Standort. Das Einladungs-Token ist selbst ein Zugang
  // (wer es hat, setzt das Passwort) — nach aussen geht nur, OB eine Einladung offen ist.
  const sicht = z.scope === 'standort' ? rows.filter(u => u.employee_standort === z.standort) : rows;
  res.json(sicht.map(u => ({
    ...ohneSecrets(u),
    employee_standort: u.employee_standort ?? null,
    einladung_offen: !!u.invite_token,
    sperre: benutzerSperre(z, u, req.user.id, chips),
  })));
}));

// ── POST /api/admin/users  (create + send invite) ────────────────────────────
router.post('/users', benutzer, wrap(async (req, res) => {
  const { email, name, role, employee_id } = req.body;
  if (!email || !name || !role) {
    return res.status(400).json({ error: 'email, name und role sind Pflichtfelder' });
  }
  if (!req.verwaltung.rollen.includes(role)) {
    return res.status(403).json({ error: 'Diese Rolle darfst du nicht vergeben.' });
  }
  const vSperre = await verknuepfungSperre(req.verwaltung, employee_id);
  if (vSperre) return res.status(403).json({ error: vSperre });

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

  await logAudit({ user: req.user, action: 'create', entityType: 'user', entityId: Number(user.id), newData: ohneSecrets(user) });
  const emailResult = await sendInvite(email, name, token);
  res.status(201).json({
    ...user,
    invite_link: !emailResult.email_sent ? emailResult.link : undefined,
  });
}));

// ── PATCH /api/admin/users/:id ───────────────────────────────────────────────
router.patch('/users/:id', benutzer, wrap(async (req, res) => {
  const { name, role, employee_id, active } = req.body;
  const id = req.params.id;
  const ziel = await ladeZiel(id);
  if (!ziel) return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  const rolleNeu = role !== undefined && role !== ziel.role;
  // Kein Konto aendert seine eigene Rolle — auch der Superadmin nicht (Aussperr-Schutz).
  if (rolleNeu && String(ziel.id) === String(req.user.id)) {
    return res.status(403).json({ error: 'Die eigene Rolle lässt sich nicht ändern.' });
  }
  if (await zielGesperrt(req, res, ziel)) return;
  if (rolleNeu && !req.verwaltung.rollen.includes(role)) {
    return res.status(403).json({ error: 'Diese Rolle darfst du nicht vergeben.' });
  }
  if (employee_id !== undefined && String(employee_id || '') !== String(ziel.employee_id || '')) {
    const vSperre = await verknuepfungSperre(req.verwaltung, employee_id || null, ziel.id);
    if (vSperre) return res.status(403).json({ error: vSperre });
  }

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
    await logAudit({ user: req.user, action: 'update', entityType: 'user', entityId: Number(ziel.id), oldData: ohneSecrets(ziel), newData: row });
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
    const row = db.get(`SELECT id,email,name,role,employee_id,active FROM users WHERE id=?`, [id]);
    await logAudit({ user: req.user, action: 'update', entityType: 'user', entityId: Number(ziel.id), oldData: ohneSecrets(ziel), newData: row });
    res.json(row);
  }
}));

// ── POST /api/admin/users/:id/resend-invite ───────────────────────────────────
router.post('/users/:id/resend-invite', benutzer, wrap(async (req, res) => {
  const token   = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const user = await ladeZiel(req.params.id);
  if (await zielGesperrt(req, res, user)) return;

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

  await logAudit({ user: req.user, action: 'invite', entityType: 'user', entityId: Number(user.id) });
  const emailResult = await sendInvite(user.email, user.name, token);
  res.json({
    ok: true,
    invite_link: !emailResult.email_sent ? emailResult.link : undefined,
  });
}));

// ── POST /api/admin/users/:id/reset-password ─────────────────────────────────
router.post('/users/:id/reset-password', nurAdmin, benutzer, wrap(async (req, res) => {
  if (await zielGesperrt(req, res, await ladeZiel(req.params.id))) return;
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
  await logAudit({ user: req.user, action: 'reset_password', entityType: 'user', entityId: Number(req.params.id) });
  res.json({ ok: true });
}));

// ── POST /api/admin/users/:id/reset-link  (Passwort-Reset-Link erzeugen) ─────
router.post('/users/:id/reset-link', benutzer, wrap(async (req, res) => {
  const user = await ladeZiel(req.params.id);
  if (await zielGesperrt(req, res, user)) return;

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

  await logAudit({ user: req.user, action: 'reset_link', entityType: 'user', entityId: Number(user.id) });
  const result = await sendPasswordReset(user.email, user.name, token);
  // Der Link IST das Konto: Delegierte bekommen ihn nur, wenn keine Mail rausging.
  const linkZeigen = req.verwaltung.ebene !== 'delegiert' || !result.email_sent;
  res.json({ ok: true, email_sent: result.email_sent, reset_link: linkZeigen ? result.link : undefined });
}));

// ── DELETE /api/admin/users/:id  (Benutzer endgültig löschen) ─────────────────
// Löscht NUR den Login-Benutzer. Der verknüpfte Mitarbeiter (employees) bleibt
// unberührt — die Fremdschlüssel-Richtung ist users.employee_id -> employees.id,
// es gibt also keinen Weg, auf dem ein Mitarbeiter mitgelöscht würde.
// login_logs.user_id und audit_logs.user_id sind ON DELETE SET NULL: die Historie
// bleibt erhalten (audit_logs.user_name ist denormalisiert und bleibt lesbar).
router.delete('/users/:id', nurAdmin, benutzer, wrap(async (req, res) => {
  const p = db.dialect === 'postgres' ? '$1' : '?';
  const user = await db.get(`SELECT * FROM users WHERE id=${p}`, [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  if (String(user.id) !== String(req.user.id) && await zielGesperrt(req, res, user)) return;

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
router.get('/login-logs', nurAdmin, wrap(async (req, res) => {
  const sql = db.dialect === 'postgres'
    ? `SELECT ll.*, u.name as user_name FROM login_logs ll
       LEFT JOIN users u ON u.id=ll.user_id
       ORDER BY ll.created_at DESC LIMIT 200`
    : `SELECT ll.*, u.name as user_name FROM login_logs ll
       LEFT JOIN users u ON u.id=ll.user_id
       ORDER BY ll.created_at DESC LIMIT 200`;
  res.json(db.dialect === 'postgres' ? await db.all(sql) : db.all(sql));
}));

// Alles Uebrige unter /api/admin (z.B. /test-daily-report in index.js) blieb bisher hinter dem
// router-weiten requireRole('admin') — dieser Schlussriegel haelt das so, seit die Benutzerrouten
// eigene Pruefungen haben. Admins fallen durch zum naechsten Handler.
router.use(nurAdmin);

module.exports = router;
