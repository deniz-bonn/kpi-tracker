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
  if (dialect === 'sqlite') {
    const rows = db.sqlite.prepare('SELECT filename FROM _migrations').all();
    return new Set(Array.from(rows).map(r => r.filename));
  }
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

function splitSql(sql) {
  const results = [];
  let current = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (inString) {
      current += ch;
      if (ch === stringChar) {
        if (sql[i + 1] === stringChar) {
          current += sql[++i];
        } else {
          inString = false;
        }
      }
    } else if (ch === "'" || ch === '"') {
      inString = true;
      stringChar = ch;
      current += ch;
    } else if (ch === ';') {
      const stmt = current
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();
      if (stmt) results.push(stmt);
      current = '';
    } else {
      current += ch;
    }
  }

  const last = current
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .trim();
  if (last) results.push(last);

  return results;
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

    if (dialect === 'sqlite') {
      // sqlite.exec() runs the entire SQL file atomically — more reliable than prepare().run()
      const stmtCount = splitSql(sql).length;
      console.log(`  Running ${file} (${stmtCount} statements)`);
      try {
        db.sqlite.exec(sql);
      } catch (err) {
        console.error(`\nMigration FAILED: ${file}`);
        console.error('\nError:', err.message);
        throw err;
      }
    } else {
      const statements = splitSql(sql);
      console.log(`  Running ${file} (${statements.length} statements)`);
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          await db.run(stmt);
        } catch (err) {
          console.error(`\nMigration FAILED: ${file}`);
          console.error(`Statement ${i + 1}/${statements.length}:`);
          console.error(stmt.slice(0, 500));
          console.error('\nError:', err.message);
          throw err;
        }
      }
    }

    await markRan(file);
  }

  console.log('Migrations complete.');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('\nFatal migration error:', err.message);
  process.exit(1);
});
