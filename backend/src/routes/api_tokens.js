// ── Verwaltung der API-Tokens (Einstellungen → API-Tokens, nur Superadmin) ────────────────────
// Anlegen gibt das Token GENAU EINMAL zurueck; gespeichert wird nur der Hash. Widerrufen statt
// Loeschen: das Audit-Log und api_token_id an den Deals behalten ihren Bezug.
const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { neuesToken } = require('../middleware/apiToken');
const { logAudit } = require('../utils/audit');

const SCOPES    = ['vl:read', 'vl:write'];
const STANDORTE = ['Bonn', 'Braunschweig', 'Österreich', 'Schweiz'];
const pg = () => db.dialect === 'postgres';
const P  = (i) => (pg() ? `$${i}` : '?');

router.use(requireAuth, requireRole());   // requireRole() ohne Rollen = nur Superadmin

// Der Hash verlaesst den Server nie — auch nicht in Liste oder Audit-Log.
function ohneHash(row) {
  const r = { ...row };
  delete r.token_hash;
  return r;
}

router.get('/', wrap(async (_req, res) => {
  const rows = await db.all(
    `SELECT t.*, u.name AS erstellt_von_name FROM api_tokens t LEFT JOIN users u ON u.id = t.erstellt_von ORDER BY t.id DESC`);
  res.json({ tokens: rows.map(ohneHash), scopes: SCOPES, standorte: STANDORTE });
}));

router.post('/', wrap(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const scopes = (Array.isArray(req.body?.scopes) ? req.body.scopes : []).filter(s => SCOPES.includes(s));
  const standorte = (Array.isArray(req.body?.standorte) ? req.body.standorte : []).filter(s => STANDORTE.includes(s));
  if (!name) return res.status(400).json({ error: 'Name fehlt' });
  if (!scopes.length) return res.status(400).json({ error: 'Mindestens ein Scope nötig' });
  const { token, praefix, hash } = neuesToken();
  const werte = [name, praefix, hash, scopes.join(','), standorte.length ? standorte.join(',') : null, req.user.id || null];
  let row;
  if (pg()) {
    row = await db.get(`INSERT INTO api_tokens (name, praefix, token_hash, scopes, standorte, erstellt_von)
                        VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, werte);
  } else {
    const r = db.run(`INSERT INTO api_tokens (name, praefix, token_hash, scopes, standorte, erstellt_von) VALUES (?,?,?,?,?,?)`, werte);
    row = await db.get(`SELECT * FROM api_tokens WHERE id=?`, [r.lastInsertRowid]);
  }
  await logAudit({ user: req.user, action: 'create', entityType: 'api_token', entityId: row.id, newData: ohneHash(row) });
  res.status(201).json({ ...ohneHash(row), token });   // token nur in DIESER Antwort
}));

router.post('/:id/widerrufen', wrap(async (req, res) => {
  const now = pg() ? 'NOW()' : "datetime('now')", falsch = pg() ? 'FALSE' : '0';
  const alt = await db.get(`SELECT * FROM api_tokens WHERE id=${P(1)}`, [req.params.id]);
  if (!alt) return res.status(404).json({ error: 'Token nicht gefunden' });
  await db.run(`UPDATE api_tokens SET aktiv=${falsch}, widerrufen_am=COALESCE(widerrufen_am, ${now}) WHERE id=${P(1)}`, [req.params.id]);
  const neu = await db.get(`SELECT * FROM api_tokens WHERE id=${P(1)}`, [req.params.id]);
  await logAudit({ user: req.user, action: 'update', entityType: 'api_token', entityId: neu.id, oldData: ohneHash(alt), newData: ohneHash(neu) });
  res.json(ohneHash(neu));
}));

module.exports = router;
