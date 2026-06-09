require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./index');

const dialect = (process.env.DATABASE_URL || process.env.DB_DIALECT === 'postgres') ? 'postgres' : 'sqlite';
const migrationsDir = path.join(__dirname, '../../migrations');

const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(f => dialect === 'postgres'
    ? f.endsWith('.pg.sql')
    : (f.endsWith('.sql') && !f.endsWith('.pg.sql')))
  .sort();

async function ensureTrackingTable() {
  const sql = dialect === 'postgres'
    ? `CREATE TABLE IF NOT EXISTS _migrations (
         filename TEXT PRIMARY KEY,
         ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
       )`
    : `CREATE TABLE IF NOT EXISTS _migrations (
         filename TEXT PRIMARY KEY,
         ran_at TEXT NOT NULL DEFAULT (datetime('now'))
       )`;
  if (dialect === 'postgres') await db.run(sql);
  else db.run(sql);
}

async function getRanMigrations() {
  const rows = await db.all('SELECT filename FROM _migrations');
  return new Set(rows.map(r => r.filename));
}

async function markRan(filename) {
  if (dialect === 'postgres') {
    await db.run('INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
  } else {
    db.run('INSERT OR IGNORE INTO _migrations (filename) VALUES (?)', [filename]);
  }
}

async function runMigrations() {
  console.log(`Running migrations for dialect: ${dialect}`);
  await ensureTrackingTable();
  const ran = await getRanMigrations();

  for (const file of migrationFiles) {
    if (ran.has(file)) {
      console.log(`  Skipping ${file} (already ran)`);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    const statements = sql
      .split(';')
      .map(s =>
        s.split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim()
      )
      .filter(s => s.length > 0);

    console.log(`  Running ${file} (${statements.length} statements)`);

    for (const stmt of statements) {
      if (dialect === 'postgres') await db.run(stmt);
      else db.run(stmt);
    }

    await markRan(file);
  }

  console.log('Migrations complete.');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
