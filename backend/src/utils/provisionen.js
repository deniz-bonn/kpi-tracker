// Provisions-Engine (NK, Standorte Bonn/Braunschweig). Append-only Buchungen.
// Liest deals_nk/employees, schreibt NUR in provision_*. Muss robust sein: der Aufruf
// im NK-Write-Hook läuft in try/catch, ein Fehler hier darf das Deal-Speichern nie brechen.
const db = require('../db');
const { toYmd } = require('./gewonnen');

const DE = new Set(['Bonn', 'Braunschweig']);
const pg = () => db.dialect === 'postgres';
const round2 = n => Math.round((Number(n) || 0) * 100) / 100;
const fmtEur = n => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
const fmtPct = n => String(n).replace('.', ',') + ' %';
// Kalendermonat aus gewonnen_datum je Dialekt (Postgres DATE -> to_char, SQLite TEXT -> substr).
const ymExpr = col => pg() ? `to_char(${col}, 'YYYY-MM')` : `substr(${col}, 1, 7)`;
// YYYY-MM-DD als TEXT (deals_nk.gewonnen_datum ist DATE in PG) -> sichere Textvergleiche statt DATE>=TEXT.
const ymdExpr = col => pg() ? `to_char(${col}, 'YYYY-MM-DD')` : col;

// ── Perioden (Regel: Abrechnungszeitraum 21.–20., der 20. zählt voll mit) ──
function periodFor(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  const pad = n => String(n).padStart(2, '0');
  if (d <= 20) {
    const pm = m === 1 ? 12 : m - 1, py = m === 1 ? y - 1 : y;
    return { von: `${py}-${pad(pm)}-21`, bis: `${y}-${pad(m)}-20` };
  }
  const nm = m === 12 ? 1 : m + 1, ny = m === 12 ? y + 1 : y;
  return { von: `${y}-${pad(m)}-21`, bis: `${ny}-${pad(nm)}-20` };
}
const labelFor = (von, bis) => `${von.slice(8, 10)}.${von.slice(5, 7)}.–${bis.slice(8, 10)}.${bis.slice(5, 7)}.${bis.slice(0, 4)}`;
const kalendermonatFor = ymd => ymd.slice(0, 7);
const heute = () => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

// ── DB-Helfer ──
const q1 = i => pg() ? `$${i}` : '?';
async function empStandort(id) {
  if (!id) return null;
  const e = await db.get(`SELECT standort FROM employees WHERE id=${q1(1)}`, [id]);
  return e ? e.standort : null;
}
async function getOrCreateZeitraum(von, bis) {
  let z = await db.get(`SELECT * FROM provision_zeitraeume WHERE von=${q1(1)}`, [von]);
  if (z) return z;
  const label = labelFor(von, bis);
  if (pg()) {
    await db.run(`INSERT INTO provision_zeitraeume (von,bis,label,status) SELECT $1,$2,$3,'offen' WHERE NOT EXISTS (SELECT 1 FROM provision_zeitraeume WHERE von=$1)`, [von, bis, label]);
  } else {
    db.run(`INSERT INTO provision_zeitraeume (von,bis,label,status) SELECT ?,?,?,'offen' WHERE NOT EXISTS (SELECT 1 FROM provision_zeitraeume WHERE von=?)`, [von, bis, label, von]);
  }
  return await db.get(`SELECT * FROM provision_zeitraeume WHERE von=${q1(1)}`, [von]);
}
const offenerZeitraumAm = stichtag => { const { von, bis } = periodFor(stichtag); return getOrCreateZeitraum(von, bis); };
async function configFor(zeitraumVon) {
  return await db.get(`SELECT * FROM provision_config WHERE gueltig_ab <= ${q1(1)} ORDER BY gueltig_ab DESC LIMIT 1`, [zeitraumVon]);
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

// Provisions-Positionen eines Deals (nur DE-Beteiligte). O/S dieselbe Person -> Pauschale.
async function positionenFor(deal, cfg) {
  const oId = deal.opener_id, sId = deal.setter_id, cId = deal.closer_id;
  const [oSt, sSt, cSt] = [await empStandort(oId), await empStandort(sId), await empStandort(cId)];
  const out = [];
  if (oId && sId && oId === sId) {
    if (DE.has(oSt)) out.push({ emp: oId, rolle: 'opener_setter', satz: +cfg.opener_setter_pauschal, besch: `Opener+Setter (Pauschale ${fmtPct(cfg.opener_setter_pauschal)})` });
  } else {
    if (oId && DE.has(oSt)) out.push({ emp: oId, rolle: 'opener', satz: +cfg.opener_satz, besch: `Opener (${fmtPct(cfg.opener_satz)})` });
    if (sId && DE.has(sSt)) out.push({ emp: sId, rolle: 'setter', satz: +cfg.setter_satz, besch: `Setter (${fmtPct(cfg.setter_satz)})` });
  }
  if (cId && DE.has(cSt)) out.push({ emp: cId, rolle: 'closer', satz: +cfg.closer_basis, besch: `Closer Basis (${fmtPct(cfg.closer_basis)})` });
  if (cId && cSt === 'Bonn' && cfg.team_empfaenger_id) out.push({ emp: +cfg.team_empfaenger_id, rolle: 'team', satz: +cfg.team_s1, besch: `Team Bonn (${fmtPct(cfg.team_s1)})`, isTeam: true });
  return out;
}

// Haupt-Hook: bucht Win / Storno / Korrektur. deal = neuer Zustand, prev = alter (null beim Anlegen).
async function provisionSync(deal, prev, stichtag) {
  const wasWon = prev?.status === 'Gewonnen';
  const isWon = deal?.status === 'Gewonnen';
  if (!wasWon && !isWon) return;
  const today = stichtag || heute();

  if (!wasWon && isWon) {                                   // WIN -> Basis-Positionen
    const gd = toYmd(deal.gewonnen_datum); if (!gd) return;
    const { von, bis } = periodFor(gd);
    // Config-Gate VOR Zeitraum-Anlage: Deals vor Go-Live (kein gueltiger Satz) erzeugen keine Waisen-Zeitraeume.
    const cfg = await configFor(von); if (!cfg) return;
    const z = await getOrCreateZeitraum(von, bis);
    const km = kalendermonatFor(gd), ae = Number(deal.ae_wert) || 0;
    for (const p of await positionenFor(deal, cfg)) {
      await insertBuchung({ zeitraum_id: z.id, employee_id: p.emp, deal_id: deal.id, rolle: p.rolle,
        typ: p.isTeam ? 'team_provision' : 'deal_gewonnen', satz: p.satz, bemessungsgrundlage: ae,
        betrag: ae * p.satz / 100, kalendermonat: km, gewonnen_datum: gd,
        beschreibung: `${p.besch} · ${deal.kunde || ''}`.trim(),
        idem_key: `${p.isTeam ? 'team' : 'dg'}:${deal.id}:${p.rolle}:${p.emp}` });
    }
    return;
  }

  if (wasWon && !isWon) return storniereDeal(deal?.id ?? prev.id, prev, today);   // UNWIN -> Storno

  if (wasWon && isWon) {                                    // Neu-Bewertung: ae ODER Rollen (Personen) geändert
    const gd = toYmd(deal.gewonnen_datum) || toYmd(prev.gewonnen_datum); if (!gd) return;
    const { von, bis } = periodFor(gd);
    const cfg = await configFor(von); if (!cfg) return;    // Go-Live-Gate vor Zeitraum-Anlage (s.o.)
    const orig = await getOrCreateZeitraum(von, bis);
    const target = orig.status === 'offen' ? orig : await offenerZeitraumAm(today);
    const km = kalendermonatFor(gd), ae = Number(deal.ae_wert) || 0;
    // Soll: was jede(r) Beteiligte laut aktuellem Deal-Zustand bekommen müsste (Basis-Positionen).
    const soll = new Map();
    for (const p of await positionenFor(deal, cfg)) soll.set(`${p.emp}|${p.rolle}`, { satz: p.satz, besch: p.besch, betrag: round2(ae * p.satz / 100) });
    // Ist: bereits gebuchte Netto-Summe je (Empfänger,Rolle) dieses Deals (Basis + frühere Korrekturen).
    const ist = new Map();
    for (const r of await db.all(`SELECT employee_id, rolle, COALESCE(SUM(betrag),0) b FROM provision_buchungen WHERE deal_id=${q1(1)} AND typ IN ('deal_gewonnen','team_provision','korrektur') GROUP BY employee_id, rolle`, [deal.id]))
      ist.set(`${r.employee_id}|${r.rolle}`, round2(Number(r.b)));
    // Differenz je Empfänger/Rolle als sichtbare Korrektur buchen (auch Rückbuchung entfallener Rollen).
    // Selbst-idempotent: Ist wird frisch aus dem Ledger gelesen, unveränderte Deals ergeben Diff 0.
    for (const k of new Set([...soll.keys(), ...ist.keys()])) {
      const [emp, rolle] = k.split('|');
      const s = soll.get(k), sollB = s ? s.betrag : 0, istB = ist.get(k) || 0, diff = round2(sollB - istB);
      if (diff === 0) continue;
      await insertBuchung({ zeitraum_id: target.id, employee_id: +emp, deal_id: deal.id, rolle,
        typ: 'korrektur', satz: s ? s.satz : 0, bemessungsgrundlage: ae, betrag: diff, kalendermonat: km, gewonnen_datum: gd,
        beschreibung: s ? `Korrektur → Soll ${fmtEur(sollB)} (war ${fmtEur(istB)}) · ${s.besch}` : `Korrektur → Rolle entfällt, Rückbuchung ${fmtEur(-diff)} · ${deal.kunde || ''}`.trim(),
        idem_key: null });
    }
    return;
  }
}

// Storniert einen Deal: reversed die Netto-Summe je (Empfänger,Rolle) in den offenen Zeitraum.
async function storniereDeal(dealId, prev, today) {
  const orig = await db.all(
    `SELECT employee_id, rolle, betrag FROM provision_buchungen WHERE deal_id=${q1(1)} AND typ IN ('deal_gewonnen','team_provision','korrektur','staffel_nachtrag','team_nachtrag')`, [dealId]);
  const agg = {};
  for (const b of orig) { const k = `${b.employee_id}|${b.rolle}`; agg[k] = (agg[k] || 0) + Number(b.betrag); }
  const z = await offenerZeitraumAm(today);
  for (const [k, sum] of Object.entries(agg)) {
    if (round2(sum) === 0) continue;
    const [emp, rolle] = k.split('|');
    await insertBuchung({ zeitraum_id: z.id, employee_id: +emp, deal_id: dealId, rolle,
      typ: 'storno', satz: 0, bemessungsgrundlage: 0, betrag: -round2(sum), kalendermonat: today.slice(0, 7),
      gewonnen_datum: null, beschreibung: `Storno (Deal nicht mehr gewonnen) · ${prev?.kunde || ''}`.trim(),
      idem_key: `storno:${dealId}:${rolle}:${emp}` });
  }
}

// Monatsend-Nachträge (idempotent): Closer-200k-Staffel + Team-Bonn-Staffel für abgeschlossene
// Kalendermonate, gebucht in den am Stichtag offenen Zeitraum (Überhang-/Clawback-Prinzip).
async function materialisiereNachtraege(stichtag) {
  const today = stichtag || heute();
  const curMonth = today.slice(0, 7);
  const zielZeitraum = await offenerZeitraumAm(today);
  // Go-Live-Untergrenze: fruehestes Config-Datum. Deals davor zaehlen nie mit (auch nicht in Staffeln).
  const goLive = (await db.get(`SELECT MIN(gueltig_ab) g FROM provision_config`))?.g || '9999-12-31';
  const monate = (await db.all(`SELECT DISTINCT kalendermonat FROM provision_buchungen`)).map(r => r.kalendermonat).filter(km => km < curMonth);
  for (const km of monate) {
    const cfg = await configFor(km + '-21'); if (!cfg) continue;
    // Closer-Staffel: persönlicher DE-Closer-AE des Kalendermonats
    const closer = await db.all(
      `SELECT d.closer_id id, SUM(d.ae_wert) ae FROM deals_nk d JOIN employees e ON e.id=d.closer_id
       WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)} AND ${ymdExpr('d.gewonnen_datum')} >= ${q1(2)} AND e.standort IN ('Bonn','Braunschweig')
       GROUP BY d.closer_id`, [km, goLive]);
    for (const c of closer) {
      const ae = Number(c.ae) || 0;
      if (ae < Number(cfg.closer_schwelle)) continue;
      const delta = (Number(cfg.closer_hoch) - Number(cfg.closer_basis));
      await insertBuchung({ zeitraum_id: zielZeitraum.id, employee_id: c.id, deal_id: null, rolle: 'closer',
        typ: 'staffel_nachtrag', satz: delta, bemessungsgrundlage: ae, betrag: ae * delta / 100, kalendermonat: km,
        gewonnen_datum: null, beschreibung: `Nachtrag Staffel ${km}: ${fmtEur(cfg.closer_schwelle)} überschritten, +${fmtPct(delta)} auf ${fmtEur(ae)}`,
        idem_key: `staffel:${c.id}:${km}` });
    }
    // Team-Bonn-Staffel auf den gesamten Bonn-Monats-AE
    if (cfg.team_empfaenger_id) {
      const row = await db.get(
        `SELECT SUM(d.ae_wert) ae FROM deals_nk d JOIN employees e ON e.id=d.closer_id
         WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)} AND ${ymdExpr('d.gewonnen_datum')} >= ${q1(2)} AND e.standort='Bonn'`, [km, goLive]);
      const bonnAe = Number(row?.ae) || 0;
      if (bonnAe > 0) {
        const finalSatz = bonnAe <= Number(cfg.team_s1_bis) ? Number(cfg.team_s1)
          : bonnAe <= Number(cfg.team_s2_bis) ? Number(cfg.team_s2) : Number(cfg.team_s3);
        const delta = finalSatz - Number(cfg.team_s1);
        if (delta > 0) {
          await insertBuchung({ zeitraum_id: zielZeitraum.id, employee_id: +cfg.team_empfaenger_id, deal_id: null, rolle: 'team',
            typ: 'team_nachtrag', satz: delta, bemessungsgrundlage: bonnAe, betrag: bonnAe * delta / 100, kalendermonat: km,
            gewonnen_datum: null, beschreibung: `Team-Nachtrag Staffel ${km}: Bonn-AE ${fmtEur(bonnAe)} → ${fmtPct(finalSatz)}, +${fmtPct(delta)}`,
            idem_key: `teamstaffel:${cfg.team_empfaenger_id}:${km}` });
        }
      }
    }
  }
}

// Read-only-Projektion (kein Insert): was würde der Backfill für den laufenden Zeitraum buchen?
// Für Dry-Run vor dem Commit. Nachträge (Monatsende) sind hier bewusst ausgeklammert.
async function projektionLaufend(stichtag) {
  const today = stichtag || heute();
  const goLive = (await db.get(`SELECT MIN(gueltig_ab) g FROM provision_config`))?.g || '9999-12-31';
  const deals = await db.all(
    `SELECT * FROM deals_nk WHERE status='Gewonnen' AND ${ymdExpr('gewonnen_datum')} >= ${q1(1)}`, [goLive]);
  const perRolle = {}; let totalBase = 0, gebucht = 0;
  for (const d of deals) {
    const gd = toYmd(d.gewonnen_datum); if (!gd) continue;
    const cfg = await configFor(periodFor(gd).von); if (!cfg) continue;
    const ae = Number(d.ae_wert) || 0;
    for (const p of await positionenFor(d, cfg)) {
      const betrag = round2(ae * p.satz / 100);
      perRolle[p.rolle] = perRolle[p.rolle] || { n: 0, summe: 0 };
      perRolle[p.rolle].n++; perRolle[p.rolle].summe = round2(perRolle[p.rolle].summe + betrag);
      totalBase = round2(totalBase + betrag); gebucht++;
    }
  }
  return { goLive, inScopeDeals: deals.length, positionen: gebucht, totalBase, perRolle };
}

// Einmaliger, idempotenter Backfill des laufenden Zeitraums bei Einführung: bucht Basis-Positionen
// für alle bereits gewonnenen In-Scope-Deals (gewonnen_datum >= Go-Live) und materialisiert fällige
// Monatsend-Nachträge. Mehrfach-Aufruf ist harmlos (idem_key). Gibt eine Zusammenfassung zurück.
async function backfillLaufend(stichtag) {
  const today = stichtag || heute();
  const goLive = (await db.get(`SELECT MIN(gueltig_ab) g FROM provision_config`))?.g || '9999-12-31';
  const deals = await db.all(
    `SELECT * FROM deals_nk WHERE status='Gewonnen' AND ${ymdExpr('gewonnen_datum')} >= ${q1(1)} ORDER BY ${ymdExpr('gewonnen_datum')}, id`, [goLive]);
  for (const d of deals) await provisionSync(d, null, today);
  await materialisiereNachtraege(today);
  const rows = await db.all(`SELECT typ, COUNT(*) n, COALESCE(SUM(betrag),0) summe FROM provision_buchungen GROUP BY typ ORDER BY typ`);
  return { goLive, inScopeDeals: deals.length, buchungen: rows };
}

module.exports = { provisionSync, materialisiereNachtraege, backfillLaufend, projektionLaufend, periodFor, labelFor, kalendermonatFor, configFor, getOrCreateZeitraum };
