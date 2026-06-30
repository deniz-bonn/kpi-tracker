const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

// Tables in dependency order (export & restore)
const TABLES = [
  'companies',
  'employees',
  'users',
  'monthly_targets',
  'targets',
  'ae_gesamt_monthly',
  'inbound_daily',
  'feature_flags',
  'deals_nk',
  'deals_bk',
  'deals_vl',
  'upsale_deals',
  'activity_logs',
];

// Last auto-backup stored in memory (survives until container restart)
let lastAutoBackup = null;

async function generateBackup() {
  const tables = {};
  for (const table of TABLES) {
    try {
      tables[table] = await db.all(`SELECT * FROM ${table}`);
    } catch {
      tables[table] = [];
    }
  }
  return {
    version:      1,
    dialect:      db.dialect,
    generated_at: new Date().toISOString(),
    tables,
  };
}

// Expose generate function for cron job in index.js
function storeAutoBackup(data) {
  lastAutoBackup = data;
}

// GET /api/backup/export — manual download
router.get('/export', requireRole('admin', 'superadmin'), wrap(async (req, res) => {
  const backup   = await generateBackup();
  const filename = `kpi-backup-${backup.generated_at.slice(0, 10)}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(backup);
}));

// GET /api/backup/info — when was last auto-backup
router.get('/info', requireRole('admin', 'superadmin'), wrap(async (_req, res) => {
  res.json({ last_auto_backup: lastAutoBackup?.generated_at || null });
}));

// GET /api/backup/scheduled — download last auto-backup
router.get('/scheduled', requireRole('admin', 'superadmin'), wrap(async (_req, res) => {
  if (!lastAutoBackup) {
    return res.status(404).json({ error: 'Noch kein automatisches Backup vorhanden. Nächstes um 23:00 Uhr.' });
  }
  const filename = `kpi-backup-auto-${lastAutoBackup.generated_at.slice(0, 10)}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json(lastAutoBackup);
}));

// POST /api/backup/import — restore from backup (superadmin only)
router.post('/import', requireRole('superadmin'), wrap(async (req, res) => {
  const backup = req.body;
  if (!backup?.version || !backup?.tables) {
    return res.status(400).json({ error: 'Ungültiges Backup-Format (version/tables fehlt)' });
  }

  const tablesPresent = TABLES.filter(t => Array.isArray(backup.tables[t]));

  if (db.dialect === 'postgres') {
    await db.run('BEGIN');
    try {
      await db.run("SET session_replication_role = 'replica'");
      // Delete in reverse order
      for (const table of [...TABLES].reverse()) {
        if (!Array.isArray(backup.tables[table])) continue;
        await db.run(`DELETE FROM ${table}`);
      }
      // Insert in forward order
      for (const table of TABLES) {
        const rows = backup.tables[table];
        if (!rows?.length) continue;
        const cols = Object.keys(rows[0]);
        for (const row of rows) {
          const ph = cols.map((_, i) => `$${i + 1}`).join(',');
          await db.run(
            `INSERT INTO ${table} (${cols.join(',')}) VALUES (${ph}) ON CONFLICT DO NOTHING`,
            cols.map(c => row[c])
          );
        }
        // Reset sequence so next INSERT gets correct id
        try {
          await db.run(
            `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1))`
          );
        } catch { /* table has no serial id */ }
      }
      await db.run("SET session_replication_role = 'DEFAULT'");
      await db.run('COMMIT');
    } catch (err) {
      try { await db.run("SET session_replication_role = 'DEFAULT'"); } catch {}
      try { await db.run('ROLLBACK'); } catch {}
      throw err;
    }
  } else {
    // SQLite
    await db.run('PRAGMA foreign_keys = OFF');
    try {
      for (const table of [...TABLES].reverse()) {
        if (!Array.isArray(backup.tables[table])) continue;
        await db.run(`DELETE FROM ${table}`);
      }
      for (const table of TABLES) {
        const rows = backup.tables[table];
        if (!rows?.length) continue;
        const cols = Object.keys(rows[0]);
        for (const row of rows) {
          const ph = cols.map(() => '?').join(',');
          await db.run(
            `INSERT OR IGNORE INTO ${table} (${cols.join(',')}) VALUES (${ph})`,
            cols.map(c => row[c])
          );
        }
      }
    } finally {
      await db.run('PRAGMA foreign_keys = ON');
    }
  }

  res.json({ ok: true, restored: tablesPresent.length, tables: tablesPresent });
}));

module.exports = { router, generateBackup, storeAutoBackup };
