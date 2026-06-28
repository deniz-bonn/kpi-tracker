require('dotenv').config();
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || './data/kpi.db';
const seedPath = path.join(__dirname, '../../../backend/data/seed.sql');

if (!fs.existsSync(seedPath)) {
  console.log('seed.sql nicht gefunden, überspringe.');
  process.exit(0);
}

const sql = fs.readFileSync(seedPath, 'utf8');
console.log('Führe seed.sql aus...');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys=OFF;');
db.exec(sql);
db.exec('PRAGMA foreign_keys=ON;');
db.close();
console.log('Seed abgeschlossen.');
process.exit(0);
