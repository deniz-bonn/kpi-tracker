#!/usr/bin/env node
// Wochenanalyse von der Kommandozeile (lokal oder per `railway run`). Beispiele:
//   npm run analyse -- codierung --von 2026-10-31 --bis 2026-11-06
//   npm run analyse -- einsammeln --warten 60         (bis zu 60 Min. auf offene Batches warten)
//   npm run analyse -- verbleib --stichtag 2026-11-06
//   npm run analyse -- report --stichtag 2026-11-06 --modus test     (test | live | ohne_versand)
//   npm run analyse -- report --von 2026-10-31 --bis 2026-11-06 --modus ohne_versand
//   npm run analyse -- oktober-basis <codierung_calls.xlsx | oktober-basis.json>
//   npm run analyse -- status
require('dotenv').config();
const job = require('./job');
const db = require('../db');

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : undefined; };

(async () => {
  let r;
  switch (cmd) {
    case 'codierung': r = await job.codierlauf({ von: opt('von'), bis: opt('bis'), neuCodieren: args.includes('--neu-codieren'), ausgeloestVon: 'cli' }); break;
    case 'einsammeln': {
      const C = require('./codierung');
      const bis = Date.now() + Number(opt('warten') || 0) * 60000;
      for (;;) {
        r = await C.sammleEin({ log: console.log });
        if (!r.offen || Date.now() > bis) break;
        console.log(`  ${r.offen} Batch(es) noch in Arbeit — warte 60 s`);
        await new Promise(res => setTimeout(res, 60000));
      }
      break;
    }
    case 'verbleib': r = await job.verbleiblauf({ stichtag: opt('stichtag'), ausgeloestVon: 'cli' }); break;
    case 'report': r = await job.reportlauf({ stichtag: opt('stichtag'), von: opt('von'), bis: opt('bis'), modus: opt('modus'), ausgeloestVon: 'cli' }); break;
    case 'oktober-basis': {
      const datei = args[1];
      if (!datei) throw new Error('Datei angeben: codierung_calls.xlsx oder oktober-basis.json');
      r = await require('./oktoberBasis').importiere(datei);
      break;
    }
    case 'status':
      r = { laeufe: await db.all(`SELECT id, typ, status, zeitraum_von, zeitraum_bis, gestartet_am, kosten_usd FROM analyse_runs ORDER BY gestartet_am DESC LIMIT 10`),
        auftraege: await db.all(`SELECT quelle, status, COUNT(*) n FROM codier_auftraege GROUP BY quelle, status`) };
      break;
    default:
      console.log('Befehle: codierung | einsammeln | verbleib | report | oktober-basis | status (siehe Kopf von src/analyse/cli.js)');
      process.exit(1);
  }
  console.log(JSON.stringify(r, (k, v) => (k === 'zeilen' || k === 'codierungenWoche' ? undefined : v), 1).slice(0, 4000));
  process.exit(r && r.ok === false ? 1 : 0);
})().catch(e => { console.error('FEHLER:', e.message); process.exit(1); });
