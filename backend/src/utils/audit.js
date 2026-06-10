const db = require('../db');

async function logAudit({ user, action, entityType, entityId, oldData = null, newData = null }) {
  try {
    const d = db.dialect;
    if (d === 'postgres') {
      await db.run(
        `INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, old_data, new_data)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          user?.id  || null,
          user?.name || null,
          action,
          entityType,
          entityId  || null,
          oldData   ? JSON.stringify(oldData) : null,
          newData   ? JSON.stringify(newData) : null,
        ]
      );
    } else {
      db.run(
        `INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, old_data, new_data)
         VALUES (?,?,?,?,?,?,?)`,
        [
          user?.id  || null,
          user?.name || null,
          action,
          entityType,
          entityId  || null,
          oldData   ? JSON.stringify(oldData) : null,
          newData   ? JSON.stringify(newData) : null,
        ]
      );
    }
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
}

module.exports = { logAudit };
