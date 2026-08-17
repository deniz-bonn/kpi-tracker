// Provisions-Engine (NK). Append-only Kontoauszug, drei Abrechnungskreise:
//   bonn         -> Zyklus 21.-20., klassische %-Saetze + Closer-Staffel 200k + Team-Staffel
//   braunschweig -> Zyklus Kalendermonat, Opener 125 EUR fix je Sales Call, Setter 2,5%,
//                   O+S-Pauschale 3,5%, Closer 3,5%/200k->4% (wie Bonn). KEIN Team.
//   oesterreich  -> Zyklus Kalendermonat, Opener/Setter Staffeltabelle, Closer 7% (Auto-VL) / 5%.
// Der Kreis JEDES Beteiligten (nach dessen Standort) bestimmt Satz UND Zeitraum -> ein Deal kann
// Positionen in mehrere Kreise streuen. Liest deals_nk/employees, schreibt NUR in provision_*.
// Der Aufruf im NK-Write-Hook laeuft in try/catch: ein Fehler hier darf das Deal-Speichern nie brechen.
const db = require('../db');
const { toYmd } = require('./gewonnen');

const pg = () => db.dialect === 'postgres';
const round2 = n => Math.round((Number(n) || 0) * 100) / 100;
const fmtEur = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
const fmtPct = n => String(n).replace('.', ',') + ' %';
// Kalendermonat aus gewonnen_datum je Dialekt (Postgres DATE -> to_char, SQLite TEXT -> substr).
const ymExpr = col => pg() ? `to_char(${col}, 'YYYY-MM')` : `substr(${col}, 1, 7)`;
// YYYY-MM-DD als TEXT (deals_nk-Datumsspalten sind DATE in PG) -> sichere Textvergleiche statt DATE>=TEXT.
const ymdExpr = col => pg() ? `to_char(${col}, 'YYYY-MM-DD')` : col;

// standort (employees) -> kreis-Schluessel. Schweiz/null sind NICHT im Modul.
function kreisFor(standort) {
  if (standort === 'Bonn') return 'bonn';
  if (standort === 'Braunschweig') return 'braunschweig';
  if (standort === 'Österreich') return 'oesterreich';
  return null;
}
const KALENDERMONAT_KREISE = new Set(['braunschweig', 'oesterreich']);
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

// ── Perioden ──────────────────────────────────────────────────────────────────
// Bonn: 21.-20. (der 20. voll drin). Braunschweig/Oesterreich: voller Kalendermonat.
function periodFor(ymd, kreis = 'bonn') {
  const [y, m, d] = ymd.split('-').map(Number);
  const pad = n => String(n).padStart(2, '0');
  if (kreis === 'bonn') {
    if (d <= 20) {
      const pm = m === 1 ? 12 : m - 1, py = m === 1 ? y - 1 : y;
      return { von: `${py}-${pad(pm)}-21`, bis: `${y}-${pad(m)}-20` };
    }
    const nm = m === 12 ? 1 : m + 1, ny = m === 12 ? y + 1 : y;
    return { von: `${y}-${pad(m)}-21`, bis: `${ny}-${pad(nm)}-20` };
  }
  const last = new Date(y, m, 0).getDate();                 // letzter Tag des Kalendermonats
  return { von: `${y}-${pad(m)}-01`, bis: `${y}-${pad(m)}-${pad(last)}` };
}
const labelFor = (von, bis) => `${von.slice(8, 10)}.${von.slice(5, 7)}.–${bis.slice(8, 10)}.${bis.slice(5, 7)}.${bis.slice(0, 4)}`;
const labelKM = von => `${MONATE[Number(von.slice(5, 7)) - 1]} ${von.slice(0, 4)}`;
const labelForKreis = (kreis, von, bis) => kreis === 'bonn' ? labelFor(von, bis) : labelKM(von);
const kalendermonatFor = ymd => ymd.slice(0, 7);
const heute = () => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
function naechsterTag(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1)), p = n => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`;
}

// ── DB-Helfer ──
const q1 = i => pg() ? `$${i}` : '?';
async function empStandort(id) {
  if (!id) return null;
  const e = await db.get(`SELECT standort FROM employees WHERE id=${q1(1)}`, [id]);
  return e ? e.standort : null;
}
async function empKreis(id) { return kreisFor(await empStandort(id)); }

// Zeitraeume sind (kreis, von)-eindeutig: BS-Juli und AT-Juli teilen sich von='2026-07-01'.
async function getOrCreateZeitraum(von, bis, kreis = 'bonn') {
  let z = await db.get(`SELECT * FROM provision_zeitraeume WHERE kreis=${q1(1)} AND von=${q1(2)}`, [kreis, von]);
  if (z) return z;
  const label = labelForKreis(kreis, von, bis);
  if (pg()) {
    await db.run(`INSERT INTO provision_zeitraeume (von,bis,label,status,kreis) SELECT $1,$2,$3,'offen',$4 WHERE NOT EXISTS (SELECT 1 FROM provision_zeitraeume WHERE kreis=$4 AND von=$1)`, [von, bis, label, kreis]);
  } else {
    db.run(`INSERT INTO provision_zeitraeume (von,bis,label,status,kreis) SELECT ?,?,?,'offen',? WHERE NOT EXISTS (SELECT 1 FROM provision_zeitraeume WHERE kreis=? AND von=?)`, [von, bis, label, kreis, kreis, von]);
  }
  return await db.get(`SELECT * FROM provision_zeitraeume WHERE kreis=${q1(1)} AND von=${q1(2)}`, [kreis, von]);
}
const offenerZeitraumAm = (stichtag, kreis = 'bonn') => { const { von, bis } = periodFor(stichtag, kreis); return getOrCreateZeitraum(von, bis, kreis); };

async function configFor(zeitraumVon, kreis = 'bonn') {
  return await db.get(`SELECT * FROM provision_config WHERE kreis=${q1(1)} AND gueltig_ab <= ${q1(2)} ORDER BY gueltig_ab DESC LIMIT 1`, [kreis, zeitraumVon]);
}
// Go-Live-Untergrenze je Kreis: fruehestes Config-Datum dieses Kreises. Bonn=21.07., BS/AT=01.07.
async function goLiveDatum(kreis = 'bonn') {
  return (await db.get(`SELECT MIN(gueltig_ab) g FROM provision_config WHERE kreis=${q1(1)}`, [kreis]))?.g || '9999-12-31';
}
// Staffelsatz (AT): hoechste Stufe mit ab_betrag <= Monats-AE. 0, wenn unter der ersten Stufe.
async function staffelSatz(kreis, rolle, monatsAe, gueltigBis) {
  const rows = await db.all(`SELECT ab_betrag, satz FROM provision_staffel WHERE kreis=${q1(1)} AND rolle=${q1(2)} AND gueltig_ab <= ${q1(3)} ORDER BY ab_betrag ASC`, [kreis, rolle, gueltigBis || '9999-12-31']);
  let s = 0;
  for (const r of rows) if (monatsAe >= Number(r.ab_betrag)) s = Number(r.satz);
  return s;
}
async function insertBuchung(b) {
  const cols = 'zeitraum_id,employee_id,deal_id,rolle,typ,satz,bemessungsgrundlage,betrag,kalendermonat,gewonnen_datum,beschreibung,idem_key';
  const vals = [b.zeitraum_id, b.employee_id, b.deal_id ?? null, b.rolle, b.typ, b.satz, round2(b.bemessungsgrundlage),
    round2(b.betrag), b.kalendermonat, b.gewonnen_datum ?? null, b.beschreibung ?? null, b.idem_key];
  if (pg()) {
    await db.run(`INSERT INTO provision_buchungen (${cols}) VALUES (${vals.map((_, i) => `$${i + 1}`).join(',')}) ON CONFLICT (idem_key) DO NOTHING`, vals);
  } else {
    db.run(`INSERT OR IGNORE INTO provision_buchungen (${cols}) VALUES (${vals.map(() => '?').join(',')})`, vals);
  }
}
// Status der Basis-Periode eines Deals im gegebenen Kreis ('offen'|'abgeschlossen').
async function periodeStatus(gd, kreis) {
  const row = await db.get(`SELECT status FROM provision_zeitraeume WHERE kreis=${q1(1)} AND von=${q1(2)}`, [kreis, periodFor(gd, kreis).von]);
  return row?.status || 'offen';
}

// ── Basis-Positionen eines Deals (nur %/flach; NICHT: BS-Opener-125-Fix, NICHT: AT-Staffeln) ──
// Jede Position traegt ihren Kreis (Standort des Beteiligten) -> Routing in die richtige Periode.
async function positionenFor(deal, gd) {
  const oId = deal.opener_id, sId = deal.setter_id, cId = deal.closer_id;
  const [oK, sK, cK] = [await empKreis(oId), await empKreis(sId), await empKreis(cId)];
  const out = [];
  const cache = {};
  const cfgK = async k => { if (!k) return null; if (!(k in cache)) cache[k] = await configFor(periodFor(gd, k).von, k); return cache[k]; };

  if (oId && sId && oId === sId && oK) {                     // Opener = Setter (dieselbe Person)
    const cfg = await cfgK(oK);
    if (cfg && oK !== 'oesterreich')                          // AT: nur Opener-Staffel (separat) -> hier keine Basis
      out.push({ emp: oId, rolle: 'opener_setter', kreis: oK, satz: +cfg.opener_setter_pauschal, besch: `Opener+Setter (Pauschale ${fmtPct(cfg.opener_setter_pauschal)})` });
    // AT O==S: keine Basis-Position, keine Setter-Position -> nur Opener-Staffel via nachStaffel.
  } else {
    if (oId && oK) {                                          // Opener
      const cfg = await cfgK(oK);
      // AT-Opener = Staffel (separat); BS-Opener = 125-Fix (separat) -> hier nur Bonn-%.
      if (cfg && oK === 'bonn') out.push({ emp: oId, rolle: 'opener', kreis: oK, satz: +cfg.opener_satz, besch: `Opener (${fmtPct(cfg.opener_satz)})` });
    }
    if (sId && sK) {                                          // Setter
      const cfg = await cfgK(sK);
      // AT-Setter = Staffel (separat); Bonn/BS-Setter = %.
      if (cfg && sK !== 'oesterreich') out.push({ emp: sId, rolle: 'setter', kreis: sK, satz: +cfg.setter_satz, besch: `Setter (${fmtPct(cfg.setter_satz)})` });
    }
  }
  if (cId && cK) {                                            // Closer
    const cfg = await cfgK(cK);
    if (cfg) {
      if (cK === 'oesterreich') {                             // flach nach Auto-VL, NICHT raten
        const vl = String(deal.automatische_verlaengerung || '').trim();
        if (vl === 'Ja' || vl === 'Nein') {
          const satz = vl === 'Ja' ? +cfg.closer_hoch : +cfg.closer_basis;
          out.push({ emp: cId, rolle: 'closer', kreis: cK, satz, besch: `Closer AT ${vl === 'Ja' ? 'm. Auto-VL' : 'o. Auto-VL'} (${fmtPct(satz)})` });
        }
        // vl leer/unbekannt -> keine Buchung (siehe atCloserOhneVl fuer Report)
      } else {
        out.push({ emp: cId, rolle: 'closer', kreis: cK, satz: +cfg.closer_basis, besch: `Closer Basis (${fmtPct(cfg.closer_basis)})` });
      }
    }
  }
  if (cId && cK === 'bonn') {                                 // Team nur fuer Bonn-Closer
    const cfg = await cfgK('bonn');
    if (cfg && cfg.team_empfaenger_id) out.push({ emp: +cfg.team_empfaenger_id, rolle: 'team', kreis: 'bonn', satz: +cfg.team_s1, besch: `Team Bonn (${fmtPct(cfg.team_s1)})`, isTeam: true });
  }
  return out;
}

// ── Haupt-Hook: bucht Win / Storno / Korrektur + BS-Opener-Fix + Staffeln ──
// deal = neuer Zustand, prev = alter (null beim Anlegen/Backfill).
async function provisionSync(deal, prev, stichtag) {
  const today = stichtag || heute();

  // (A) BS-Opener-Fix (125 EUR je Sales Call) — unabhaengig vom Gewinn-Status (auch Verloren/kein-Angebot).
  await syncBsOpenerFix(deal, today);

  const wasWon = prev?.status === 'Gewonnen';
  const isWon = deal?.status === 'Gewonnen';

  if (!wasWon && isWon) {                                     // WIN -> Basis-Positionen (je Kreis)
    const gd = toYmd(deal.gewonnen_datum);
    if (gd) {
      const ae = Number(deal.ae_wert) || 0, km = kalendermonatFor(gd);
      const zCache = {};
      for (const p of await positionenFor(deal, gd)) {
        if (!(p.kreis in zCache)) { const { von, bis } = periodFor(gd, p.kreis); zCache[p.kreis] = await getOrCreateZeitraum(von, bis, p.kreis); }
        await insertBuchung({ zeitraum_id: zCache[p.kreis].id, employee_id: p.emp, deal_id: deal.id, rolle: p.rolle,
          typ: p.isTeam ? 'team_provision' : 'deal_gewonnen', satz: p.satz, bemessungsgrundlage: ae,
          betrag: ae * p.satz / 100, kalendermonat: km, gewonnen_datum: gd,
          beschreibung: `${p.besch} · ${deal.kunde || ''}`.trim(),
          idem_key: `${p.isTeam ? 'team' : 'dg'}:${deal.id}:${p.rolle}:${p.emp}` });
      }
    }
  } else if (wasWon && !isWon) {                              // UNWIN/Loeschung -> Storno (Basis+Staffel)
    await storniereDeal(deal?.id ?? prev.id, prev, today);
  } else if (wasWon && isWon) {                               // Neu-Bewertung (ae ODER Rollen/Personen)
    const gd = toYmd(deal.gewonnen_datum) || toYmd(prev.gewonnen_datum);
    if (gd) {
      const km = kalendermonatFor(gd), ae = Number(deal.ae_wert) || 0;
      const soll = new Map();                                 // Soll je (Empfaenger,Rolle) laut aktuellem Zustand
      for (const p of await positionenFor(deal, gd)) soll.set(`${p.emp}|${p.rolle}`, { satz: p.satz, besch: p.besch, kreis: p.kreis, betrag: round2(ae * p.satz / 100) });
      const ist = new Map(), istKreis = new Map();            // Ist = bereits gebuchte Basis+Korrekturen
      for (const r of await db.all(`SELECT b.employee_id, b.rolle, b.zeitraum_id, z.kreis, COALESCE(SUM(b.betrag),0) b FROM provision_buchungen b JOIN provision_zeitraeume z ON z.id=b.zeitraum_id WHERE b.deal_id=${q1(1)} AND b.typ IN ('deal_gewonnen','team_provision','korrektur') GROUP BY b.employee_id, b.rolle, b.zeitraum_id, z.kreis`, [deal.id])) {
        const k = `${r.employee_id}|${r.rolle}`;
        ist.set(k, round2((ist.get(k) || 0) + Number(r.b))); istKreis.set(k, r.kreis);
      }
      for (const k of new Set([...soll.keys(), ...ist.keys()])) {
        const [emp, rolle] = k.split('|');
        const s = soll.get(k), sollB = s ? s.betrag : 0, istB = ist.get(k) || 0, diff = round2(sollB - istB);
        if (diff === 0) continue;
        const kreis = s ? s.kreis : (istKreis.get(k) || 'bonn');
        const target = await offenerZeitraumAm(today, kreis);
        await insertBuchung({ zeitraum_id: target.id, employee_id: +emp, deal_id: deal.id, rolle,
          typ: 'korrektur', satz: s ? s.satz : 0, bemessungsgrundlage: ae, betrag: diff, kalendermonat: km, gewonnen_datum: gd,
          beschreibung: s ? `Korrektur → Soll ${fmtEur(sollB)} (war ${fmtEur(istB)}) · ${s.besch}` : `Korrektur → Rolle entfällt, Rückbuchung ${fmtEur(-diff)} · ${deal.kunde || ''}`.trim(),
          idem_key: null });
      }
    }
  }

  await nachStaffel(deal, prev, today);                       // Live-Staffelung (Bonn closer/team + AT opener/setter)
}

// BS-Opener-Fixbetrag: 125 EUR je erfasstem Sales Call (Status Gewonnen ODER Verloren) mit BS-Opener,
// sofern Opener != Setter (bei O==S greift die 3,5%-Pauschale, kein Fix). Periode nach Sales-Call-Datum.
// State-based + idempotent: sorgt fuer genau eine 125er-Position des aktuellen BS-Openers, storniert
// Fixe fremder/ehemaliger Opener und (bei Loeschung/Statuswechsel) den Fix ganz.
async function syncBsOpenerFix(deal, today) {
  const dealId = deal?.id; if (!dealId) return;
  const dd = toYmd(deal.datum) || toYmd(deal.gewonnen_datum);
  const statusOk = deal.status === 'Gewonnen' || deal.status === 'Verloren';
  const oId = deal.opener_id, oIsBs = (await empKreis(oId)) === 'braunschweig';
  const cfgBs = dd ? await configFor(periodFor(dd, 'braunschweig').von, 'braunschweig') : null;
  const inScope = !!cfgBs && dd >= await goLiveDatum('braunschweig');
  const curOpener = (statusOk && oIsBs && oId !== deal.setter_id && inScope) ? oId : null;
  // Ist je Empfaenger (Fix minus Fix-Storno).
  const rows = await db.all(`SELECT employee_id, COALESCE(SUM(betrag),0) net FROM provision_buchungen WHERE deal_id=${q1(1)} AND rolle='opener' AND typ IN ('opener_fix','opener_fix_storno') GROUP BY employee_id`, [dealId]);
  const net = new Map(rows.map(r => [r.employee_id, round2(Number(r.net))]));
  const fix = cfgBs ? Number(cfgBs.opener_fix) || 125 : 125;
  const km = dd ? kalendermonatFor(dd) : today.slice(0, 7);
  // Fremde/ehemalige Fixe stornieren.
  for (const [emp, n] of net) {
    if (emp === curOpener || n <= 0) continue;
    const z = await offenerZeitraumAm(today, 'braunschweig');
    await insertBuchung({ zeitraum_id: z.id, employee_id: emp, deal_id: dealId, rolle: 'opener', typ: 'opener_fix_storno',
      satz: 0, bemessungsgrundlage: 0, betrag: -n, kalendermonat: km, gewonnen_datum: null,
      beschreibung: `Storno Opener-Fixbetrag (Opener geändert/Deal gelöscht) · ${deal.kunde || ''}`.trim(),
      idem_key: `bsopenerfix-storno:${dealId}:${emp}` });
  }
  // Aktuellen BS-Opener sicherstellen (genau ein 125er).
  if (curOpener && !((net.get(curOpener) || 0) > 0)) {
    const { von, bis } = periodFor(dd, 'braunschweig');
    const z = await getOrCreateZeitraum(von, bis, 'braunschweig');
    await insertBuchung({ zeitraum_id: z.id, employee_id: curOpener, deal_id: dealId, rolle: 'opener', typ: 'opener_fix',
      satz: 0, bemessungsgrundlage: 0, betrag: fix, kalendermonat: km, gewonnen_datum: null,
      beschreibung: `Opener-Fixbetrag ${fmtEur(fix)} (Sales Call ${dd}) · ${deal.kunde || ''}`.trim(),
      idem_key: `bsopenerfix:${dealId}:${curOpener}` });
  }
}

// Storniert einen Deal: reversed die Netto-Summe je (Empfaenger,Rolle) in den offenen Zeitraum DES KREISES.
// Opener-Fix wird NICHT hier gehandhabt (das macht syncBsOpenerFix state-based).
async function storniereDeal(dealId, prev, today) {
  const orig = await db.all(
    `SELECT b.employee_id, b.rolle, z.kreis, COALESCE(SUM(b.betrag),0) b FROM provision_buchungen b JOIN provision_zeitraeume z ON z.id=b.zeitraum_id
      WHERE b.deal_id=${q1(1)} AND b.typ IN ('deal_gewonnen','team_provision','korrektur','staffel_upgrade','staffel_nachtrag','team_upgrade','team_nachtrag','at_opener_staffel','at_opener_nachtrag','at_setter_staffel','at_setter_nachtrag')
      GROUP BY b.employee_id, b.rolle, z.kreis`, [dealId]);
  for (const r of orig) {
    const sum = round2(Number(r.b)); if (sum === 0) continue;
    const z = await offenerZeitraumAm(today, r.kreis);
    await insertBuchung({ zeitraum_id: z.id, employee_id: r.employee_id, deal_id: dealId, rolle: r.rolle,
      typ: 'storno', satz: 0, bemessungsgrundlage: 0, betrag: -sum, kalendermonat: today.slice(0, 7),
      gewonnen_datum: null, beschreibung: `Storno (Deal nicht mehr gewonnen) · ${prev?.kunde || ''}`.trim(),
      idem_key: `storno:${dealId}:${r.rolle}:${r.employee_id}` });
  }
}

// ── Staffel-BASIS = voller Kalendermonat aus deals_nk (bewusst ohne Go-Live-Floor, ohne provision_*-Abh.) ──
async function closerMonatsAe(closerId, km) {
  const r = await db.get(`SELECT COALESCE(SUM(ae_wert),0) ae FROM deals_nk WHERE closer_id=${q1(1)} AND status='Gewonnen' AND ${ymExpr('gewonnen_datum')}=${q1(2)}`, [closerId, km]);
  return Number(r?.ae) || 0;
}
async function bonnMonatsAe(km) {
  const r = await db.get(`SELECT COALESCE(SUM(d.ae_wert),0) ae FROM deals_nk d JOIN employees e ON e.id=d.closer_id WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)} AND e.standort='Bonn'`, [km]);
  return Number(r?.ae) || 0;
}
// Altes Monatsend-Aggregat (deal_id NULL) einmalig append-only zuruecknehmen (Bonn-Historie). Idempotent.
async function storniereAltAggregat(empId, rolle, km, typen, zielId) {
  const liste = typen.map(t => `'${t}'`).join(',');
  const row = await db.get(
    `SELECT COALESCE(SUM(betrag),0) b FROM provision_buchungen WHERE deal_id IS NULL AND employee_id=${q1(1)} AND rolle=${q1(2)} AND kalendermonat=${q1(3)} AND typ IN (${liste})`,
    [empId, rolle, km]);
  const b = round2(Number(row?.b) || 0);
  if (b === 0) return;
  await insertBuchung({ zeitraum_id: zielId, employee_id: empId, deal_id: null, rolle, typ: typen[1],
    satz: 0, bemessungsgrundlage: 0, betrag: -b, kalendermonat: km, gewonnen_datum: null,
    beschreibung: `Umstellung Per-Deal-Staffel ${km}: Alt-Aggregat ${fmtEur(b)} zurückgenommen (Delta wird je Deal neu gebucht)`,
    idem_key: null });
}

// LIVE-Closer-Staffel (200k) fuer Bonn/BS. SATZ aus vollem Kalendermonat; Delta je Modul-Deal in den Kreis-Zeitraum.
async function aktualisiereCloserStaffel(closerId, km, stichtag) {
  if (!closerId) return;
  const kreis = await empKreis(closerId);
  if (kreis !== 'bonn' && kreis !== 'braunschweig') return;   // AT-Closer: keine 200k-Staffel (flach 5/7%)
  const cfg = await configFor(km + '-28', kreis); if (!cfg) return;
  const goLive = await goLiveDatum(kreis), today = stichtag || heute();
  const schwelle = Number(cfg.closer_schwelle);
  const monatAeVoll = await closerMonatsAe(closerId, km);
  const above = monatAeVoll >= schwelle;
  const extra = above ? (Number(cfg.closer_hoch) - Number(cfg.closer_basis)) : 0;
  const deals = await db.all(
    `SELECT id, ae_wert, gewonnen_datum, kunde FROM deals_nk
      WHERE closer_id=${q1(1)} AND status='Gewonnen' AND ${ymExpr('gewonnen_datum')}=${q1(2)} AND ${ymdExpr('gewonnen_datum')} >= ${q1(3)}`,
    [closerId, km, goLive]);
  for (const d of deals) {
    const gd = toYmd(d.gewonnen_datum); if (!gd) continue;
    const ae = Number(d.ae_wert) || 0, want = round2(ae * extra / 100);
    const have = round2(Number((await db.get(
      `SELECT COALESCE(SUM(betrag),0) b FROM provision_buchungen WHERE deal_id=${q1(1)} AND employee_id=${q1(2)} AND rolle='closer' AND typ IN ('staffel_upgrade','staffel_nachtrag')`,
      [d.id, closerId])).b));
    const diff = round2(want - have); if (diff === 0) continue;
    const offen = (await periodeStatus(gd, kreis)) === 'offen';
    const ziel = offen ? await getOrCreateZeitraum(...Object.values(periodFor(gd, kreis)), kreis) : await offenerZeitraumAm(today, kreis);
    await insertBuchung({ zeitraum_id: ziel.id, employee_id: closerId, deal_id: d.id, rolle: 'closer',
      typ: offen ? 'staffel_upgrade' : 'staffel_nachtrag', satz: extra, bemessungsgrundlage: ae, betrag: diff, kalendermonat: km, gewonnen_datum: gd,
      beschreibung: above
        ? `Staffel-Upgrade ${km}: Closer-Monats-AE ${fmtEur(monatAeVoll)} ≥ ${fmtEur(schwelle)} → +${fmtPct(extra)} · ${d.kunde || ''}`.trim()
        : `Staffel-Rücknahme ${km}: Closer-Monats-AE ${fmtEur(monatAeVoll)} unter ${fmtEur(schwelle)} · ${d.kunde || ''}`.trim(),
      idem_key: null });
  }
  await storniereAltAggregat(closerId, 'closer', km, ['staffel_upgrade', 'staffel_nachtrag'], (await offenerZeitraumAm(today, kreis)).id);
}

// LIVE-Team-Staffel (nur Bonn). SATZ aus vollem Bonn-Kalendermonat; Delta je Bonn-Modul-Deal.
async function aktualisiereTeamStaffel(km, stichtag) {
  const cfg = await configFor(km + '-28', 'bonn'); if (!cfg || !cfg.team_empfaenger_id) return;
  const empf = +cfg.team_empfaenger_id, goLive = await goLiveDatum('bonn'), today = stichtag || heute();
  const bonnAeVoll = await bonnMonatsAe(km);
  const finalSatz = bonnAeVoll <= Number(cfg.team_s1_bis) ? Number(cfg.team_s1)
    : bonnAeVoll <= Number(cfg.team_s2_bis) ? Number(cfg.team_s2) : Number(cfg.team_s3);
  const extra = finalSatz - Number(cfg.team_s1);
  const deals = await db.all(
    `SELECT d.id, d.ae_wert, d.gewonnen_datum, d.kunde FROM deals_nk d JOIN employees e ON e.id=d.closer_id
      WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)} AND ${ymdExpr('d.gewonnen_datum')} >= ${q1(2)} AND e.standort='Bonn'`,
    [km, goLive]);
  for (const d of deals) {
    const gd = toYmd(d.gewonnen_datum); if (!gd) continue;
    const ae = Number(d.ae_wert) || 0, want = round2(ae * extra / 100);
    const have = round2(Number((await db.get(
      `SELECT COALESCE(SUM(betrag),0) b FROM provision_buchungen WHERE deal_id=${q1(1)} AND employee_id=${q1(2)} AND rolle='team' AND typ IN ('team_upgrade','team_nachtrag')`,
      [d.id, empf])).b));
    const diff = round2(want - have); if (diff === 0) continue;
    const offen = (await periodeStatus(gd, 'bonn')) === 'offen';
    const ziel = offen ? await getOrCreateZeitraum(...Object.values(periodFor(gd, 'bonn')), 'bonn') : await offenerZeitraumAm(today, 'bonn');
    await insertBuchung({ zeitraum_id: ziel.id, employee_id: empf, deal_id: d.id, rolle: 'team',
      typ: offen ? 'team_upgrade' : 'team_nachtrag', satz: extra, bemessungsgrundlage: ae, betrag: diff, kalendermonat: km, gewonnen_datum: gd,
      beschreibung: extra > 0
        ? `Team-Staffel ${km}: Bonn-Monats-AE ${fmtEur(bonnAeVoll)} → ${fmtPct(finalSatz)} (+${fmtPct(extra)}) · Delta auf vergütete Basis · ${d.kunde || ''}`.trim()
        : `Team-Staffel-Rücknahme ${km}: Bonn-Monats-AE ${fmtEur(bonnAeVoll)} → ${fmtPct(finalSatz)} · ${d.kunde || ''}`.trim(),
      idem_key: null });
  }
  await storniereAltAggregat(empf, 'team', km, ['team_upgrade', 'team_nachtrag'], (await offenerZeitraumAm(today, 'bonn')).id);
}

// LIVE-AT-Staffel (Opener/Setter). SATZ aus dem Monats-AE des Beteiligten in DER Rolle; Delta je Deal.
// O==S-Deals zaehlen in die Opener-Basis, NICHT in die Setter-Basis (O==S -> nur Opener-Provision).
async function aktualisiereStaffelAt(empId, rolle, km, stichtag) {
  if (!empId || (rolle !== 'opener' && rolle !== 'setter')) return;
  if ((await empKreis(empId)) !== 'oesterreich') return;
  const cfg = await configFor(km + '-28', 'oesterreich'); if (!cfg) return;
  const goLive = await goLiveDatum('oesterreich'), today = stichtag || heute();
  const roleCol = rolle === 'opener' ? 'opener_id' : 'setter_id';
  const exclOS = rolle === 'setter' ? ' AND (opener_id IS NULL OR opener_id <> setter_id)' : '';
  const deals = await db.all(
    `SELECT id, ae_wert, gewonnen_datum, kunde FROM deals_nk
      WHERE ${roleCol}=${q1(1)} AND status='Gewonnen' AND ${ymExpr('gewonnen_datum')}=${q1(2)}${exclOS}
      ORDER BY ${ymdExpr('gewonnen_datum')}, id`, [empId, km]);
  const base = deals.reduce((a, d) => a + (Number(d.ae_wert) || 0), 0);
  const satz = await staffelSatz('oesterreich', rolle, base, km + '-28');
  const typOffen = `at_${rolle}_staffel`, typZu = `at_${rolle}_nachtrag`;
  for (const d of deals) {
    const gd = toYmd(d.gewonnen_datum); if (!gd || gd < goLive) continue;
    const ae = Number(d.ae_wert) || 0, want = round2(ae * satz / 100);
    const have = round2(Number((await db.get(
      `SELECT COALESCE(SUM(betrag),0) b FROM provision_buchungen WHERE deal_id=${q1(1)} AND employee_id=${q1(2)} AND rolle=${q1(3)} AND typ IN ('${typOffen}','${typZu}')`,
      [d.id, empId, rolle])).b));
    const diff = round2(want - have); if (diff === 0) continue;
    const offen = (await periodeStatus(gd, 'oesterreich')) === 'offen';
    const ziel = offen ? await getOrCreateZeitraum(...Object.values(periodFor(gd, 'oesterreich')), 'oesterreich') : await offenerZeitraumAm(today, 'oesterreich');
    await insertBuchung({ zeitraum_id: ziel.id, employee_id: empId, deal_id: d.id, rolle,
      typ: offen ? typOffen : typZu, satz, bemessungsgrundlage: ae, betrag: diff, kalendermonat: km, gewonnen_datum: gd,
      beschreibung: `AT-Staffel ${rolle === 'opener' ? 'Opener' : 'Setter'} ${km}: Monats-AE ${fmtEur(base)} → ${fmtPct(satz)} · ${d.kunde || ''}`.trim(),
      idem_key: null });
  }
}

// Trigger nach jeder provisionsrelevanten Aenderung: Staffeln fuer betroffene Beteiligte neu bestimmen.
async function nachStaffel(deal, prev, today) {
  const kmSet = new Set([toYmd(deal?.gewonnen_datum), toYmd(prev?.gewonnen_datum)].filter(Boolean).map(g => g.slice(0, 7)));
  const closers = new Set([deal?.closer_id, prev?.closer_id].filter(Boolean));
  const openers = new Set([deal?.opener_id, prev?.opener_id].filter(Boolean));
  const setters = new Set([deal?.setter_id, prev?.setter_id].filter(Boolean));
  for (const km of kmSet) {
    for (const c of closers) await aktualisiereCloserStaffel(c, km, today);
    await aktualisiereTeamStaffel(km, today);
    for (const o of openers) await aktualisiereStaffelAt(o, 'opener', km, today);
    for (const s of setters) await aktualisiereStaffelAt(s, 'setter', km, today);
  }
}

// ── Anzeige-Helfer: Staffel-Situation eines Kalendermonats (Closer/Team Bonn+BS, AT-Opener/Setter) ──
async function datumSchwelle(closerId, km, schwelle) {
  const deals = await db.all(
    `SELECT ${ymdExpr('gewonnen_datum')} gd, ae_wert FROM deals_nk
      WHERE closer_id=${q1(1)} AND status='Gewonnen' AND ${ymExpr('gewonnen_datum')}=${q1(2)}
      ORDER BY ${ymdExpr('gewonnen_datum')}, id`, [closerId, km]);
  let cum = 0;
  for (const d of deals) { cum += Number(d.ae_wert) || 0; if (cum >= schwelle) return d.gd; }
  return null;
}
async function staffelStatus(km) {
  const out = { km, closers: [], team: null, atOpener: [], atSetter: [] };
  // Closer-Staffel (Bonn + BS) auf Basis der jeweiligen Kreis-Config.
  const cfgBonn = await configFor(km + '-28', 'bonn');
  const rows = await db.all(
    `SELECT d.closer_id id, e.name, e.standort, SUM(d.ae_wert) ae FROM deals_nk d JOIN employees e ON e.id=d.closer_id
      WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)} AND e.standort IN ('Bonn','Braunschweig')
      GROUP BY d.closer_id, e.name, e.standort`, [km]);
  for (const r of rows) {
    const kreis = kreisFor(r.standort), cfg = kreis === 'bonn' ? cfgBonn : await configFor(km + '-28', kreis);
    if (!cfg) continue;
    const ae = Number(r.ae) || 0, schwelle = Number(cfg.closer_schwelle), above = ae >= schwelle;
    out.closers.push({ employee_id: r.id, name: r.name, standort: r.standort, monthAe: round2(ae),
      satz: above ? Number(cfg.closer_hoch) : Number(cfg.closer_basis), basis: Number(cfg.closer_basis), hoch: Number(cfg.closer_hoch),
      schwelle, restBisNext: above ? 0 : round2(schwelle - ae), erreichtAm: above ? await datumSchwelle(r.id, km, schwelle) : null });
  }
  if (cfgBonn && cfgBonn.team_empfaenger_id) {
    const bonnAe = await bonnMonatsAe(km), s1b = Number(cfgBonn.team_s1_bis), s2b = Number(cfgBonn.team_s2_bis);
    const satz = bonnAe <= s1b ? Number(cfgBonn.team_s1) : bonnAe <= s2b ? Number(cfgBonn.team_s2) : Number(cfgBonn.team_s3);
    const nextThresh = bonnAe <= s1b ? s1b : bonnAe <= s2b ? s2b : null;
    const nextSatz = bonnAe <= s1b ? Number(cfgBonn.team_s2) : bonnAe <= s2b ? Number(cfgBonn.team_s3) : null;
    const emp = await db.get(`SELECT name FROM employees WHERE id=${q1(1)}`, [cfgBonn.team_empfaenger_id]);
    out.team = { employee_id: +cfgBonn.team_empfaenger_id, name: emp?.name, monthAe: round2(bonnAe), satz, restBisNext: nextThresh ? round2(nextThresh - bonnAe) : 0, nextSatz };
  }
  // AT-Opener/Setter-Staffel (Monats-AE des Beteiligten je Rolle + aktuelle Stufe + Rest bis naechste).
  if (await configFor(km + '-28', 'oesterreich')) {
    for (const rolle of ['opener', 'setter']) {
      const roleCol = rolle === 'opener' ? 'opener_id' : 'setter_id';
      const exclOS = rolle === 'setter' ? ' AND (d.opener_id IS NULL OR d.opener_id <> d.setter_id)' : '';
      const agg = await db.all(
        `SELECT d.${roleCol} id, e.name, SUM(d.ae_wert) ae FROM deals_nk d JOIN employees e ON e.id=d.${roleCol}
          WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)} AND e.standort='Österreich'${exclOS}
          GROUP BY d.${roleCol}, e.name`, [km]);
      const stufen = (await db.all(`SELECT ab_betrag, satz FROM provision_staffel WHERE kreis='oesterreich' AND rolle=${q1(1)} ORDER BY ab_betrag ASC`, [rolle])).map(r => ({ ab: Number(r.ab_betrag), satz: Number(r.satz) }));
      const arr = rolle === 'opener' ? out.atOpener : out.atSetter;
      for (const r of agg) {
        const ae = Number(r.ae) || 0;
        let satz = 0, next = null;
        for (const st of stufen) { if (ae >= st.ab) satz = st.satz; else { next = st; break; } }
        arr.push({ employee_id: r.id, name: r.name, monthAe: round2(ae), satz, nextAb: next ? next.ab : null, nextSatz: next ? next.satz : null, restBisNext: next ? round2(next.ab - ae) : 0 });
      }
    }
  }
  return out;
}

// AT-Closer-Deals ohne gesetzte Auto-VL (nicht buchbar -> Liste fuer Deniz, nicht raten).
async function atCloserOhneVl(km) {
  return await db.all(
    `SELECT d.id, d.kunde, ${ymdExpr('d.gewonnen_datum')} gd, d.ae_wert, e.name closer FROM deals_nk d JOIN employees e ON e.id=d.closer_id
      WHERE e.standort='Österreich' AND d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)}
        AND (d.automatische_verlaengerung IS NULL OR TRIM(d.automatische_verlaengerung)='' OR d.automatische_verlaengerung NOT IN ('Ja','Nein'))
      ORDER BY ${ymdExpr('d.gewonnen_datum')}, d.id`, [km]);
}

// ── Braunschweig aus dem Bonn-Zyklus loesen (idempotent) ──────────────────────
// BS-Positionen wurden vor der Standort-Umstellung in Bonn-Perioden (21.-20.) gebucht. Weil idem_key
// periodenunabhaengig ist, werden die NICHT eingefrorenen BS-Zeilen aus Bonn-Perioden GELOESCHT (der
// Bonn-Zeitraum ist noch offen, nie exportiert) -> Keys frei. Der Backfill legt sie danach korrekt in
// BS-Kalendermonatsperioden neu an (Opener dann als 125-Fix statt 3%). Gibt ein Protokoll zurueck.
async function dekoppleBraunschweig(stichtag) {
  const rowsVorher = await db.all(
    `SELECT b.employee_id, e.name, COUNT(*) n, COALESCE(SUM(b.betrag),0) summe, MAX(b.eingefroren) frozen
       FROM provision_buchungen b JOIN provision_zeitraeume z ON z.id=b.zeitraum_id JOIN employees e ON e.id=b.employee_id
      WHERE z.kreis='bonn' AND e.standort='Braunschweig'
      GROUP BY b.employee_id, e.name ORDER BY summe DESC`);
  const frozen = rowsVorher.filter(r => Number(r.frozen) === 1);
  // Sicherung: eingefrorene (abgeschlossene) BS-Zeilen NICHT anfassen -> stattdessen stornieren.
  let deleted = 0;
  if (pg()) {
    const r = await db.run(`DELETE FROM provision_buchungen WHERE eingefroren=FALSE AND id IN (
        SELECT b.id FROM provision_buchungen b JOIN provision_zeitraeume z ON z.id=b.zeitraum_id JOIN employees e ON e.id=b.employee_id
        WHERE z.kreis='bonn' AND e.standort='Braunschweig')`);
    deleted = r?.rowCount ?? 0;
  } else {
    const before = db.get(`SELECT COUNT(*) n FROM provision_buchungen b JOIN provision_zeitraeume z ON z.id=b.zeitraum_id JOIN employees e ON e.id=b.employee_id WHERE b.eingefroren=0 AND z.kreis='bonn' AND e.standort='Braunschweig'`);
    db.run(`DELETE FROM provision_buchungen WHERE eingefroren=0 AND id IN (
        SELECT b.id FROM provision_buchungen b JOIN provision_zeitraeume z ON z.id=b.zeitraum_id JOIN employees e ON e.id=b.employee_id
        WHERE z.kreis='bonn' AND e.standort='Braunschweig')`);
    deleted = Number((before || {}).n) || 0;
  }
  return { rowsVorher, deleted, frozenBlockiert: frozen.length };
}

// ── Reconcile / Backfill (idempotent) ─────────────────────────────────────────
// Reihenfolge kritisch: (1) BS aus Bonn loesen (Keys frei), (2) Basis-Positionen aller gewonnenen Deals,
// (3) BS-Opener-Fix auch fuer verlorene Deals, (4) Staffeln nachziehen.
async function reconcileAll(stichtag) {
  const today = stichtag || heute();
  const dek = await dekoppleBraunschweig(today);
  const goLiveMin = (await db.get(`SELECT MIN(gueltig_ab) g FROM provision_config`))?.g || '9999-12-31';
  const won = await db.all(`SELECT * FROM deals_nk WHERE status='Gewonnen' AND ${ymdExpr('gewonnen_datum')} >= ${q1(1)} ORDER BY ${ymdExpr('gewonnen_datum')}, id`, [goLiveMin]);
  for (const d of won) await provisionSync(d, null, today);
  const bsGoLive = await goLiveDatum('braunschweig');
  const bsVerloren = await db.all(
    `SELECT d.* FROM deals_nk d JOIN employees e ON e.id=d.opener_id
      WHERE e.standort='Braunschweig' AND d.status='Verloren' AND ${ymdExpr('d.datum')} >= ${q1(1)}`, [bsGoLive]);
  for (const d of bsVerloren) await syncBsOpenerFix(d, today);
  await materialisiereNachtraege(today);
  return { dekopplung: dek, gewonneneInScope: won.length, bsVerlorenInScope: bsVerloren.length };
}

// Idempotentes Sicherheitsnetz (Cron/Start): rechnet alle Staffeln fuer In-Scope-Kalendermonate nach.
async function materialisiereNachtraege(stichtag) {
  const today = stichtag || heute();
  const goLiveMin = (await db.get(`SELECT MIN(gueltig_ab) g FROM provision_config`))?.g || '9999-12-31';
  const monate = (await db.all(
    `SELECT DISTINCT ${ymExpr('gewonnen_datum')} km FROM deals_nk WHERE status='Gewonnen' AND ${ymdExpr('gewonnen_datum')} >= ${q1(1)}`, [goLiveMin]))
    .map(r => r.km).filter(Boolean);
  for (const km of monate) {
    const beteiligte = await db.all(
      `SELECT DISTINCT id, standort FROM (
         SELECT d.closer_id id, e.standort FROM deals_nk d JOIN employees e ON e.id=d.closer_id WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)}
         UNION SELECT d.opener_id id, e.standort FROM deals_nk d JOIN employees e ON e.id=d.opener_id WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)}
         UNION SELECT d.setter_id id, e.standort FROM deals_nk d JOIN employees e ON e.id=d.setter_id WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)}
       ) x WHERE id IS NOT NULL`, [km]);
    for (const b of beteiligte) {
      const k = kreisFor(b.standort);
      if (k === 'bonn' || k === 'braunschweig') await aktualisiereCloserStaffel(b.id, km, today);
      if (k === 'oesterreich') { await aktualisiereStaffelAt(b.id, 'opener', km, today); await aktualisiereStaffelAt(b.id, 'setter', km, today); }
    }
    await aktualisiereTeamStaffel(km, today);
  }
}

// Read-only-Projektion (kein Insert): was wuerde der Basis-Backfill je Rolle buchen? (Dry-Run)
async function projektionLaufend(stichtag) {
  const goLiveMin = (await db.get(`SELECT MIN(gueltig_ab) g FROM provision_config`))?.g || '9999-12-31';
  const deals = await db.all(`SELECT * FROM deals_nk WHERE status='Gewonnen' AND ${ymdExpr('gewonnen_datum')} >= ${q1(1)}`, [goLiveMin]);
  const perRolle = {}; let totalBase = 0, gebucht = 0;
  for (const d of deals) {
    const gd = toYmd(d.gewonnen_datum); if (!gd) continue;
    const ae = Number(d.ae_wert) || 0;
    for (const p of await positionenFor(d, gd)) {
      const betrag = round2(ae * p.satz / 100);
      perRolle[p.rolle] = perRolle[p.rolle] || { n: 0, summe: 0 };
      perRolle[p.rolle].n++; perRolle[p.rolle].summe = round2(perRolle[p.rolle].summe + betrag);
      totalBase = round2(totalBase + betrag); gebucht++;
    }
  }
  return { goLive: goLiveMin, inScopeDeals: deals.length, positionen: gebucht, totalBase, perRolle };
}

// Einmaliger, idempotenter Backfill (Button + Startup): fuehrt reconcileAll aus und fasst zusammen.
async function backfillLaufend(stichtag) {
  const r = await reconcileAll(stichtag);
  const rows = await db.all(`SELECT typ, COUNT(*) n, COALESCE(SUM(betrag),0) summe FROM provision_buchungen GROUP BY typ ORDER BY typ`);
  return { ...r, buchungen: rows };
}

// Zeitraum abschliessen: Buchungen einfrieren, Status setzen, Folgeperiode DES KREISES anlegen.
async function abschliesseZeitraum(zeitraumId, userId, stichtag) {
  const today = stichtag || heute();
  const z = await db.get(`SELECT * FROM provision_zeitraeume WHERE id=${q1(1)}`, [zeitraumId]);
  if (!z) return { error: 'not_found' };
  if (z.status !== 'offen') return { error: 'already_closed' };
  if (today <= z.bis) return { error: 'still_running', bis: z.bis };
  if (pg()) {
    await db.run(`UPDATE provision_buchungen SET eingefroren=TRUE WHERE zeitraum_id=$1`, [zeitraumId]);
    await db.run(`UPDATE provision_zeitraeume SET status='abgeschlossen', abgeschlossen_am=$1, abgeschlossen_von=$2 WHERE id=$3`, [today, userId ?? null, zeitraumId]);
  } else {
    db.run(`UPDATE provision_buchungen SET eingefroren=1 WHERE zeitraum_id=?`, [zeitraumId]);
    db.run(`UPDATE provision_zeitraeume SET status='abgeschlossen', abgeschlossen_am=?, abgeschlossen_von=? WHERE id=?`, [today, userId ?? null, zeitraumId]);
  }
  const kreis = z.kreis || 'bonn';
  const n = periodFor(naechsterTag(z.bis), kreis);
  const neu = await getOrCreateZeitraum(n.von, n.bis, kreis);
  return { abgeschlossen: { ...z, status: 'abgeschlossen', abgeschlossen_am: today, abgeschlossen_von: userId ?? null }, neuerZeitraum: neu };
}

module.exports = {
  provisionSync, syncBsOpenerFix, materialisiereNachtraege, reconcileAll, dekoppleBraunschweig,
  backfillLaufend, projektionLaufend, abschliesseZeitraum, staffelStatus, atCloserOhneVl,
  closerMonatsAe, bonnMonatsAe, periodFor, labelFor, labelForKreis, kalendermonatFor,
  configFor, getOrCreateZeitraum, kreisFor, goLiveDatum, staffelSatz,
};
