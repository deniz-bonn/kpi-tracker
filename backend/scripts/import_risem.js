#!/usr/bin/env node
/*
 * Einmaliger, idempotenter Import historischer Risem-Angebote (CHF) aus dem Excel-Tracker.
 *
 *   node scripts/import_risem.js                   → Dry-Run (schreibt nichts, nur Protokoll)
 *   node scripts/import_risem.js --commit          → schreibt direkt in die verbundene DB
 *   node scripts/import_risem.js --emit-migration  → generiert die Deploy-Migration (SQL)
 *
 * Regeln (siehe Onboarding-Prompt):
 *  - Alle Beträge sind CHF → angebotswert (Company Risem hat currency=CHF, Anzeige/Aggregation in EUR).
 *  - KEIN historischer AE: ae_wert leer; ae_gesamt_monthly wird nie angefasst.
 *  - Status ist in den CSVs gemappt (Ja→Gewonnen, Nein→Verloren, Verhandlung/leer→Offen).
 *  - Gewonnene behalten Original-Datum/-Monat als gewonnen_datum/gewonnen_monat (ohne AE-Buchung).
 *  - "- Startangebot" / "- Weitere Kontingente" aus BK2 → deals_bk (keine Verlängerungen).
 *  - Idempotenz: jeder Deal trägt eine eindeutige Quell-ID [imp:excel_risem_2026-08:<tab>:<n>] im
 *    Kommentar; Skript wie Migration überspringen bereits vorhandene → doppellaufsicher.
 */
const fs = require('fs');
const path = require('path');
const db = require('../src/db');

const COMMIT = process.argv.includes('--commit');
const EMIT   = process.argv.includes('--emit-migration');
const SOURCE = 'excel_risem_2026-08';
const DATA   = path.join(__dirname, 'data', 'risem');
const uidMarker = (tab, n) => `[imp:${SOURCE}:${tab}:${n}]`;

const NAME_MAP = {
  Zymer: 'Zymer Shala', Baran: 'Baran Bünül', Daris: 'Daris Becic', Silas: 'Silas Rudolph',
  Elias: 'Elias Ackle', Leo: 'Leo Stalder', Deniz: 'Deniz Boukhris', Dardan: 'Dardan Shala',
  Vahie: 'Vahieran Kanthathason', Kai: 'Kai Bucher',
};

function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const rows = []; let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; } else field += ch; }
    else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(field); field = ''; if (row.length > 1 || row[0] !== '') rows.push(row); row = []; }
    else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); if (row.length > 1 || row[0] !== '') rows.push(row); }
  const header = rows.shift();
  return rows.map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const num = v => { const n = Number(String(v).replace(',', '.')); return v === '' || v == null || isNaN(n) ? null : n; };
const orNull = v => (v == null || v === '') ? null : v;
const sqlStr = v => v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;
const sqlNum = v => v == null ? 'NULL' : Number(v);

async function main() {
  const dialect = db.dialect;
  const mode = EMIT ? 'EMIT-MIGRATION' : COMMIT ? 'COMMIT (schreibt)' : 'DRY-RUN (schreibt nichts)';
  console.log(`\n=== Risem-Import — ${mode} · Dialekt: ${dialect} ===\n`);

  const risem = await db.get(`SELECT id FROM companies WHERE name='Risem'`);
  if (!risem) { console.error('FEHLER: Company Risem fehlt — erst Migration 073 ausführen.'); process.exit(1); }
  const emps = await db.all(`SELECT id, name FROM employees WHERE company_id=${dialect === 'postgres' ? '$1' : '?'}`, [risem.id]);
  const byName = Object.fromEntries(emps.map(e => [e.name, e.id]));
  const anomalies = [];
  // Personen-Referenz: gibt vollen Namen zurück (oder null) + protokolliert Anomalien
  const emp = (vorname, ctx) => {
    if (!vorname) return null;
    const full = NAME_MAP[vorname];
    if (!full || (!EMIT && !byName[full])) { anomalies.push(`Person nicht auflösbar: "${vorname}" (${ctx})`); return null; }
    return full;
  };

  const p = (n) => dialect === 'postgres' ? `$${n}` : '?';
  const RISEM_SUB = `(SELECT id FROM companies WHERE name='Risem')`;
  const empSub = (fullName) => fullName == null ? 'NULL'
    : `(SELECT id FROM employees WHERE name=${sqlStr(fullName)} AND company_id=${RISEM_SUB})`;

  const agBefore = await db.all(`SELECT monat, gesamt, nk_ch_ae, nk_gesamt, bk_gesamt, vl_gesamt FROM ae_gesamt_monthly WHERE monat IN ('2026-06','2026-07') ORDER BY monat`);

  // Idempotenz: bereits importierte UIDs je Tabelle (aus dem Kommentar) vorab laden
  const existing = {};
  for (const t of ['deals_bk', 'deals_vl', 'deals_nk']) {
    const rows = await db.all(`SELECT kommentar FROM ${t} WHERE company_id=${p(1)} AND kommentar LIKE ${p(2)}`, [risem.id, `%[imp:${SOURCE}:%`]);
    existing[t] = new Set(rows.map(r => (r.kommentar.match(/\[imp:[^\]]+\]/) || [''])[0]));
  }

  const stats = {};
  const emitSql = [];
  // Personen-Felder werden als { __emp: 'Voller Name'|null } übergeben.
  const isEmp = v => v && typeof v === 'object' && '__emp' in v;

  function addDeal(table, obj) {
    stats[table] = stats[table] || { imported: 0, skipped: 0 };
    const uid = obj.kommentar.match(/\[imp:[^\]]+\]/)[0];
    if (existing[table].has(uid)) { stats[table].skipped++; return; }

    if (EMIT) {
      const cols = Object.keys(obj);
      const vals = cols.map(c => isEmp(obj[c]) ? empSub(obj[c].__emp)
        : (c === 'company_id') ? RISEM_SUB
        : (typeof obj[c] === 'number') ? sqlNum(obj[c]) : sqlStr(obj[c]));
      emitSql.push(
        `INSERT INTO ${table} (${cols.join(', ')})\n` +
        `SELECT ${vals.join(', ')}\n` +
        `WHERE NOT EXISTS (SELECT 1 FROM ${table} WHERE company_id=${RISEM_SUB} AND kommentar LIKE '%${uid}%');`
      );
    } else if (COMMIT) {
      const cols = Object.keys(obj);
      const vals = cols.map(c => isEmp(obj[c]) ? (obj[c].__emp ? byName[obj[c].__emp] : null) : obj[c]);
      const ph = cols.map((_, i) => p(i + 1)).join(',');
      db.run(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${ph})`, vals);
    }
    stats[table].imported++;
  }

  const kom = parts => parts.filter(Boolean).join(' ').trim();
  const gew = r => r.status === 'Gewonnen' ? { gewonnen_datum: r.datum, gewonnen_monat: r.monat } : { gewonnen_datum: null, gewonnen_monat: null };

  // ── BK ───────────────────────────────────────────────────────────────────────
  const bk = parseCsv(fs.readFileSync(path.join(DATA, 'risem_bk_angebote_juni_juli.csv'), 'utf8'));
  bk.forEach((r, idx) => {
    const g = gew(r);
    addDeal('deals_bk', {
      datum: r.datum, monat: r.monat, company_id: risem.id, kam_id: { __emp: emp(r.kam, `BK ${r.kunde}`) },
      kunde: r.kunde, angebotsnummer: orNull(r.angebotsnummer), dienstleistung: orNull(r.dienstleistung),
      angebotswert: num(r.wert_chf), laufzeit_monate: num(r.laufzeit_monate), status: r.status, ae_wert: null,
      kommentar: kom([r.kommentar, `[orig:${r.status_original}]`, uidMarker('bk', idx)]),
      gewonnen_datum: g.gewonnen_datum, gewonnen_monat: g.gewonnen_monat,
    });
  });

  // ── VL (mit Umleitung der Startangebote/Weitere Kontingente nach deals_bk) ─────
  const vl = parseCsv(fs.readFileSync(path.join(DATA, 'risem_vl_juni_juli.csv'), 'utf8'));
  let umgeleitet = 0;
  vl.forEach((r, idx) => {
    const g = gew(r);
    const nachBK = /- (Startangebot|Weitere Kontingente)/.test(r.kunde);
    const komm = kom([r.kommentar, r.crm_link ? `[crm:${r.crm_link}]` : '', r.grund ? `[grund:${r.grund}]` : '',
      r.bezahlt ? `[bezahlt:${r.bezahlt}]` : '', r.kuendigungsfrist_abgelaufen ? `[kfrist:${r.kuendigungsfrist_abgelaufen}]` : '',
      r.datum_kuendigung && nachBK ? `[gekuendigt:${r.datum_kuendigung}]` : '', `[orig:${r.status_original}]`, uidMarker('vl', idx)]);
    if (nachBK) {
      umgeleitet++;
      addDeal('deals_bk', {
        datum: r.datum, monat: r.monat, company_id: risem.id, kam_id: { __emp: emp(r.kam, `VL→BK ${r.kunde}`) },
        kunde: r.kunde, angebotsnummer: null, dienstleistung: orNull(r.dienstleistung),
        angebotswert: num(r.wert_chf), laufzeit_monate: num(r.laufzeit_monate), status: r.status, ae_wert: null,
        kommentar: komm, gewonnen_datum: g.gewonnen_datum, gewonnen_monat: g.gewonnen_monat,
      });
    } else {
      addDeal('deals_vl', {
        datum: r.datum, monat: r.monat, company_id: risem.id, kam_id: { __emp: emp(r.kam, `VL ${r.kunde}`) },
        kunde: r.kunde, dienstleistung: orNull(r.dienstleistung),
        angebotswert: num(r.wert_chf), ae_wert: null, laufzeit_monate: num(r.laufzeit_monate),
        status: r.status, wie_vielt_verlaengerung: null, kommentar: komm,
        gewonnen_datum: g.gewonnen_datum, gewonnen_monat: g.gewonnen_monat, gekuendigt_am: orNull(r.datum_kuendigung),
      });
    }
  });

  // ── NK ───────────────────────────────────────────────────────────────────────
  const nk = parseCsv(fs.readFileSync(path.join(DATA, 'risem_nk_juli.csv'), 'utf8'));
  nk.forEach((r, idx) => {
    const g = gew(r);
    const crm = r.crm_link && r.crm_link !== 'Link' ? `[crm:${r.crm_link}]` : '';
    addDeal('deals_nk', {
      datum: r.datum, monat: r.monat, company_id: risem.id, quelle: orNull(r.quelle),
      closer_id: { __emp: emp(r.closer, `NK ${r.kunde}`) }, opener_id: { __emp: emp(r.opener, `NK ${r.kunde}`) },
      setter_id: { __emp: emp(r.setter, `NK ${r.kunde}`) },
      kunde: r.kunde, dienstleistung: orNull(r.dienstleistung), angebotswert: num(r.wert_chf),
      laufzeit_monate: num(r.laufzeit_monate), status: r.status, ae_wert: null,
      automatische_verlaengerung: orNull(r.auto_verlaengerung),
      kommentar: kom([r.kommentar, crm, `[orig:${r.status_original}]`, uidMarker('nk', idx)]),
      gewonnen_datum: g.gewonnen_datum, gewonnen_monat: g.gewonnen_monat,
    });
  });

  const agAfter = await db.all(`SELECT monat, gesamt, nk_ch_ae, nk_gesamt, bk_gesamt, vl_gesamt FROM ae_gesamt_monthly WHERE monat IN ('2026-06','2026-07') ORDER BY monat`);

  // ── Migration schreiben ──
  if (EMIT) {
    const header = `-- Migration 076: Einmaliger historischer Risem-Import (generiert aus scripts/import_risem.js).\n` +
      `-- Idempotent via eindeutiger [imp:${SOURCE}:<tab>:<n>]-Kennung im Kommentar (WHERE NOT EXISTS).\n` +
      `-- Beträge sind CHF (Company Risem currency=CHF); ae_wert bleibt leer (kein historischer AE).\n\n`;
    const body = emitSql.join('\n\n') + '\n';
    fs.writeFileSync(path.join(__dirname, '..', 'migrations', '076_risem_import.pg.sql'), header + body);
    fs.writeFileSync(path.join(__dirname, '..', 'migrations', '076_risem_import.sql'), header + body);
    console.log(`Migration geschrieben: 076_risem_import.pg.sql + .sql (${emitSql.length} INSERTs)`);
  }

  // ── Protokoll ──
  const cnt = (rows, f) => rows.filter(f).length;
  console.log('PRO TABELLE (importiert / übersprungen):');
  for (const [t, s] of Object.entries(stats)) console.log(`  ${t}: ${s.imported} / ${s.skipped}`);
  console.log(`\nCSV-Zeilen: BK ${bk.length}, VL ${vl.length}, NK ${nk.length}`);
  console.log(`VL→BK umgeleitet (Startangebot/Weitere Kontingente): ${umgeleitet}`);
  console.log(`\nStatus-Verteilung (CSV):`);
  for (const [n2, rows] of [['BK', bk], ['VL', vl], ['NK', nk]])
    console.log(`  ${n2}: Gewonnen ${cnt(rows, r => r.status === 'Gewonnen')}, Verloren ${cnt(rows, r => r.status === 'Verloren')}, Offen ${cnt(rows, r => r.status === 'Offen')}`);
  console.log(`\nANOMALIEN (${anomalies.length}):`);
  [...new Set(anomalies)].forEach(a => console.log(`  · ${a}`));
  const kamlos = vl.filter(r => !r.kam).map(r => r.kunde);
  if (kamlos.length) console.log(`Zeilen ohne KAM: ${kamlos.length} → ${kamlos.join(', ')}`);
  console.log(`\nae_gesamt_monthly Juni/Juli — Vorher/Nachher:`);
  console.log('  VORHER: ', JSON.stringify(agBefore));
  console.log('  NACHHER:', JSON.stringify(agAfter));
  console.log(`  → ${JSON.stringify(agBefore) === JSON.stringify(agAfter) ? '✓ unverändert' : '✗ VERÄNDERT!'}`);
  console.log(`\n${EMIT ? '✅ Migration generiert.' : COMMIT ? '✅ COMMIT abgeschlossen.' : 'ℹ️  DRY-RUN — nichts geschrieben.'}\n`);
  process.exit(0);
}

main().catch(e => { console.error('Import-Fehler:', e.message, e.stack?.split('\n')[1]); process.exit(1); });
