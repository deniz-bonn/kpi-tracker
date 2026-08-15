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
    const gd = toYmd(deal.gewonnen_datum);
    const { von, bis } = gd ? periodFor(gd) : {};
    const cfg = gd ? await configFor(von) : null;           // Config-Gate: kein gueltiger Satz (vor Go-Live) -> nichts buchen
    if (gd && cfg) {
      const z = await getOrCreateZeitraum(von, bis);
      const km = kalendermonatFor(gd), ae = Number(deal.ae_wert) || 0;
      for (const p of await positionenFor(deal, cfg)) {
        await insertBuchung({ zeitraum_id: z.id, employee_id: p.emp, deal_id: deal.id, rolle: p.rolle,
          typ: p.isTeam ? 'team_provision' : 'deal_gewonnen', satz: p.satz, bemessungsgrundlage: ae,
          betrag: ae * p.satz / 100, kalendermonat: km, gewonnen_datum: gd,
          beschreibung: `${p.besch} · ${deal.kunde || ''}`.trim(),
          idem_key: `${p.isTeam ? 'team' : 'dg'}:${deal.id}:${p.rolle}:${p.emp}` });
      }
    }
  } else if (wasWon && !isWon) {                            // UNWIN -> Storno (inkl. Staffel des Deals)
    await storniereDeal(deal?.id ?? prev.id, prev, today);
  } else {                                                  // wasWon && isWon: Neu-Bewertung (ae ODER Rollen/Personen)
    const gd = toYmd(deal.gewonnen_datum) || toYmd(prev.gewonnen_datum);
    const { von, bis } = gd ? periodFor(gd) : {};
    const cfg = gd ? await configFor(von) : null;
    if (gd && cfg) {
      const orig = await getOrCreateZeitraum(von, bis);
      const target = orig.status === 'offen' ? orig : await offenerZeitraumAm(today);
      const km = kalendermonatFor(gd), ae = Number(deal.ae_wert) || 0;
      // Soll je (Empfänger,Rolle) laut aktuellem Deal-Zustand; Ist = bereits gebuchte Basis+Korrekturen.
      const soll = new Map();
      for (const p of await positionenFor(deal, cfg)) soll.set(`${p.emp}|${p.rolle}`, { satz: p.satz, besch: p.besch, betrag: round2(ae * p.satz / 100) });
      const ist = new Map();
      for (const r of await db.all(`SELECT employee_id, rolle, COALESCE(SUM(betrag),0) b FROM provision_buchungen WHERE deal_id=${q1(1)} AND typ IN ('deal_gewonnen','team_provision','korrektur') GROUP BY employee_id, rolle`, [deal.id]))
        ist.set(`${r.employee_id}|${r.rolle}`, round2(Number(r.b)));
      for (const k of new Set([...soll.keys(), ...ist.keys()])) {
        const [emp, rolle] = k.split('|');
        const s = soll.get(k), sollB = s ? s.betrag : 0, istB = ist.get(k) || 0, diff = round2(sollB - istB);
        if (diff === 0) continue;
        await insertBuchung({ zeitraum_id: target.id, employee_id: +emp, deal_id: deal.id, rolle,
          typ: 'korrektur', satz: s ? s.satz : 0, bemessungsgrundlage: ae, betrag: diff, kalendermonat: km, gewonnen_datum: gd,
          beschreibung: s ? `Korrektur → Soll ${fmtEur(sollB)} (war ${fmtEur(istB)}) · ${s.besch}` : `Korrektur → Rolle entfällt, Rückbuchung ${fmtEur(-diff)} · ${deal.kunde || ''}`.trim(),
          idem_key: null });
      }
    }
  }

  await nachStaffel(deal, prev, today);                    // Live-Staffelung nach jeder provisionsrelevanten Änderung
}

// Storniert einen Deal: reversed die Netto-Summe je (Empfänger,Rolle) in den offenen Zeitraum.
async function storniereDeal(dealId, prev, today) {
  const orig = await db.all(
    `SELECT employee_id, rolle, betrag FROM provision_buchungen WHERE deal_id=${q1(1)} AND typ IN ('deal_gewonnen','team_provision','korrektur','staffel_upgrade','staffel_nachtrag','team_upgrade','team_nachtrag')`, [dealId]);
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

// Go-Live-Untergrenze: fruehestes Config-Datum. Deals davor zaehlen nie mit (auch nicht in Staffeln).
async function goLiveDatum() {
  return (await db.get(`SELECT MIN(gueltig_ab) g FROM provision_config`))?.g || '9999-12-31';
}

// Status des Zeitraums, in dem die Basis eines Deals liegt ('offen'|'abgeschlossen').
async function periodeStatus(gd) {
  const row = await db.get(`SELECT status FROM provision_zeitraeume WHERE von=${q1(1)}`, [periodFor(gd).von]);
  return row?.status || 'offen';
}

// LIVE-Staffel (Closer, 200k): bestimmt den effektiven Monatssatz und bucht je Deal die Differenz
// (Soll = extra% × ae, Ist = bereits gebuchte Staffel des Deals). Wirkt hoch UND runter (append-only).
// Deal-Basis im offenen Zeitraum -> 'staffel_upgrade'; in abgeschlossenem -> 'staffel_nachtrag' (Folgezeitraum).
async function aktualisiereCloserStaffel(closerId, km, stichtag) {
  if (!closerId) return;
  if (!DE.has(await empStandort(closerId))) return;        // nur DE-Closer haben Staffel
  const cfg = await configFor(km + '-28'); if (!cfg) return;
  const goLive = await goLiveDatum(), today = stichtag || heute();
  const deals = await db.all(
    `SELECT id, ae_wert, gewonnen_datum, kunde FROM deals_nk
      WHERE closer_id=${q1(1)} AND status='Gewonnen' AND ${ymExpr('gewonnen_datum')}=${q1(2)} AND ${ymdExpr('gewonnen_datum')} >= ${q1(3)}`,
    [closerId, km, goLive]);
  const monthAe = deals.reduce((s, d) => s + (Number(d.ae_wert) || 0), 0);
  const above = monthAe >= Number(cfg.closer_schwelle);
  const extra = above ? (Number(cfg.closer_hoch) - Number(cfg.closer_basis)) : 0;   // %-Punkte
  const zielOffen = await offenerZeitraumAm(today);
  for (const d of deals) {
    const gd = toYmd(d.gewonnen_datum); if (!gd) continue;
    const ae = Number(d.ae_wert) || 0;
    const want = round2(ae * extra / 100);
    const have = round2(Number((await db.get(
      `SELECT COALESCE(SUM(betrag),0) b FROM provision_buchungen WHERE deal_id=${q1(1)} AND employee_id=${q1(2)} AND rolle='closer' AND typ IN ('staffel_upgrade','staffel_nachtrag')`,
      [d.id, closerId])).b));
    const diff = round2(want - have);
    if (diff === 0) continue;
    const typ = (await periodeStatus(gd)) === 'offen' ? 'staffel_upgrade' : 'staffel_nachtrag';
    await insertBuchung({ zeitraum_id: zielOffen.id, employee_id: closerId, deal_id: d.id, rolle: 'closer',
      typ, satz: extra, bemessungsgrundlage: ae, betrag: diff, kalendermonat: km, gewonnen_datum: gd,
      beschreibung: above
        ? `Staffel-Upgrade ${km}: ${fmtEur(monthAe)} ≥ ${fmtEur(cfg.closer_schwelle)} → +${fmtPct(extra)} · ${d.kunde || ''}`.trim()
        : `Staffel-Rücknahme ${km}: ${fmtEur(monthAe)} unter ${fmtEur(cfg.closer_schwelle)} · ${d.kunde || ''}`.trim(),
      idem_key: null });
  }
}

// LIVE-Team-Staffel (Bonn-Monats-AE): identische Mechanik über die Team-Stufen (150k/250k), je Bonn-Deal.
async function aktualisiereTeamStaffel(km, stichtag) {
  const cfg = await configFor(km + '-28'); if (!cfg || !cfg.team_empfaenger_id) return;
  const empf = +cfg.team_empfaenger_id, goLive = await goLiveDatum(), today = stichtag || heute();
  const deals = await db.all(
    `SELECT d.id, d.ae_wert, d.gewonnen_datum, d.kunde FROM deals_nk d JOIN employees e ON e.id=d.closer_id
      WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)} AND ${ymdExpr('d.gewonnen_datum')} >= ${q1(2)} AND e.standort='Bonn'`,
    [km, goLive]);
  const bonnAe = deals.reduce((s, d) => s + (Number(d.ae_wert) || 0), 0);
  const finalSatz = bonnAe <= Number(cfg.team_s1_bis) ? Number(cfg.team_s1)
    : bonnAe <= Number(cfg.team_s2_bis) ? Number(cfg.team_s2) : Number(cfg.team_s3);
  const extra = finalSatz - Number(cfg.team_s1);            // %-Punkte über Basis-Teamsatz
  const zielOffen = await offenerZeitraumAm(today);
  for (const d of deals) {
    const gd = toYmd(d.gewonnen_datum); if (!gd) continue;
    const ae = Number(d.ae_wert) || 0;
    const want = round2(ae * extra / 100);
    const have = round2(Number((await db.get(
      `SELECT COALESCE(SUM(betrag),0) b FROM provision_buchungen WHERE deal_id=${q1(1)} AND employee_id=${q1(2)} AND rolle='team' AND typ IN ('team_upgrade','team_nachtrag')`,
      [d.id, empf])).b));
    const diff = round2(want - have);
    if (diff === 0) continue;
    const typ = (await periodeStatus(gd)) === 'offen' ? 'team_upgrade' : 'team_nachtrag';
    await insertBuchung({ zeitraum_id: zielOffen.id, employee_id: empf, deal_id: d.id, rolle: 'team',
      typ, satz: extra, bemessungsgrundlage: ae, betrag: diff, kalendermonat: km, gewonnen_datum: gd,
      beschreibung: extra > 0
        ? `Team-Staffel ${km}: Bonn-AE ${fmtEur(bonnAe)} → ${fmtPct(finalSatz)} (+${fmtPct(extra)}) · ${d.kunde || ''}`.trim()
        : `Team-Staffel-Rücknahme ${km}: Bonn-AE ${fmtEur(bonnAe)} → ${fmtPct(finalSatz)} · ${d.kunde || ''}`.trim(),
      idem_key: null });
  }
}

// Trigger nach jeder provisionsrelevanten Änderung: Staffel für betroffene Closer + Team neu bestimmen.
async function nachStaffel(deal, prev, today) {
  const kmSet = new Set([toYmd(deal?.gewonnen_datum), toYmd(prev?.gewonnen_datum)].filter(Boolean).map(g => g.slice(0, 7)));
  const closers = new Set([deal?.closer_id, prev?.closer_id].filter(Boolean));
  for (const km of kmSet) {
    for (const c of closers) await aktualisiereCloserStaffel(c, km, today);
    await aktualisiereTeamStaffel(km, today);
  }
}

// Datum, an dem der kumulierte Monats-AE des Closers die Schwelle erstmals erreicht (für Anzeige).
async function datumSchwelle(closerId, km, schwelle, goLive) {
  const deals = await db.all(
    `SELECT ${ymdExpr('gewonnen_datum')} gd, ae_wert FROM deals_nk
      WHERE closer_id=${q1(1)} AND status='Gewonnen' AND ${ymExpr('gewonnen_datum')}=${q1(2)} AND ${ymdExpr('gewonnen_datum')} >= ${q1(3)}
      ORDER BY ${ymdExpr('gewonnen_datum')}, id`, [closerId, km, goLive]);
  let cum = 0;
  for (const d of deals) { cum += Number(d.ae_wert) || 0; if (cum >= schwelle) return d.gd; }
  return null;
}

// Effektive Staffel-Situation eines Kalendermonats (für Anzeige: aktueller Satz + Rest bis nächster Stufe).
async function staffelStatus(km) {
  const cfg = await configFor(km + '-28');
  if (!cfg) return { km, closers: [], team: null };
  const goLive = await goLiveDatum();
  const schwelle = Number(cfg.closer_schwelle);
  const rows = await db.all(
    `SELECT d.closer_id id, e.name, e.standort, SUM(d.ae_wert) ae FROM deals_nk d JOIN employees e ON e.id=d.closer_id
      WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)} AND ${ymdExpr('d.gewonnen_datum')} >= ${q1(2)} AND e.standort IN ('Bonn','Braunschweig')
      GROUP BY d.closer_id, e.name, e.standort`, [km, goLive]);
  const closers = [];
  for (const r of rows) {
    const ae = Number(r.ae) || 0, above = ae >= schwelle;
    closers.push({ employee_id: r.id, name: r.name, standort: r.standort, monthAe: round2(ae),
      satz: above ? Number(cfg.closer_hoch) : Number(cfg.closer_basis), basis: Number(cfg.closer_basis), hoch: Number(cfg.closer_hoch),
      schwelle, restBisNext: above ? 0 : round2(schwelle - ae),
      erreichtAm: above ? await datumSchwelle(r.id, km, schwelle, goLive) : null });
  }
  let team = null;
  if (cfg.team_empfaenger_id) {
    const brow = await db.get(
      `SELECT SUM(d.ae_wert) ae FROM deals_nk d JOIN employees e ON e.id=d.closer_id
        WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)} AND ${ymdExpr('d.gewonnen_datum')} >= ${q1(2)} AND e.standort='Bonn'`, [km, goLive]);
    const bonnAe = Number(brow?.ae) || 0, s1b = Number(cfg.team_s1_bis), s2b = Number(cfg.team_s2_bis);
    const satz = bonnAe <= s1b ? Number(cfg.team_s1) : bonnAe <= s2b ? Number(cfg.team_s2) : Number(cfg.team_s3);
    const nextThresh = bonnAe <= s1b ? s1b : bonnAe <= s2b ? s2b : null;
    const nextSatz = bonnAe <= s1b ? Number(cfg.team_s2) : bonnAe <= s2b ? Number(cfg.team_s3) : null;
    const emp = await db.get(`SELECT name FROM employees WHERE id=${q1(1)}`, [cfg.team_empfaenger_id]);
    team = { employee_id: +cfg.team_empfaenger_id, name: emp?.name, monthAe: round2(bonnAe), satz,
      restBisNext: nextThresh ? round2(nextThresh - bonnAe) : 0, nextSatz };
  }
  return { km, closers, team };
}

// Idempotentes Sicherheitsnetz (Cron): rechnet die Live-Staffel für alle In-Scope-Kalendermonate nach.
// Fängt ab, was der event-getriebene Trigger evtl. verpasst hat; bucht nur fehlende Deltas.
async function materialisiereNachtraege(stichtag) {
  const today = stichtag || heute();
  const goLive = await goLiveDatum();
  const monate = (await db.all(
    `SELECT DISTINCT ${ymExpr('gewonnen_datum')} km FROM deals_nk WHERE status='Gewonnen' AND ${ymdExpr('gewonnen_datum')} >= ${q1(1)}`, [goLive]))
    .map(r => r.km).filter(Boolean);
  for (const km of monate) {
    const closer = await db.all(
      `SELECT DISTINCT d.closer_id id FROM deals_nk d JOIN employees e ON e.id=d.closer_id
        WHERE d.status='Gewonnen' AND ${ymExpr('d.gewonnen_datum')}=${q1(1)} AND e.standort IN ('Bonn','Braunschweig')`, [km]);
    for (const c of closer) await aktualisiereCloserStaffel(c.id, km, today);
    await aktualisiereTeamStaffel(km, today);
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

// Zeitraum abschliessen: Buchungen einfrieren, Status setzen, Folgeperiode anlegen. Idempotenz-sicher
// (nur 'offen' schliessbar). stichtag ueberschreibbar fuer Tests; die Route ruft ohne (=> heute()).
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
  const n = periodFor(`${z.bis.slice(0, 8)}21`);      // Folgeperiode: bis ist immer ein 20. -> Folgetag = 21.
  const neu = await getOrCreateZeitraum(n.von, n.bis);
  return { abgeschlossen: { ...z, status: 'abgeschlossen', abgeschlossen_am: today, abgeschlossen_von: userId ?? null }, neuerZeitraum: neu };
}

module.exports = { provisionSync, materialisiereNachtraege, backfillLaufend, projektionLaufend, abschliesseZeitraum, staffelStatus, periodFor, labelFor, kalendermonatFor, configFor, getOrCreateZeitraum };
