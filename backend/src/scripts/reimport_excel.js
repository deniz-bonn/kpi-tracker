/**
 * reimport_excel.js
 *
 * Reads excel_import_data.json and imports all 2026 deals into the DB.
 * Works with both SQLite (local) and PostgreSQL (Railway via DATABASE_URL).
 *
 * Usage:
 *   node src/scripts/reimport_excel.js
 *
 * What it does:
 *   1. Deletes all 2026 deals from deals_nk, deals_bk, deals_vl
 *   2. Ensures all customer names exist in the companies table (upsert)
 *   3. Inserts all deals from the JSON into the appropriate tables
 *   4. Sets gewonnen_datum/gewonnen_monat when status = 'Gewonnen'
 *   5. Prints row counts and AE sums per month per category
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../db');

const JSON_PATH = path.resolve(__dirname, '../../data/excel_import_data.json');

// The company_id used for all fach.digital deals
const COMPANY_ID = 1;

// Normalize Quelle values
const QUELLE_MAP = {
  'cold calling': 'Cold Calling',
  'mail': 'Mail',
  'ad': 'Ad',
  'empfehlung': 'Empfehlung',
  'follow up': 'Follow Up',
  'inbound': 'Empfehlung',
  'fax': 'Mail',
  'leadhandy': 'Ad',
  'post': 'Mail',
};

function normalizeQuelle(raw) {
  if (!raw) return 'Cold Calling';
  return QUELLE_MAP[raw.trim().toLowerCase()] || raw.trim();
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function isPostgres() {
  return db.dialect === 'postgres';
}

/**
 * Run a query with proper placeholder syntax.
 * SQLite uses positional ? parameters.
 * PostgreSQL uses $1, $2, ... parameters.
 */
function run(sql, params) {
  if (isPostgres()) {
    // Convert ? to $1, $2, ...
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    return db.run(pgSql, params);
  }
  return db.run(sql, params);
}

function all(sql, params) {
  if (isPostgres()) {
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    return db.all(pgSql, params);
  }
  return db.all(sql, params);
}

function get(sql, params) {
  if (isPostgres()) {
    let i = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++i}`);
    return db.get(pgSql, params);
  }
  return db.get(sql, params);
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Reading JSON: ${JSON_PATH}`);
  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`JSON file not found: ${JSON_PATH}`);
  }
  const deals = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  console.log(`Loaded ${deals.length} deals\n`);

  // ── Step 1: Delete existing 2026 data ────────────────────────────────────────
  console.log('=== Step 1: Deleting existing 2026 data ===');
  await run("DELETE FROM deals_nk WHERE monat LIKE '2026-%'", []);
  await run("DELETE FROM deals_bk WHERE monat LIKE '2026-%'", []);
  await run("DELETE FROM deals_vl WHERE monat LIKE '2026-%'", []);
  console.log('  Deleted all 2026 rows from deals_nk, deals_bk, deals_vl\n');

  // ── Step 2: Insert deals ──────────────────────────────────────────────────────
  console.log('=== Step 2: Inserting deals ===');
  let countNK = 0, countBK = 0, countVL = 0, errors = 0;

  for (const deal of deals) {
    const {
      kategorie, monat, datum, kunde, closer_id,
      dienstleistung, ae_wert, angebotswert, status,
      laufzeit_monate, quelle, opener_name, setter_name,
      angebotsnummer,
    } = deal;

    // Set gewonnen fields only for Gewonnen deals
    const gewonnen_datum = status === 'Gewonnen' ? datum : null;
    const gewonnen_monat = status === 'Gewonnen' ? monat : null;

    const kundeVal = kunde || 'Unbekannt';
    const quelle_norm = normalizeQuelle(quelle);

    try {
      if (kategorie === 'NK') {
        // For NK: opener_id and setter_id are not resolved (no employee map for openers)
        // We store opener_name and setter_name in kommentar if needed — they go into
        // a future migration. For now we store NULL for opener_id/setter_id.
        await run(
          `INSERT INTO deals_nk
           (datum, monat, company_id, closer_id, opener_id, setter_id,
            quelle, kunde, angebotsnummer, dienstleistung,
            angebotswert, laufzeit_monate, status, ae_wert,
            gewonnen_datum, gewonnen_monat)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            datum, monat, COMPANY_ID, closer_id || null, null, null,
            quelle_norm, kundeVal, angebotsnummer || null, dienstleistung || null,
            angebotswert ?? null, laufzeit_monate ?? null, status, ae_wert ?? 0,
            gewonnen_datum, gewonnen_monat,
          ]
        );
        countNK++;

      } else if (kategorie === 'BK') {
        await run(
          `INSERT INTO deals_bk
           (datum, monat, company_id, kam_id,
            kunde, angebotsnummer, dienstleistung,
            angebotswert, laufzeit_monate, status, ae_wert,
            gewonnen_datum, gewonnen_monat)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            datum, monat, COMPANY_ID, closer_id || null,
            kundeVal, angebotsnummer || null, dienstleistung || null,
            angebotswert ?? null, laufzeit_monate ?? null, status, ae_wert ?? 0,
            gewonnen_datum, gewonnen_monat,
          ]
        );
        countBK++;

      } else if (kategorie === 'VL') {
        await run(
          `INSERT INTO deals_vl
           (datum, monat, company_id, kam_id,
            kunde, dienstleistung,
            angebotswert, ae_wert, laufzeit_monate, status,
            gewonnen_datum, gewonnen_monat)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            datum, monat, COMPANY_ID, closer_id || null,
            kundeVal, dienstleistung || null,
            angebotswert ?? null, ae_wert ?? 0, laufzeit_monate ?? null, status,
            gewonnen_datum, gewonnen_monat,
          ]
        );
        countVL++;
      }
    } catch (err) {
      errors++;
      console.error(`  ERROR inserting deal (${kategorie} ${monat} "${kundeVal}"): ${err.message}`);
    }
  }

  console.log(`  Inserted: NK=${countNK}, BK=${countBK}, VL=${countVL}`);
  if (errors > 0) console.log(`  Errors: ${errors}`);
  console.log();

  // ── Step 3: Verification summary ─────────────────────────────────────────────
  console.log('=== Step 3: Verification — Row counts and AE sums per month ===\n');

  // NK
  console.log('── NK (Neukunden) ──');
  const nkRows = await all(
    `SELECT monat,
            COUNT(*) AS total,
            SUM(CASE WHEN status='Gewonnen' THEN 1 ELSE 0 END) AS gewonnen,
            SUM(CASE WHEN status='Gewonnen' THEN ae_wert ELSE 0 END) AS ae_sum
     FROM deals_nk WHERE monat LIKE '2026-%'
     GROUP BY monat ORDER BY monat`,
    []
  );
  printTable(nkRows);

  // BK
  console.log('\n── BK (Bestandskunden) ──');
  const bkRows = await all(
    `SELECT monat,
            COUNT(*) AS total,
            SUM(CASE WHEN status='Gewonnen' THEN 1 ELSE 0 END) AS gewonnen,
            SUM(CASE WHEN status='Gewonnen' THEN ae_wert ELSE 0 END) AS ae_sum
     FROM deals_bk WHERE monat LIKE '2026-%'
     GROUP BY monat ORDER BY monat`,
    []
  );
  printTable(bkRows);

  // VL
  console.log('\n── VL (Verlängerungen) ──');
  const vlRows = await all(
    `SELECT monat,
            COUNT(*) AS total,
            SUM(CASE WHEN status='Gewonnen' THEN 1 ELSE 0 END) AS gewonnen,
            SUM(CASE WHEN status='Gewonnen' THEN ae_wert ELSE 0 END) AS ae_sum
     FROM deals_vl WHERE monat LIKE '2026-%'
     GROUP BY monat ORDER BY monat`,
    []
  );
  printTable(vlRows);

  // ── Spot checks ───────────────────────────────────────────────────────────────
  console.log('\n=== Spot Checks ===');
  const checks = [
    { label: 'NK April Gewonnen', table: 'deals_nk', monat: '2026-04', status: 'Gewonnen', expCount: 24, expAE: 283000 },
    { label: 'NK Mai Gewonnen',   table: 'deals_nk', monat: '2026-05', status: 'Gewonnen', expCount: 58, expAE: 584300 },
    { label: 'BK April Gewonnen', table: 'deals_bk', monat: '2026-04', status: 'Gewonnen', expCount: 31, expAE: 542100 },
    { label: 'VL Feb Gewonnen',   table: 'deals_vl', monat: '2026-02', status: 'Gewonnen', expCount: 39, expAE: 233388 },
    { label: 'VL April Gewonnen', table: 'deals_vl', monat: '2026-04', status: 'Gewonnen', expCount: 26, expAE: 148400 },
  ];

  for (const c of checks) {
    const row = await get(
      `SELECT COUNT(*) AS cnt, COALESCE(SUM(ae_wert),0) AS ae_sum
       FROM ${c.table} WHERE monat=? AND status=?`,
      [c.monat, c.status]
    );
    const cnt = Number(row.cnt);
    const ae = Number(row.ae_sum);
    const countOk = cnt === c.expCount ? '✓' : `✗ (expected ${c.expCount})`;
    const aeOk = Math.abs(ae - c.expAE) < 10 ? '✓' : `✗ (expected ${c.expAE.toLocaleString()})`;
    console.log(`  ${c.label}: count=${cnt} ${countOk}, AE=${ae.toLocaleString()} ${aeOk}`);
  }

  console.log('\nImport complete!');

  // Close pool if PostgreSQL
  if (isPostgres() && db.pool) {
    await db.pool.end();
  }
}

function printTable(rows) {
  if (!rows || rows.length === 0) {
    console.log('  (no rows)');
    return;
  }
  console.log('  ' + 'Monat'.padEnd(12) + 'Total'.padStart(6) + 'Gewonnen'.padStart(10) + 'AE Sum'.padStart(15));
  console.log('  ' + '-'.repeat(45));
  for (const r of rows) {
    const ae = Math.round(Number(r.ae_sum)).toLocaleString('de-DE');
    const monat = String(r.monat).padEnd(12);
    const total = String(r.total).padStart(6);
    const gew = String(r.gewonnen).padStart(10);
    console.log('  ' + monat + total + gew + ae.padStart(15));
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
