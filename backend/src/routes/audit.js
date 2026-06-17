const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

// All audit routes require auth; undo requires admin or backoffice
router.use(requireAuth);

// ── GET /api/audit ──────────────────────────────────────────────────────────
router.get('/', requireRole('admin', 'backoffice', 'vertriebsleitung'), wrap(async (req, res) => {
  const { entity_type, limit = 100 } = req.query;
  let sql, params = [];

  if (db.dialect === 'postgres') {
    sql = `SELECT al.*, u.email as user_email
           FROM audit_logs al
           LEFT JOIN users u ON u.id = al.user_id
           ${entity_type ? 'WHERE al.entity_type=$1' : ''}
           ORDER BY al.created_at DESC
           LIMIT ${entity_type ? '$2' : '$1'}`;
    params = entity_type ? [entity_type, Number(limit)] : [Number(limit)];
    res.json(await db.all(sql, params));
  } else {
    sql = `SELECT al.*, u.email as user_email
           FROM audit_logs al
           LEFT JOIN users u ON u.id = al.user_id
           ${entity_type ? 'WHERE al.entity_type=?' : ''}
           ORDER BY al.created_at DESC
           LIMIT ?`;
    params = entity_type ? [entity_type, Number(limit)] : [Number(limit)];
    res.json(db.all(sql, params));
  }
}));

// ── POST /api/audit/:id/undo ──────────────────────────────────────────────
// Reverts a single audit log entry (must have old_data and action=update)
router.post('/:id/undo', requireRole('admin'), wrap(async (req, res) => {
  const logEntry = db.dialect === 'postgres'
    ? await db.get(`SELECT * FROM audit_logs WHERE id=$1`, [req.params.id])
    : db.get(`SELECT * FROM audit_logs WHERE id=?`, [req.params.id]);

  if (!logEntry) return res.status(404).json({ error: 'Log-Eintrag nicht gefunden' });
  if (logEntry.action !== 'update') {
    return res.status(400).json({ error: 'Nur Update-Aktionen können rückgängig gemacht werden' });
  }

  const oldData = typeof logEntry.old_data === 'string'
    ? JSON.parse(logEntry.old_data)
    : logEntry.old_data;

  if (!oldData) return res.status(400).json({ error: 'Keine alten Daten vorhanden' });

  // Determine table from entity_type
  const tableMap = { 'deal_nk': 'deals_nk', 'deal_bk': 'deals_bk', 'deal_vl': 'deals_vl' };
  const table = tableMap[logEntry.entity_type];
  if (!table) return res.status(400).json({ error: 'Unbekannter Entity-Typ' });

  // Get current data for new audit entry
  const currentData = db.dialect === 'postgres'
    ? await db.get(`SELECT * FROM ${table} WHERE id=$1`, [logEntry.entity_id])
    : db.get(`SELECT * FROM ${table} WHERE id=?`, [logEntry.entity_id]);

  // Build update from old_data (exclude system fields)
  const skip = ['id','created_at','updated_at','company_name','kam_name','kam_standort',
                 'closer_name','opener_name','setter_name'];
  const fields = Object.keys(oldData).filter(k => !skip.includes(k));

  if (db.dialect === 'postgres') {
    const set = fields.map((f,i) => `${f}=$${i+1}`).join(',');
    const vals = fields.map(f => oldData[f]);
    vals.push(logEntry.entity_id);
    await db.run(
      `UPDATE ${table} SET ${set}, updated_at=NOW() WHERE id=$${fields.length+1}`,
      vals
    );
  } else {
    const set = fields.map(f => `${f}=?`).join(',');
    const vals = [...fields.map(f => oldData[f]), logEntry.entity_id];
    db.run(`UPDATE ${table} SET ${set}, updated_at=datetime('now') WHERE id=?`, vals);
  }

  await logAudit({
    user:       req.user,
    action:     'undo',
    entityType: logEntry.entity_type,
    entityId:   logEntry.entity_id,
    oldData:    currentData,
    newData:    oldData,
  });

  res.json({ ok: true });
}));

module.exports = router;
