require('dotenv').config();

// Use postgres if DATABASE_URL (Railway standard) or DB_DIALECT=postgres is set
const usePostgres = !!(process.env.DATABASE_URL || process.env.DB_DIALECT === 'postgres');
const dialect = usePostgres ? 'postgres' : 'sqlite';

let db;

if (usePostgres) {
  const pg = require('pg');
  // DATE-Spalten (OID 1082) als 'YYYY-MM-DD'-String liefern, nicht als JS-Date.
  // node-pg baut aus einem DATE sonst new Date(y, m-1, d) in der LOKALEN Zeit des Prozesses;
  // res.json macht daraus einen ISO-Zeitstempel. Bei TZ=UTC lautet der '…T00:00:00.000Z' und
  // slice(0,10) trifft den Tag — bei Europe/Berlin stuende '…T22:00:00.000Z' des VORTAGES, und
  // jeder Tagesvergleich im Frontend waere um eins verschoben (die DATE-Falle aus Migration 102).
  // Ein String ist dialektgleich mit SQLite (dort TEXT 'YYYY-MM-DD'), zeitzonenfrei und exakt
  // das, was input[type=date] und jeder '<=' -Vergleich brauchen. TIMESTAMPTZ bleibt unberuehrt.
  // Gilt prozessweit fuer jeden Pool dieses pg-Moduls — migrate.js laedt dieselbe Datei.
  pg.types.setTypeParser(1082, v => v);
  const { Pool } = pg;
  // DATABASE_URL (Railway) takes priority over individual PGHOST/PGPORT/... vars
  const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host:     process.env.PGHOST,
        port:     process.env.PGPORT,
        database: process.env.PGDATABASE,
        user:     process.env.PGUSER,
        password: process.env.PGPASSWORD,
      };
  const pool = new Pool(poolConfig);

  db = {
    dialect: 'postgres',
    // Returns rows array, compatible with sqlite interface
    run: (sql, params = []) => pool.query(sql, params),
    all: async (sql, params = []) => {
      const result = await pool.query(sql, params);
      return result.rows;
    },
    get: async (sql, params = []) => {
      const result = await pool.query(sql, params);
      return result.rows[0] || null;
    },
    pool,
  };
} else {
  // Node 24 built-in SQLite — no native compilation needed
  const { DatabaseSync } = require('node:sqlite');
  const path = require('path');
  const fs = require('fs');

  const dbPath = process.env.DB_PATH || './data/kpi.db';
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const sqlite = new DatabaseSync(dbPath);
  sqlite.exec('PRAGMA foreign_keys = ON');
  sqlite.exec('PRAGMA journal_mode = WAL');

  db = {
    dialect: 'sqlite',
    run: (sql, params = []) => {
      const stmt = sqlite.prepare(sql);
      return stmt.run(...params);
    },
    all: (sql, params = []) => {
      const stmt = sqlite.prepare(sql);
      return stmt.all(...params);
    },
    get: (sql, params = []) => {
      const stmt = sqlite.prepare(sql);
      return stmt.get(...params);
    },
    sqlite,
  };
}

module.exports = db;
