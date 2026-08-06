#!/usr/bin/env node
/**
 * Read-only Diagnose rund um gewonnen_monat / AE-Buchung. NUR SELECTs — keine Schreibzugriffe.
 *
 *   (a) Audit-Historie der beiden Sükrü-Deals (jeder Schreibvorgang: wann, wer, welche Felder)
 *   Punkt 4  Bestand: gewonnene Deals mit gewonnen_datum, aber gewonnen_monat NULL (nk/bk/vl)
 *   Punkt 2  ae_gesamt_monthly-Zeile je betroffenem Monat (live vs. frozen)
 *   (e)      Abgleich: gewonnene AE laut deals vs. ae_gesamt_monthly je Monat (fehlende AE finden)
 *
 * Aufruf:  DATABASE_URL="postgresql://..." node backend/scripts/diagnose_gewonnen_monat.js
 */
const { Client } = require('pg');
const url = process.env.DATABASE_URL;
if (!url) { console.error('FEHLER: DATABASE_URL nicht gesetzt.'); process.exit(1); }

const eur = v => (Number(v) || 0).toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €';
const line = (c = '─') => console.log(c.repeat(80));
const parse = v => { try { return typeof v === 'string' ? JSON.parse(v) : (v || {}); } catch { return {}; } };
const ymd = v => (v == null ? '—' : String(v).slice(0, 10));
// AE-EUR mit ae_ab_monat-Gate (wie im Dashboard); Standort über closer_id (NK).
const gatedAe = "CASE WHEN c.ae_ab_monat IS NULL OR to_char(d.gewonnen_datum,'YYYY-MM') >= c.ae_ab_monat THEN COALESCE(d.ae_wert,0) ELSE 0 END";

(async () => {
  const client = new Client({ connectionString: url, ssl: url.includes('localhost') ? false : { rejectUnauthorized: false } });
  await client.connect();
  try {
    // ── (a) Audit-Historie der beiden Deals ─────────────────────────────────
    line('═');
    console.log('(a) AUDIT-HISTORIE — d14a.rchitekten ZT GmbH + Betonwerk Jungwirth GmbH');
    line('═');
    const deals = (await client.query(
      `SELECT id, kunde, status, ae_wert, angebotswert, gewonnen_datum, gewonnen_monat
         FROM deals_nk WHERE kunde ILIKE '%rchitekten%' OR kunde ILIKE '%Betonwerk Jungwirth%' ORDER BY id`)).rows;
    if (!deals.length) console.log('  Keine passenden Deals gefunden (Namen ggf. anpassen).');
    for (const dl of deals) {
      console.log(`\n▶ Deal #${dl.id} "${dl.kunde}"  | JETZT: status=${dl.status}, ae_wert=${eur(dl.ae_wert)}, angebotswert=${eur(dl.angebotswert)}, gewonnen_datum=${ymd(dl.gewonnen_datum)}, gewonnen_monat=${dl.gewonnen_monat ?? 'NULL'}`);
      const logs = (await client.query(
        `SELECT created_at, user_name, action, old_data, new_data FROM audit_logs
          WHERE entity_type='deal_nk' AND entity_id=$1 ORDER BY created_at`, [dl.id])).rows;
      console.log(`  ${logs.length} Schreibvorgang/-vorgänge:`);
      logs.forEach((lg, i) => {
        const o = parse(lg.old_data), n = parse(lg.new_data);
        const chg = [];
        for (const f of ['status', 'ae_wert', 'angebotswert', 'gewonnen_datum', 'gewonnen_monat']) {
          const ov = f.includes('datum') ? ymd(o[f]) : (o[f] ?? '—');
          const nv = f.includes('datum') ? ymd(n[f]) : (n[f] ?? '—');
          if (i === 0 || String(ov) !== String(nv)) chg.push(`${f}: ${ov}→${nv}`);
        }
        console.log(`   ${i + 1}. ${ymd(lg.created_at)} ${String(lg.created_at).slice(11, 19)} · ${lg.user_name || '?'} · ${lg.action}`);
        console.log(`      ${chg.join('  |  ') || '(keine der Kernfelder geändert)'}`);
        if (i > 0 && n.gewonnen_datum && (n.gewonnen_monat == null || n.gewonnen_monat === '')) {
          console.log(`      ⚠️  HIER wurde gewonnen_monat auf NULL gesetzt, obwohl gewonnen_datum gesetzt ist.`);
        }
      });
    }

    // ── Punkt 4: Bestand NULL-monat ─────────────────────────────────────────
    line('═'); console.log('PUNKT 4 — Bestand: status=Gewonnen, gewonnen_datum gesetzt, gewonnen_monat NULL'); line('═');
    const monate = new Set();
    for (const [b, fk] of [['nk', 'closer_id'], ['bk', 'kam_id'], ['vl', 'kam_id']]) {
      const rows = (await client.query(
        `SELECT d.id, d.kunde, d.gewonnen_datum, d.monat AS angebotsmonat, d.ae_wert,
                to_char(d.gewonnen_datum,'YYYY-MM') soll, e.standort
           FROM deals_${b} d LEFT JOIN employees e ON e.id=d.${fk}
          WHERE d.status='Gewonnen' AND d.gewonnen_datum IS NOT NULL AND (d.gewonnen_monat IS NULL OR d.gewonnen_monat='')
          ORDER BY d.gewonnen_datum`)).rows;
      console.log(`\ndeals_${b}: ${rows.length} Fall/Fälle`);
      rows.forEach(r => { monate.add(r.soll); console.log(`  #${r.id} ${r.kunde} | gewonnen ${ymd(r.gewonnen_datum)} (soll ${r.soll}) | Standort ${r.standort || '?'} | ae_wert ${eur(r.ae_wert)}`); });
    }
    console.log('\n  Hinweis: Migration 088 heilt deals_nk, 089 heilt deals_bk/deals_vl (beide idempotent).');

    // ── Punkt 2: ae_gesamt_monthly je betroffenem Monat + August ────────────
    line('═'); console.log('PUNKT 2 — ae_gesamt_monthly (live vs. frozen)'); line('═');
    for (const m of [...new Set([...monate, '2026-08'])].sort()) {
      const ag = (await client.query(`SELECT nk_at_ae, nk_at_anz, gesamt FROM ae_gesamt_monthly WHERE monat=$1`, [m])).rows[0];
      if (!ag || Number(ag.gesamt) <= 0) console.log(`  ${m}: KEINE Zeile → live gerechnet (Heilung von gewonnen_monat reicht).`);
      else console.log(`  ${m}: FROZEN — nk_at_ae=${eur(ag.nk_at_ae)}, nk_at_anz=${ag.nk_at_anz}, gesamt=${eur(ag.gesamt)} (ggf. Nachbuchen nötig).`);
    }

    // ── (e) Abgleich deals vs. ae_gesamt_monthly (nur frozen Monate) ─────────
    line('═'); console.log('(e) ABGLEICH — gewonnene NK-AE laut deals vs. ae_gesamt_monthly (fehlende AE)'); line('═');
    const frozen = (await client.query(`SELECT monat, nk_bonn_ae, nk_bs_ae, nk_at_ae FROM ae_gesamt_monthly WHERE gesamt > 0 ORDER BY monat`)).rows;
    console.log('  (nur Monate mit Snapshot; Abweichung = Snapshot minus Live-Summe der gewonnenen Deals)');
    for (const ag of frozen) {
      const m = ag.monat;
      const live = (await client.query(
        `SELECT e.standort, SUM(${gatedAe}) ae FROM deals_nk d
           JOIN employees e ON e.id=d.closer_id LEFT JOIN companies c ON c.id=d.company_id
          WHERE d.status='Gewonnen' AND d.gewonnen_monat=$1 GROUP BY e.standort`, [m])).rows;
      const liveBy = Object.fromEntries(live.map(r => [r.standort, Number(r.ae) || 0]));
      const rows = [['Bonn', ag.nk_bonn_ae], ['Braunschweig', ag.nk_bs_ae], ['Österreich', ag.nk_at_ae]];
      const diffs = rows.map(([s, snap]) => ({ s, snap: Number(snap) || 0, live: liveBy[s] || 0 }))
        .filter(x => Math.abs(x.snap - x.live) > 1);
      if (diffs.length) {
        console.log(`  ${m}:`);
        diffs.forEach(x => console.log(`     ${x.s}: Snapshot ${eur(x.snap)} vs Live ${eur(x.live)}  → Δ ${eur(x.snap - x.live)}`));
      }
    }
    console.log('  (keine Zeilen oben = alle Snapshots stimmen mit den Live-Deals überein)');
    line('═'); console.log('Read-only abgeschlossen. Keine Daten verändert.');
  } finally { await client.end(); }
})().catch(e => { console.error(e); process.exit(1); });
