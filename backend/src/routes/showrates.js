// Show Rates (Close) — Opener/Setter. READ-ONLY-Auswertung der lokal gespiegelten Close-Status-Historie.
// Datenbasis: termine (abgeleitet in utils/closeSync.js). Siehe docs/close-discovery.md Rev. 2.
//
// Kernregel der Quote: Nur Termine mit eindeutigem Ausgang zaehlen.
//   Show-Rate = stattgefunden / (stattgefunden + nicht_stattgefunden)
// 'offen' (Ausgang noch nicht nachgetragen) und 'unklar' (direkt auf Lost/Blacklist) bleiben
// bewusst DRAUSSEN — sie wuerden die Quote sonst kuenstlich druecken. Ihre Zahl steht im
// Datenqualitaets-Panel, damit die Luecke sichtbar ist statt die Quote zu verfaelschen.
const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { requireFeature } = require('../middleware/requireFeature');

router.use(requireAuth);
router.use(requireFeature('show_rates_close'));

const pg = () => db.dialect === 'postgres';
const P = (i) => pg() ? `$${i}` : '?';
// Muss dieselbe Zeitzone treffen wie termine.monat (dort Europe/Berlin, siehe closeSync.js),
// sonst weichen Abdeckung und Quote an Monatsgrenzen voneinander ab.
const ymExpr = (c) => pg() ? `to_char(${c} AT TIME ZONE 'Europe/Berlin', 'YYYY-MM')` : `substr(${c}, 1, 7)`;
const NOW = () => pg() ? 'NOW()' : `datetime('now')`;

// Ab welcher Basis gilt eine Opener-Quote als belastbar? Solange die Settings ueberwiegend nur
// auf Lead-Ebene laufen (Opportunity fehlt), ist die Stichprobe nicht repraesentativ.
const MIN_ABDECKUNG = 0.5;   // 50 % der Lead-Settings brauchen eine Opportunity
const MIN_BASIS     = 10;    // und mindestens 10 bewertbare Termine im Monat

const quote = (ja, nein) => (ja + nein) > 0 ? Number((ja / (ja + nein) * 100).toFixed(1)) : null;
const leer = () => ({ gelegt: 0, stattgefunden: 0, nicht_stattgefunden: 0, offen: 0, unklar: 0, basis: 0, rate: null });
function fasse(rows) {
  const out = {};
  for (const r of rows) {
    const m = (out[r.monat] = out[r.monat] || { monat: r.monat, setting: leer(), closing: leer() });
    const z = m[r.art]; if (!z) continue;
    const n = Number(r.n) || 0;
    z[r.status] = (z[r.status] || 0) + n;
    z.gelegt += n;
  }
  for (const m of Object.values(out)) for (const art of ['setting', 'closing']) {
    const z = m[art];
    z.basis = z.stattgefunden + z.nicht_stattgefunden;
    z.rate = quote(z.stattgefunden, z.nicht_stattgefunden);
  }
  return Object.values(out).sort((a, b) => a.monat.localeCompare(b.monat));
}

// Abdeckung: Wie viele der auf LEAD-Ebene terminierten Settings/Closings haben ueberhaupt eine
// Opportunity (und damit einen auswertbaren Ausgang)? Das ist die Gueltigkeitsgrenze der Quote.
async function abdeckung() {
  const lead = await db.all(
    `SELECT ${ymExpr('date_created')} monat,
            CASE WHEN new_status_label LIKE 'Setting terminiert aus%' THEN 'setting' ELSE 'closing' END art,
            COUNT(DISTINCT lead_id) n
       FROM close_status_events
      WHERE typ='lead' AND (new_status_label LIKE 'Setting terminiert aus%' OR new_status_label LIKE 'Closing terminiert aus%')
      GROUP BY 1, 2`);
  const opp = await db.all(`SELECT monat, art, COUNT(DISTINCT close_lead_id) n FROM termine GROUP BY monat, art`);
  const out = {};
  for (const r of lead) { const k = `${r.monat}|${r.art}`; out[k] = { monat: r.monat, art: r.art, lead: Number(r.n), opp: 0 }; }
  for (const r of opp) { const k = `${r.monat}|${r.art}`; out[k] = out[k] || { monat: r.monat, art: r.art, lead: 0, opp: 0 }; out[k].opp = Number(r.n); }
  for (const v of Object.values(out)) v.quote = v.lead > 0 ? Number((v.opp / v.lead * 100).toFixed(1)) : null;
  return Object.values(out);
}

// GET /api/showrates/overview — Monatsreihe + Belastbarkeits-Flag je Monat/Art
router.get('/overview', wrap(async (req, res) => {
  const rows = await db.all(`SELECT monat, art, status, COUNT(*) n FROM termine GROUP BY monat, art, status`);
  const monate = fasse(rows);
  const abd = await abdeckung();
  const abdIdx = Object.fromEntries(abd.map(a => [`${a.monat}|${a.art}`, a]));
  for (const m of monate) for (const art of ['setting', 'closing']) {
    const a = abdIdx[`${m.monat}|${art}`];
    m[art].abdeckung = a ? a.quote : null;
    m[art].leadTermine = a ? a.lead : null;
    // Belastbar nur bei ausreichender Abdeckung UND ausreichender Basis.
    m[art].belastbar = !!(m[art].basis >= MIN_BASIS && a && a.quote !== null && a.quote >= MIN_ABDECKUNG * 100);
  }
  const letzterSync = await db.get(`SELECT MAX(synced_at) s FROM close_status_events`);
  res.json({ monate, abdeckung: abd, letzterSync: letzterSync?.s || null,
    schwellen: { minAbdeckungProzent: MIN_ABDECKUNG * 100, minBasis: MIN_BASIS } });
}));

// GET /api/showrates/personen?monat=YYYY-MM — je Mitarbeiter (Attribution = wer den Status setzte)
router.get('/personen', wrap(async (req, res) => {
  const { monat } = req.query;
  const w = monat ? ` WHERE t.monat = ${P(1)}` : '';
  const rows = await db.all(
    `SELECT t.art, t.status, COUNT(*) n,
            COALESCE(e.name, t.gelegt_von_name, '∅ unbekannt') name, t.employee_id, t.close_user_id
       FROM termine t LEFT JOIN employees e ON e.id = t.employee_id${w}
      GROUP BY t.art, t.status, COALESCE(e.name, t.gelegt_von_name, '∅ unbekannt'), t.employee_id, t.close_user_id`,
    monat ? [monat] : []);
  const out = {};
  for (const r of rows) {
    const k = `${r.name}|${r.art}`;
    const p = (out[k] = out[k] || { name: r.name, employee_id: r.employee_id, close_user_id: r.close_user_id,
      art: r.art, ...leer() });
    const n = Number(r.n) || 0;
    p[r.status] = (p[r.status] || 0) + n; p.gelegt += n;
  }
  const liste = Object.values(out).map(p => ({ ...p, basis: p.stattgefunden + p.nicht_stattgefunden,
    rate: quote(p.stattgefunden, p.nicht_stattgefunden) }))
    .sort((a, b) => b.gelegt - a.gelegt);
  res.json(liste);
}));

// GET /api/showrates/quellen?monat=YYYY-MM — je Kanal (MailMarketing / FAX Leads / Post)
router.get('/quellen', wrap(async (req, res) => {
  const { monat } = req.query;
  const w = monat ? ` WHERE monat = ${P(1)}` : '';
  const rows = await db.all(
    `SELECT COALESCE(quelle, '∅ ohne Kanal') quelle, art, status, COUNT(*) n FROM termine${w}
      GROUP BY COALESCE(quelle, '∅ ohne Kanal'), art, status`, monat ? [monat] : []);
  const out = {};
  for (const r of rows) {
    const k = `${r.quelle}|${r.art}`;
    const q = (out[k] = out[k] || { quelle: r.quelle, art: r.art, ...leer() });
    const n = Number(r.n) || 0; q[r.status] = (q[r.status] || 0) + n; q.gelegt += n;
  }
  res.json(Object.values(out).map(q => ({ ...q, basis: q.stattgefunden + q.nicht_stattgefunden,
    rate: quote(q.stattgefunden, q.nicht_stattgefunden) })).sort((a, b) => b.gelegt - a.gelegt));
}));

// GET /api/showrates/qualitaet — die Luecken, nach denen gearbeitet werden muss
router.get('/qualitaet', wrap(async (req, res) => {
  const offenJePerson = await db.all(
    `SELECT COALESCE(e.name, t.gelegt_von_name, '∅ unbekannt') name, t.art, COUNT(*) n
       FROM termine t LEFT JOIN employees e ON e.id = t.employee_id
      WHERE t.status = 'offen' GROUP BY 1, 2 ORDER BY 3 DESC`);
  const offenAlt = await db.all(
    `SELECT close_opportunity_id, close_lead_id, art, gelegt_am, gelegt_von_name
       FROM termine WHERE status='offen' ORDER BY gelegt_am ASC`);
  const ohneZuordnung = await db.all(
    `SELECT close_user_id, gelegt_von_name, COUNT(*) n FROM termine
      WHERE employee_id IS NULL GROUP BY close_user_id, gelegt_von_name ORDER BY 3 DESC`);
  const offeneUser = await db.all(
    `SELECT close_user_id, close_name, close_email FROM close_user_map
      WHERE employee_id IS NULL AND ignorieren = ${pg() ? 'FALSE' : '0'} ORDER BY close_name`);
  res.json({
    offenJePerson,
    offenGesamt: offenAlt.length,
    aeltesteOffene: offenAlt.slice(0, 25),
    termineOhneZuordnung: ohneZuordnung,
    closeUserOhneMapping: offeneUser,
    abdeckung: await abdeckung(),
  });
}));

// GET /api/showrates/mapping — Close-User-Zuordnung (nur Admin/Superadmin)
router.get('/mapping', requireRole('admin'), wrap(async (req, res) => {
  res.json(await db.all(
    `SELECT m.close_user_id, m.close_name, m.close_email, m.employee_id, m.ignorieren, m.auto_zugeordnet,
            e.name AS employee_name
       FROM close_user_map m LEFT JOIN employees e ON e.id = m.employee_id
      ORDER BY m.close_name`));
}));

// PATCH /api/showrates/mapping/:closeUserId — Zuordnung setzen/aufheben, Konto ignorieren
router.patch('/mapping/:closeUserId', requireRole('admin'), wrap(async (req, res) => {
  const { employee_id, ignorieren } = req.body || {};
  const setzeEmp = Object.prototype.hasOwnProperty.call(req.body || {}, 'employee_id');
  const setzeIgn = Object.prototype.hasOwnProperty.call(req.body || {}, 'ignorieren');
  if (!setzeEmp && !setzeIgn) return res.status(400).json({ error: 'employee_id oder ignorieren erforderlich' });
  if (setzeEmp) {
    await db.run(`UPDATE close_user_map SET employee_id=${P(1)}, auto_zugeordnet=${pg() ? 'FALSE' : '0'}, updated_at=${NOW()} WHERE close_user_id=${P(2)}`,
      [employee_id || null, req.params.closeUserId]);
  }
  if (setzeIgn) {
    const v = pg() ? !!ignorieren : (ignorieren ? 1 : 0);
    await db.run(`UPDATE close_user_map SET ignorieren=${P(1)}, updated_at=${NOW()} WHERE close_user_id=${P(2)}`,
      [v, req.params.closeUserId]);
  }
  // Zuordnung wirkt sofort auf die bereits abgeleiteten Termine.
  const { deriveTermine } = require('../utils/closeSync');
  try { await deriveTermine(); } catch (e) { console.error('[showrates] Re-Derive:', e.message); }
  res.json(await db.get(`SELECT * FROM close_user_map WHERE close_user_id=${P(1)}`, [req.params.closeUserId]));
}));

// POST /api/showrates/sync — manueller Sync (Admin/Superadmin). since=YYYY-MM-DD fuer Backfill.
router.post('/sync', requireRole('admin'), wrap(async (req, res) => {
  const { since } = req.body || {};
  if (since && !/^\d{4}-\d{2}-\d{2}$/.test(since)) return res.status(400).json({ error: 'since muss YYYY-MM-DD sein' });
  const { runSync } = require('../utils/closeSync');
  try {
    const r = await runSync({ since, log: (m) => console.log(m) });
    res.json({ ok: true, ...r });
  } catch (e) {
    console.error('[showrates] Sync fehlgeschlagen:', e.message);
    res.status(502).json({ ok: false, error: e.message });
  }
}));

module.exports = router;
