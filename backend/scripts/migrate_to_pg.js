/**
 * migrate_to_pg.js
 * Überträgt alle Daten aus der lokalen SQLite-Datenbank in die Railway PostgreSQL.
 * Verwendet Batch-Inserts für maximale Geschwindigkeit.
 *
 * Verwendung:
 *   DATABASE_URL="postgresql://..." node backend/scripts/migrate_to_pg.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { DatabaseSync } = require('node:sqlite');
const { Pool } = require('pg');
const path = require('path');

const SQLITE_PATH = process.env.SQLITE_PATH
  || path.join(__dirname, '../data/kpi.db');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Fehler: DATABASE_URL ist nicht gesetzt.');
  process.exit(1);
}

const sqlite = new DatabaseSync(SQLITE_PATH);
const pg = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

function readAll(table) {
  return sqlite.prepare(`SELECT * FROM ${table}`).all();
}
function v(val) { return val === undefined ? null : val; }

// Baut einen Multi-Row INSERT: INSERT INTO t (cols) VALUES ($1,$2,...),($3,$4,...) ...
function buildBatchInsert(table, cols, rows, transform) {
  if (rows.length === 0) return null;
  const n = cols.length;
  const valueClauses = [];
  const params = [];
  rows.forEach((row, i) => {
    const vals = transform(row);
    const placeholders = vals.map((_, j) => `$${i * n + j + 1}`).join(',');
    valueClauses.push(`(${placeholders})`);
    params.push(...vals);
  });
  return {
    sql: `INSERT INTO ${table} (${cols.join(',')}) VALUES ${valueClauses.join(',')} ON CONFLICT DO NOTHING`,
    params,
  };
}

async function migrate() {
  console.log(`\nLese SQLite: ${SQLITE_PATH}`);
  console.log('Verbinde mit PostgreSQL...\n');

  const client = await pg.connect();

  try {
    await client.query('BEGIN');

    // Alle Tabellen leeren
    await client.query(`
      TRUNCATE TABLE deals_nk, deals_bk, deals_vl, targets,
                     ae_gesamt_monthly, monthly_targets,
                     employees, companies
      RESTART IDENTITY CASCADE
    `);

    // ── 1. companies ──────────────────────────────────────────────────────
    const companies = readAll('companies');
    console.log(`companies: ${companies.length} Einträge`);
    const cQ = buildBatchInsert('companies',
      ['id','name','standort','aktiv'],
      companies,
      r => [r.id, r.name, v(r.standort), r.aktiv ? true : false]
    );
    if (cQ) await client.query(cQ.sql, cQ.params);
    await client.query(`SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies))`);

    // ── 2. employees ──────────────────────────────────────────────────────
    const employees = readAll('employees');
    console.log(`employees: ${employees.length} Einträge`);
    const eQ = buildBatchInsert('employees',
      ['id','name','company_id','rolle','aktiv','standort'],
      employees,
      r => [r.id, r.name, r.company_id, r.rolle, r.aktiv ? true : false, v(r.standort)]
    );
    if (eQ) await client.query(eQ.sql, eQ.params);
    await client.query(`SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees))`);

    // ── 3. deals_nk — in Chunks à 100 ────────────────────────────────────
    const nk = readAll('deals_nk');
    console.log(`deals_nk: ${nk.length} Einträge`);
    const nkCols = ['id','datum','monat','company_id','closer_id','opener_id','setter_id',
                    'quelle','kunde','angebotsnummer','dienstleistung','angebotswert',
                    'laufzeit_monate','status','ae_wert','kommentar','gewonnen_datum','gewonnen_monat'];
    for (let i = 0; i < nk.length; i += 100) {
      const chunk = nk.slice(i, i + 100);
      const q = buildBatchInsert('deals_nk', nkCols, chunk,
        r => [r.id, r.datum, r.monat, r.company_id, v(r.closer_id), v(r.opener_id),
              v(r.setter_id), v(r.quelle), r.kunde, v(r.angebotsnummer),
              v(r.dienstleistung), v(r.angebotswert), v(r.laufzeit_monate),
              r.status, v(r.ae_wert), v(r.kommentar), v(r.gewonnen_datum), v(r.gewonnen_monat)]
      );
      if (q) await client.query(q.sql, q.params);
    }
    await client.query(`SELECT setval('deals_nk_id_seq', (SELECT MAX(id) FROM deals_nk))`);

    // ── 4. deals_bk — in Chunks à 100 ────────────────────────────────────
    const bk = readAll('deals_bk');
    console.log(`deals_bk: ${bk.length} Einträge`);
    const bkCols = ['id','datum','monat','company_id','kam_id','kunde','angebotsnummer',
                    'dienstleistung','angebotswert','laufzeit_monate','status',
                    'ae_wert','kommentar','gewonnen_datum','gewonnen_monat'];
    for (let i = 0; i < bk.length; i += 100) {
      const chunk = bk.slice(i, i + 100);
      const q = buildBatchInsert('deals_bk', bkCols, chunk,
        r => [r.id, r.datum, r.monat, r.company_id, v(r.kam_id), r.kunde,
              v(r.angebotsnummer), v(r.dienstleistung), v(r.angebotswert),
              v(r.laufzeit_monate), r.status, v(r.ae_wert), v(r.kommentar),
              v(r.gewonnen_datum), v(r.gewonnen_monat)]
      );
      if (q) await client.query(q.sql, q.params);
    }
    await client.query(`SELECT setval('deals_bk_id_seq', (SELECT MAX(id) FROM deals_bk))`);

    // ── 5. deals_vl — in Chunks à 100 ────────────────────────────────────
    const vl = readAll('deals_vl');
    console.log(`deals_vl: ${vl.length} Einträge`);
    const vlCols = ['id','datum','monat','company_id','kam_id','kunde','dienstleistung',
                    'angebotswert','ae_wert','laufzeit_monate','status',
                    'wie_vielt_verlaengerung','kommentar','gewonnen_datum','gewonnen_monat'];
    for (let i = 0; i < vl.length; i += 100) {
      const chunk = vl.slice(i, i + 100);
      const q = buildBatchInsert('deals_vl', vlCols, chunk,
        r => [r.id, r.datum, r.monat, r.company_id, v(r.kam_id), r.kunde,
              v(r.dienstleistung), v(r.angebotswert), v(r.ae_wert),
              v(r.laufzeit_monate), r.status, v(r.wie_vielt_verlaengerung),
              v(r.kommentar), v(r.gewonnen_datum), v(r.gewonnen_monat)]
      );
      if (q) await client.query(q.sql, q.params);
    }
    await client.query(`SELECT setval('deals_vl_id_seq', (SELECT MAX(id) FROM deals_vl))`);

    // ── 6. targets ────────────────────────────────────────────────────────
    const targets = readAll('targets');
    console.log(`targets: ${targets.length} Einträge`);
    if (targets.length > 0) {
      const q = buildBatchInsert('targets',
        ['id','company_id','monat','nk_ziel','bk_ziel','vl_ziel'],
        targets,
        r => [r.id, r.company_id, r.monat, v(r.nk_ziel), v(r.bk_ziel), v(r.vl_ziel)]
      );
      if (q) await client.query(q.sql, q.params);
      await client.query(`SELECT setval('targets_id_seq', (SELECT MAX(id) FROM targets))`);
    }

    // ── 7. ae_gesamt_monthly ──────────────────────────────────────────────
    let agm = [];
    try { agm = readAll('ae_gesamt_monthly'); } catch(e) {}
    console.log(`ae_gesamt_monthly: ${agm.length} Einträge`);
    for (const r of agm) {
      await client.query(
        `INSERT INTO ae_gesamt_monthly
           (monat,nk_bonn_anz,nk_bonn_ae,nk_bs_anz,nk_bs_ae,
            nk_at_anz,nk_at_ae,nk_ch_anz,nk_ch_ae,
            nk_gesamt,bk_gesamt,vl_gesamt,gesamt)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (monat) DO UPDATE SET
           nk_bonn_anz=EXCLUDED.nk_bonn_anz, nk_bonn_ae=EXCLUDED.nk_bonn_ae,
           nk_bs_anz=EXCLUDED.nk_bs_anz,     nk_bs_ae=EXCLUDED.nk_bs_ae,
           nk_at_anz=EXCLUDED.nk_at_anz,     nk_at_ae=EXCLUDED.nk_at_ae,
           nk_ch_anz=EXCLUDED.nk_ch_anz,     nk_ch_ae=EXCLUDED.nk_ch_ae,
           nk_gesamt=EXCLUDED.nk_gesamt, bk_gesamt=EXCLUDED.bk_gesamt,
           vl_gesamt=EXCLUDED.vl_gesamt, gesamt=EXCLUDED.gesamt`,
        [r.monat, r.nk_bonn_anz||0, r.nk_bonn_ae||0,
         r.nk_bs_anz||0, r.nk_bs_ae||0, r.nk_at_anz||0, r.nk_at_ae||0,
         r.nk_ch_anz||0, r.nk_ch_ae||0,
         r.nk_gesamt||0, r.bk_gesamt||0, r.vl_gesamt||0, r.gesamt||0]
      );
    }

    // ── 8. monthly_targets ────────────────────────────────────────────────
    let mt = [];
    try { mt = readAll('monthly_targets'); } catch(e) {}
    console.log(`monthly_targets: ${mt.length} Einträge`);
    for (const r of mt) {
      await client.query(
        `INSERT INTO monthly_targets (monat, ziel_gesamt)
         VALUES ($1,$2) ON CONFLICT (monat) DO UPDATE SET ziel_gesamt=EXCLUDED.ziel_gesamt`,
        [r.monat, r.ziel_gesamt||0]
      );
    }

    await client.query('COMMIT');
    console.log('\n✅ Migration erfolgreich abgeschlossen!');
    console.log(`   ${companies.length} Companies, ${employees.length} Mitarbeiter`);
    console.log(`   ${nk.length} NK-Deals, ${bk.length} BK-Deals, ${vl.length} VL-Deals`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Fehler — Rollback:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pg.end();
  }
}

migrate();
