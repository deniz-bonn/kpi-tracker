// Provisions-Backfill für den laufenden Zeitraum (einmalig bei Go-Live). Idempotent (idem_key).
// Bucht Basis-Positionen für alle bereits gewonnenen In-Scope-Deals (gewonnen_datum >= Go-Live)
// und materialisiert fällige Monatsend-Nachträge. Schreibt NUR in provision_*.
//
//   Dry-Run (Default, read-only):  node backend/src/db/backfill_provisionen.js
//   Ausführen:                     node backend/src/db/backfill_provisionen.js --commit
//   Anderer Stichtag (Test):       node backend/src/db/backfill_provisionen.js --stichtag=2026-08-15
//
// WICHTIG: NIE via require() laden (führt bei --commit aus). Nur direkt starten. Syntaxcheck: node --check.
const { projektionLaufend, backfillLaufend } = require('../utils/provisionen');

const fmtEur = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';

async function main() {
  const commit = process.argv.includes('--commit');
  const stichtag = (process.argv.find(a => /^--stichtag=/.test(a)) || '').split('=')[1] || undefined;

  if (!commit) {
    const p = await projektionLaufend(stichtag);
    console.log(`DRY-RUN Provisions-Backfill  (Go-Live ${p.goLive}${stichtag ? `, Stichtag ${stichtag}` : ''})`);
    console.log(`In-Scope gewonnene Deals: ${p.inScopeDeals}  →  ${p.positionen} Positionen,  Basis gesamt ${fmtEur(p.totalBase)}`);
    for (const [rolle, v] of Object.entries(p.perRolle)) console.log(`  ${rolle.padEnd(15)} ${String(v.n).padStart(4)}×   ${fmtEur(v.summe)}`);
    console.log('\n(Nachträge/Staffeln folgen beim Monatsende bzw. beim --commit-Lauf.)');
    console.log('Zum Ausführen erneut mit  --commit  starten.');
    return;
  }

  const r = await backfillLaufend(stichtag);
  console.log(`Backfill AUSGEFÜHRT  (Go-Live ${r.goLive}${stichtag ? `, Stichtag ${stichtag}` : ''}).  In-Scope Deals: ${r.inScopeDeals}`);
  console.log('Kontoauszug nach Backfill:');
  for (const b of r.buchungen) console.log(`  ${String(b.typ).padEnd(16)} ${String(b.n).padStart(4)}×   ${fmtEur(b.summe)}`);
}

if (require.main === module) {
  main().then(() => process.exit(0)).catch(e => { console.error('Backfill-Fehler:', e.message, e.stack); process.exit(1); });
}
