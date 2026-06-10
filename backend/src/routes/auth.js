const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const db       = require('../db');
const wrap     = require('../middleware/asyncHandler');
const { requireAuth, SECRET } = require('../middleware/auth');
const { sendInvite, sendPasswordReset } = require('../utils/email');

const p = (i) => db.dialect === 'postgres' ? `$${i}` : '?';

// ── POST /api/auth/setup  (first-run admin bootstrap) ───────────────────────
router.post('/setup', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get("SELECT id FROM users WHERE role='admin' LIMIT 1")
    : db.get("SELECT id FROM users WHERE role='admin' LIMIT 1");

  if (existing) {
    return res.status(409).json({ error: 'Admin-Benutzer existiert bereits' });
  }

  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'email, name und password sind Pflichtfelder' });
  }

  const hash = await bcrypt.hash(password, 10);
  if (db.dialect === 'postgres') {
    const user = await db.get(
      `INSERT INTO users (email, name, role, password_hash, active) VALUES ($1,$2,'admin',$3,true) RETURNING id,email,name,role`,
      [email, name, hash]
    );
    res.status(201).json(user);
  } else {
    const result = db.run(
      `INSERT INTO users (email, name, role, password_hash, active) VALUES (?,?,'admin',?,1)`,
      [email, name, hash]
    );
    res.status(201).json({ id: result.lastInsertRowid, email, name, role: 'admin' });
  }
}));

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || '';

  const logAttempt = async (userId, success) => {
    try {
      if (db.dialect === 'postgres') {
        await db.run(
          `INSERT INTO login_logs (user_id, email, ip, success) VALUES ($1,$2,$3,$4)`,
          [userId || null, email, ip, success]
        );
      } else {
        db.run(
          `INSERT INTO login_logs (user_id, email, ip, success) VALUES (?,?,?,?)`,
          [userId || null, email, ip, success ? 1 : 0]
        );
      }
    } catch {}
  };

  const user = db.dialect === 'postgres'
    ? await db.get(`SELECT * FROM users WHERE email=$1`, [email])
    : db.get(`SELECT * FROM users WHERE email=?`, [email]);

  if (!user || !user.password_hash) {
    await logAttempt(null, false);
    return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
  }

  if (!user.active && user.active !== 1) {
    return res.status(403).json({ error: 'Konto deaktiviert' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  await logAttempt(user.id, ok);

  if (!ok) return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });

  // update last_login
  if (db.dialect === 'postgres') {
    await db.run(`UPDATE users SET last_login=NOW() WHERE id=$1`, [user.id]);
  } else {
    db.run(`UPDATE users SET last_login=datetime('now') WHERE id=?`, [user.id]);
  }

  const payload = {
    id:          user.id,
    email:       user.email,
    name:        user.name,
    role:        user.role,
    employee_id: user.employee_id,
  };
  const token = jwt.sign(payload, SECRET, { expiresIn: '24h' });

  res.json({ token, user: payload });
}));

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, wrap(async (req, res) => {
  const user = db.dialect === 'postgres'
    ? await db.get(
        `SELECT u.id,u.email,u.name,u.role,u.employee_id,u.active,u.last_login,
                e.name as employee_name
         FROM users u LEFT JOIN employees e ON e.id=u.employee_id
         WHERE u.id=$1`, [req.user.id])
    : db.get(
        `SELECT u.id,u.email,u.name,u.role,u.employee_id,u.active,u.last_login,
                e.name as employee_name
         FROM users u LEFT JOIN employees e ON e.id=u.employee_id
         WHERE u.id=?`, [req.user.id]);

  if (!user) return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  res.json(user);
}));

// ── POST /api/auth/change-password ──────────────────────────────────────────
router.post('/change-password', requireAuth, wrap(async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'current_password und new_password erforderlich' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen haben' });
  }

  const user = db.dialect === 'postgres'
    ? await db.get(`SELECT * FROM users WHERE id=$1`, [req.user.id])
    : db.get(`SELECT * FROM users WHERE id=?`, [req.user.id]);

  const ok = await bcrypt.compare(current_password, user.password_hash || '');
  if (!ok) return res.status(401).json({ error: 'Aktuelles Passwort falsch' });

  const hash = await bcrypt.hash(new_password, 10);
  if (db.dialect === 'postgres') {
    await db.run(`UPDATE users SET password_hash=$1 WHERE id=$2`, [hash, req.user.id]);
  } else {
    db.run(`UPDATE users SET password_hash=? WHERE id=?`, [hash, req.user.id]);
  }
  res.json({ ok: true });
}));

// ── POST /api/auth/reset/request ─────────────────────────────────────────────
router.post('/reset/request', wrap(async (req, res) => {
  const { email } = req.body;
  const user = db.dialect === 'postgres'
    ? await db.get(`SELECT * FROM users WHERE email=$1 AND active=true`, [email])
    : db.get(`SELECT * FROM users WHERE email=? AND active=1`, [email]);

  // Always return 200 to avoid email enumeration
  if (!user) return res.json({ ok: true });

  const token   = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

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
  res.json({ ok: true, ...(process.env.NODE_ENV !== 'production' && { link: result.link }) });
}));

// ── POST /api/auth/reset/confirm ─────────────────────────────────────────────
router.post('/reset/confirm', wrap(async (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password) {
    return res.status(400).json({ error: 'token und new_password erforderlich' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen haben' });
  }

  const user = db.dialect === 'postgres'
    ? await db.get(`SELECT * FROM users WHERE reset_token=$1`, [token])
    : db.get(`SELECT * FROM users WHERE reset_token=?`, [token]);

  if (!user || !user.reset_expires) {
    return res.status(400).json({ error: 'Token ungültig' });
  }
  if (new Date(user.reset_expires) < new Date()) {
    return res.status(400).json({ error: 'Token abgelaufen' });
  }

  const hash = await bcrypt.hash(new_password, 10);
  if (db.dialect === 'postgres') {
    await db.run(
      `UPDATE users SET password_hash=$1, reset_token=NULL, reset_expires=NULL WHERE id=$2`,
      [hash, user.id]
    );
  } else {
    db.run(
      `UPDATE users SET password_hash=?, reset_token=NULL, reset_expires=NULL WHERE id=?`,
      [hash, user.id]
    );
  }
  res.json({ ok: true });
}));

// ── POST /api/auth/invite/accept ─────────────────────────────────────────────
// Used both for initial invite AND password-set via invite token
router.post('/invite/accept', wrap(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'token und password erforderlich' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen haben' });
  }

  const user = db.dialect === 'postgres'
    ? await db.get(`SELECT * FROM users WHERE invite_token=$1`, [token])
    : db.get(`SELECT * FROM users WHERE invite_token=?`, [token]);

  if (!user || !user.invite_expires) {
    return res.status(400).json({ error: 'Einladungstoken ungültig' });
  }
  if (new Date(user.invite_expires) < new Date()) {
    return res.status(400).json({ error: 'Einladungstoken abgelaufen' });
  }

  const hash = await bcrypt.hash(password, 10);
  if (db.dialect === 'postgres') {
    await db.run(
      `UPDATE users SET password_hash=$1, invite_token=NULL, invite_expires=NULL, active=true WHERE id=$2`,
      [hash, user.id]
    );
  } else {
    db.run(
      `UPDATE users SET password_hash=?, invite_token=NULL, invite_expires=NULL, active=1 WHERE id=?`,
      [hash, user.id]
    );
  }
  res.json({ ok: true });
}));

module.exports = router;
