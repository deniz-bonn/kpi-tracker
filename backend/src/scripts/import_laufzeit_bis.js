/**
 * import_laufzeit_bis.js
 *
 * Reads the Excel VL sheets and updates deals_vl.auslaufend_am
 * from the "Aktuelle Laufzeit bis" column, which was missing from the
 * original import.
 *
 * Match key: kunde (trimmed) + monat (YYYY-MM derived from datum)
 *
 * Usage:
 *   node src/scripts/import_laufzeit_bis.js [--dry-run]
 */

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const EXCEL_PATH = path.resolve(__dirname, '../../../../Angebots-Tracker_fach.digital_2026 (3).xlsx');

const DRY_RUN = process.argv.includes('--dry-run');

async function extractLaufzeitBis() {
  // Use Python + openpyxl to extract the data
  const script = `
import json, sys
import openpyxl
from datetime import datetime

path = ${JSON.stringify(EXCEL_PATH)}
wb = openpyxl.load_workbook(path, data_only=True)

vl_sheets = [s for s in wb.sheetnames if 'verlängerungen' in s.lower() and 'übersicht' not in s.lower()]

records = []
for sheet_name in vl_sheets:
    ws = wb[sheet_name]
    header_row = None
    for i, row in enumerate(ws.iter_rows(min_row=1, max_row=20, values_only=True)):
        if row[0] and 'datum' in str(row[0]).lower() and row[1] and 'kunde' in str(row[1]).lower():
            header_row = i + 1
            break
    if not header_row:
        continue
    for row in ws.iter_rows(min_row=header_row+1, values_only=True):
        datum, kunde, kam, leistung, laufzeit_bis = row[0], row[1], row[2], row[3], row[4]
        if not datum or not kunde:
            continue
        datum_str = datum.strftime('%Y-%m-%d') if isinstance(datum, datetime) else str(datum)[:10]
        laufzeit_bis_str = laufzeit_bis.strftime('%Y-%m-%d') if isinstance(laufzeit_bis, datetime) else (str(laufzeit_bis)[:10] if laufzeit_bis else None)
        if datum_str and laufzeit_bis_str:
            records.append({'monat': datum_str[:7], 'kunde': str(kunde).strip(), 'laufzeit_bis': laufzeit_bis_str})

print(json.dumps(records))
`;

  const tmpFile = path.resolve(__dirname, '_tmp_extract.py');
  fs.writeFileSync(tmpFile, script);
  try {
    const output = execSync(`python3 ${tmpFile}`, { encoding: 'utf8' });
    return JSON.parse(output);
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

function placeholder(i) {
  return db.dialect === 'postgres' ? `$${i}` : '?';
}

async function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`Excel not found: ${EXCEL_PATH}`);
    process.exit(1);
  }

  console.log('Extracting Laufzeit bis from Excel...');
  const records = await extractLaufzeitBis();
  console.log(`Extracted ${records.length} records from Excel\n`);

  if (DRY_RUN) console.log('--- DRY RUN ---\n');

  let updated = 0, skipped = 0, notFound = 0;

  for (const r of records) {
    const p1 = placeholder(1), p2 = placeholder(2);
    const existing = await db.get(
      `SELECT id, auslaufend_am FROM deals_vl WHERE kunde = ${p1} AND monat = ${p2}`,
      [r.kunde, r.monat]
    );

    if (!existing) {
      notFound++;
      console.log(`  NOT FOUND: "${r.kunde}" (${r.monat})`);
      continue;
    }

    if (existing.auslaufend_am) {
      skipped++;
      continue;
    }

    if (!DRY_RUN) {
      const p3 = placeholder(1), p4 = placeholder(2);
      await db.run(
        `UPDATE deals_vl SET auslaufend_am = ${p3} WHERE id = ${p4}`,
        [r.laufzeit_bis, existing.id]
      );
    }
    updated++;
    if (DRY_RUN) console.log(`  WOULD UPDATE: id=${existing.id} "${r.kunde}" → auslaufend_am=${r.laufzeit_bis}`);
  }

  console.log(`\nResults:`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Skipped (already set): ${skipped}`);
  console.log(`  Not found in DB: ${notFound}`);

  if (db.dialect === 'postgres' && db.pool) await db.pool.end();
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
