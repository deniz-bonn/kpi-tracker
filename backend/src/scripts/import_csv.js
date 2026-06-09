require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../db');

const CSV_PATH = path.resolve(__dirname, '../../../../hioffice_import_data.csv');

// Quelle-Mapping: CSV-Werte → erlaubte DB-Werte
const QUELLE_MAP = {
  'cold calling': 'Cold Calling',
  'mail': 'Mail',
  'ad': 'Ad',
  'empfehlung': 'Empfehlung',
  'follow up': 'Follow Up',
  'fax': 'Mail',          // Fax → Mail (ähnlicher Kanal)
  'inbound': 'Empfehlung', // Inbound → Empfehlung
  'leadhandy': 'Ad',      // Leadhandy (Lead-App) → Ad
  'post': 'Mail',         // Post → Mail
};

function normalizeQuelle(raw) {
  if (!raw) return null;
  return QUELLE_MAP[raw.trim().toLowerCase()] || null;
}

function parseFloat2(val) {
  if (!val || val.trim() === '') return null;
  const n = parseFloat(val.replace(',', '.'));
  return isNaN(n) ? null : n;
}

function parseInt2(val) {
  if (!val || val.trim() === '') return null;
  const n = parseInt(val);
  return isNaN(n) ? null : n;
}

function parseDate(val) {
  if (!val) return null;
  return val.trim().slice(0, 10); // YYYY-MM-DD
}

function parseMonat(val) {
  if (!val) return null;
  const m = val.trim().slice(0, 7); // YYYY-MM
  return /^\d{4}-\d{2}$/.test(m) ? m : null;
}

// CSV einlesen (Semikolon-getrennt, einfaches Parsen)
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].split(';').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(';');
    if (cols.length < headers.length - 2) continue; // fehlerhafte Zeile überspringen

    const row = {};
    headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim().replace(/^"|"$/g, ''); });
    rows.push(row);
  }

  return rows;
}

// Mitarbeiter-Cache
const empCache = {}; // "Name_companyId" → id

function getOrCreateEmployee(name, companyId, rolle) {
  if (!name || name.trim() === '') return null;
  const cleanName = name.trim();
  const key = `${cleanName}_${companyId}`;

  if (empCache[key]) return empCache[key];

  // In DB suchen
  const existing = db.get(
    'SELECT id FROM employees WHERE name=? AND company_id=?',
    [cleanName, companyId]
  );

  if (existing) {
    empCache[key] = existing.id;
    return existing.id;
  }

  // Neu anlegen
  const result = db.run(
    'INSERT INTO employees (name, company_id, rolle) VALUES (?,?,?)',
    [cleanName, companyId, rolle]
  );
  const newId = result.lastInsertRowid;
  empCache[key] = newId;
  console.log(`  → Mitarbeiter angelegt: ${cleanName} (Company ${companyId}, Rolle: ${rolle})`);
  return newId;
}

// Company-Cache
const companyCache = {};

function getCompanyId(name) {
  const clean = name.trim();
  if (companyCache[clean]) return companyCache[clean];

  const row = db.get('SELECT id FROM companies WHERE name=?', [clean]);
  if (row) {
    companyCache[clean] = row.id;
    return row.id;
  }

  // Neu anlegen
  const result = db.run('INSERT INTO companies (name) VALUES (?)', [clean]);
  companyCache[clean] = result.lastInsertRowid;
  console.log(`  → Company angelegt: ${clean}`);
  return result.lastInsertRowid;
}

function main() {
  console.log(`Lese CSV: ${CSV_PATH}`);
  const rows = parseCSV(CSV_PATH);
  console.log(`${rows.length} Zeilen gefunden\n`);

  let imported = 0, skipped = 0;
  const counts = { NK: 0, BK: 0, VL: 0 };

  for (const row of rows) {
    // Pflichtfelder prüfen
    const datum = parseDate(row.datum);
    const monat = parseMonat(row.monat);
    const kategorie = row.kategorie?.trim();
    const companyName = row.company?.trim();

    if (!datum || !monat || !kategorie || !companyName) {
      skipped++;
      continue;
    }

    const validKategorien = ['Neukunde', 'Bestandskunde', 'Verlängerung'];
    if (!validKategorien.includes(kategorie)) {
      skipped++;
      continue;
    }

    const companyId = getCompanyId(companyName);
    const status = ['Offen', 'Gewonnen', 'Verloren'].includes(row.status?.trim())
      ? row.status.trim()
      : 'Offen';

    const angebotswert = parseFloat2(row.angebotswert);
    const ae_wert = parseFloat2(row.ae_wert);
    const laufzeit = parseInt2(row.laufzeit_monate);
    const kommentar = row.kommentar?.trim() || null;
    const kunde = row.kunde?.trim() || 'Unbekannt';
    const angebotsnummer = row.angebotsnummer?.trim() || null;
    const dienstleistung = row.dienstleistung?.trim() || null;

    try {
      if (kategorie === 'Neukunde') {
        const quelle = normalizeQuelle(row.quelle) || 'Cold Calling';
        const closerName = row.kam_closer?.trim();
        const openerName = row.opener?.trim();
        const setterName = row.setter?.trim();

        const closerId = closerName ? getOrCreateEmployee(closerName, companyId, 'NKV-Closer') : null;
        const openerId = openerName ? getOrCreateEmployee(openerName, companyId, 'Opener') : null;
        const setterId = setterName ? getOrCreateEmployee(setterName, companyId, 'Setter') : null;

        db.run(
          `INSERT INTO deals_nk (datum,monat,company_id,closer_id,opener_id,setter_id,quelle,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,kommentar)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [datum, monat, companyId, closerId, openerId, setterId, quelle, kunde, angebotsnummer, dienstleistung, angebotswert, laufzeit, status, ae_wert, kommentar]
        );
        counts.NK++;

      } else if (kategorie === 'Bestandskunde') {
        const kamName = row.kam_closer?.trim();
        const kamId = kamName ? getOrCreateEmployee(kamName, companyId, 'KAM') : null;

        db.run(
          `INSERT INTO deals_bk (datum,monat,company_id,kam_id,kunde,angebotsnummer,dienstleistung,angebotswert,laufzeit_monate,status,ae_wert,kommentar)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          [datum, monat, companyId, kamId, kunde, angebotsnummer, dienstleistung, angebotswert, laufzeit, status, ae_wert, kommentar]
        );
        counts.BK++;

      } else if (kategorie === 'Verlängerung') {
        const kamName = row.kam_closer?.trim();
        const kamId = kamName ? getOrCreateEmployee(kamName, companyId, 'KAM') : null;

        db.run(
          `INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,ae_wert,laufzeit_monate,status,kommentar)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [datum, monat, companyId, kamId, kunde, dienstleistung, angebotswert, ae_wert, laufzeit, status, kommentar]
        );
        counts.VL++;
      }

      imported++;
    } catch (err) {
      console.error(`  Fehler bei Zeile: ${JSON.stringify(row)}`, err.message);
      skipped++;
    }
  }

  console.log('\n=== Import abgeschlossen ===');
  console.log(`Importiert: ${imported} (NK: ${counts.NK}, BK: ${counts.BK}, VL: ${counts.VL})`);
  console.log(`Übersprungen: ${skipped}`);
}

main();
