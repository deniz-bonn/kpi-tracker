#!/usr/bin/env node
/**
 * Read-only Diagnose der VL-AE-Diskrepanz Juni 2026 (Prod / Postgres).
 * Führt NUR SELECTs aus — keine Schreibzugriffe, keine Migration.
 *
 * Aufruf:
 *   DATABASE_URL="postgresql://..." node backend/scripts/diagnose_vl_juni.js
 *   (optional anderer Monat)  MONAT=2026-05 node ...
 */
const { Client } = require('pg');

const MONAT = process.env.MONAT || '2026-06';
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('FEHLER: DATABASE_URL nicht gesetzt.');
  console.error('Beispiel: DATABASE_URL="postgresql://user:pw@host:port/db" node backend/scripts/diagnose_vl_juni.js');
  process.exit(1);
}

const eur = (v) => (Number(v) || 0).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
const line = (c = '─') => console.log(c.repeat(78));

(async () => {
  const client = new Client({
    connectionString: url,
    ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    // ── 1) Dashboard-Quelle: eingefrorener Snapshot ─────────────────────────
    line('═');
    console.log(`1) DASHBOARD-QUELLE  ae_gesamt_monthly  (${MONAT})`);
    line();
    const ag = await client.query(
      `SELECT monat, vl_de_ae, vl_at_ae, vl_gesamt,
              (vl_de_ae + vl_at_ae) AS dashboard_vl, gesamt, updated_at
         FROM ae_gesamt_monthly WHERE monat = $1`, [MONAT]);
    if (ag.rows.length === 0) {
      console.log(`  KEINE Zeile für ${MONAT} -> Dashboard rechnet LIVE aus den Deals.`);
    } else {
      const r = ag.rows[0];
      console.log(`  vl_de_ae            : ${eur(r.vl_de_ae)}`);
      console.log(`  vl_at_ae            : ${eur(r.vl_at_ae)}`);
      console.log(`  => Dashboard zeigt  : ${eur(r.dashboard_vl)}   (vl_de_ae + vl_at_ae)`);
      console.log(`  vl_gesamt (Spalte)  : ${eur(r.vl_gesamt)}${Number(r.vl_gesamt) !== Number(r.dashboard_vl) ? '   <-- INKONSISTENT' : '   (konsistent)'}`);
      console.log(`  gesamt (Spalte)     : ${eur(r.gesamt)}   [nur >0-Gate für useAG]`);
      console.log(`  updated_at          : ${r.updated_at}`);
    }

    // ── 2) VL-Seite: Live-Summe aus deals_vl ────────────────────────────────
    line('═');
    console.log(`2) VL-SEITE (live)  deals_vl  monat=${MONAT}  status='Gewonnen'`);
    line();
    const live = await client.query(
      `SELECT COUNT(*) AS n, COALESCE(SUM(d.ae_wert),0) AS live_vl_ae
         FROM deals_vl d LEFT JOIN companies c ON c.id = d.company_id
        WHERE d.monat = $1 AND d.status = 'Gewonnen'
          AND (c.aktiv_ab IS NULL OR c.aktiv_ab <= CURRENT_DATE)`, [MONAT]);
    console.log(`  Realisierter AE (nach d.monat)      : ${eur(live.rows[0].live_vl_ae)}  (${live.rows[0].n} Deals)`);

    const liveGew = await client.query(
      `SELECT COUNT(*) AS n, COALESCE(SUM(d.ae_wert),0) AS ae
         FROM deals_vl d LEFT JOIN companies c ON c.id = d.company_id
        WHERE d.gewonnen_monat = $1 AND d.status = 'Gewonnen'
          AND (c.aktiv_ab IS NULL OR c.aktiv_ab <= CURRENT_DATE)`, [MONAT]);
    console.log(`  Gegenprobe (nach d.gewonnen_monat)  : ${eur(liveGew.rows[0].ae)}  (${liveGew.rows[0].n} Deals)`);

    const drift = await client.query(
      `SELECT COUNT(*) AS n FROM deals_vl d
        WHERE d.status = 'Gewonnen'
          AND (d.monat = $1 OR d.gewonnen_monat = $1)
          AND COALESCE(d.monat,'') <> COALESCE(d.gewonnen_monat,'')`, [MONAT]);
    console.log(`  Deals mit monat <> gewonnen_monat   : ${drift.rows[0].n}  (Monatszuordnungs-Hypothese)`);

    if (ag.rows.length) {
      const diff = Number(ag.rows[0].dashboard_vl) - Number(live.rows[0].live_vl_ae);
      console.log(`\n  DIFFERENZ Dashboard − Live         : ${eur(diff)}`);
    }

    // ── 3) Aufschlüsselung nach KAM / Standort / Status ─────────────────────
    line('═');
    console.log(`3) deals_vl  monat=${MONAT}  — nach KAM / Standort / Status`);
    line();
    const grp = await client.query(
      `SELECT COALESCE(e.name,'(kein KAM)')     AS kam,
              COALESCE(e.standort,'(kein Standort)') AS standort,
              COALESCE(d.status,'(kein Status)') AS status,
              COUNT(*)                          AS anzahl,
              COALESCE(SUM(d.ae_wert),0)        AS ae_wert,
              COALESCE(SUM(d.angebotswert),0)   AS angebotswert
         FROM deals_vl d
         LEFT JOIN employees e ON e.id = d.kam_id
         LEFT JOIN companies c ON c.id = d.company_id
        WHERE d.monat = $1
          AND (c.aktiv_ab IS NULL OR c.aktiv_ab <= CURRENT_DATE)
        GROUP BY e.name, e.standort, d.status
        ORDER BY e.standort, e.name, d.status`, [MONAT]);

    const pad = (s, n) => String(s).padEnd(n).slice(0, n);
    const padL = (s, n) => String(s).padStart(n);
    console.log(pad('KAM', 24) + pad('Standort', 15) + pad('Status', 12) + padL('Anz', 5) + padL('AE-Wert', 14) + padL('Angebotswert', 15));
    line('-');
    let tAnz = 0, tAe = 0, tAgw = 0;
    for (const r of grp.rows) {
      console.log(pad(r.kam, 24) + pad(r.standort, 15) + pad(r.status, 12) +
        padL(r.anzahl, 5) + padL(eur(r.ae_wert), 14) + padL(eur(r.angebotswert), 15));
      tAnz += Number(r.anzahl); tAe += Number(r.ae_wert); tAgw += Number(r.angebotswert);
    }
    line('-');
    console.log(pad('SUMME (alle Status)', 51) + padL(tAnz, 5) + padL(eur(tAe), 14) + padL(eur(tAgw), 15));

    // Nur Gewonnen, nach Standort — direkt vergleichbar mit Dashboard DE/AT
    console.log('');
    console.log(`Nur status='Gewonnen', nach Standort (vergleichbar mit Dashboard DE/AT):`);
    line('-');
    const byLoc = await client.query(
      `SELECT COALESCE(e.standort,'(kein Standort)') AS standort,
              COUNT(*) AS anzahl, COALESCE(SUM(d.ae_wert),0) AS ae_wert
         FROM deals_vl d
         LEFT JOIN employees e ON e.id = d.kam_id
         LEFT JOIN companies c ON c.id = d.company_id
        WHERE d.monat = $1 AND d.status = 'Gewonnen'
          AND (c.aktiv_ab IS NULL OR c.aktiv_ab <= CURRENT_DATE)
        GROUP BY e.standort ORDER BY e.standort`, [MONAT]);
    for (const r of byLoc.rows) {
      console.log('  ' + pad(r.standort, 20) + padL(r.anzahl, 5) + padL(eur(r.ae_wert), 14));
    }
    if (ag.rows.length) {
      const de = byLoc.rows.filter(r => ['Bonn', 'Braunschweig'].includes(r.standort)).reduce((s, r) => s + Number(r.ae_wert), 0);
      const at = byLoc.rows.filter(r => r.standort === 'Österreich').reduce((s, r) => s + Number(r.ae_wert), 0);
      console.log('');
      console.log(`  Deutschland  live ${eur(de)}  vs. Snapshot vl_de_ae ${eur(ag.rows[0].vl_de_ae)}  -> Δ ${eur(Number(ag.rows[0].vl_de_ae) - de)}`);
      console.log(`  Österreich   live ${eur(at)}  vs. Snapshot vl_at_ae ${eur(ag.rows[0].vl_at_ae)}  -> Δ ${eur(Number(ag.rows[0].vl_at_ae) - at)}`);
    }

    // ── 4) Kontrollen: Duplikate / NULL-ae_wert ─────────────────────────────
    line('═');
    console.log('4) KONTROLLEN');
    line();
    const dup = await client.query(
      `SELECT d.kunde, d.ae_wert, COUNT(*) AS c
         FROM deals_vl d WHERE d.monat = $1 AND d.status = 'Gewonnen'
        GROUP BY d.kunde, d.ae_wert HAVING COUNT(*) > 1 ORDER BY COUNT(*) DESC`, [MONAT]);
    console.log(`  Mögliche Duplikate (kunde+ae_wert doppelt): ${dup.rows.length}`);
    for (const r of dup.rows.slice(0, 15)) console.log(`     ${r.c}x  ${r.kunde}  ${eur(r.ae_wert)}`);

    const nullAe = await client.query(
      `SELECT COUNT(*) AS n, COALESCE(SUM(d.angebotswert),0) AS agw
         FROM deals_vl d WHERE d.monat = $1 AND d.status = 'Gewonnen' AND d.ae_wert IS NULL`, [MONAT]);
    console.log(`  Gewonnen OHNE ae_wert: ${nullAe.rows[0].n} Deals (Angebotswert-Summe ${eur(nullAe.rows[0].agw)})`);
    line('═');
  } finally {
    await client.end();
  }
})().catch(e => { console.error('FEHLER:', e.message); process.exit(1); });
