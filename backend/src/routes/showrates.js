// Show Rates (Close) — Opener/Setter. READ-ONLY-Auswertung der lokal gespiegelten Close-Status-Historie.
// Datenbasis: termine (abgeleitet in utils/closeSync.js). Siehe docs/close-discovery.md Rev. 2.
//
// Kernregel der Quote: Nur Termine mit eindeutigem Ausgang zaehlen.
//   Show-Rate = stattgefunden / (stattgefunden + nicht_stattgefunden)
// 'offen' (Ausgang noch nicht nachgetragen), 'unklar' (direkt auf Lost/Blacklist) und
// 'verschoben' bleiben bewusst DRAUSSEN — sie wuerden die Quote sonst kuenstlich druecken.
// Ihre Zahl steht im Datenqualitaets-Panel, damit die Luecke sichtbar ist statt die Quote
// zu verfaelschen.
//
// QUOTE UND GATE RECHNEN AUF VERSCHIEDENEN MENGEN — das ist Absicht, kein Versehen:
//   Quote = stattgefunden / (stattgefunden + nicht_stattgefunden)
//   Gate  = (stattgefunden + nicht_stattgefunden + VERSCHOBEN) / gelegt
// 'verschoben' ist quotenneutral, aber ein GEPFLEGTER Ausgang. Wer eine Verschiebung
// dokumentiert, hat seine Arbeit getan und darf den Monat nicht unter die 50-%-Schwelle
// druecken. 'offen' und 'unklar' zaehlen dagegen in keiner der beiden Mengen: dort fehlt die
// Pflege bzw. der Rueckschluss.
const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { requireFeature } = require('../middleware/requireFeature');
const { logAudit } = require('../utils/audit');

router.use(requireAuth);
router.use(requireFeature('show_rates_close'));

const pg = () => db.dialect === 'postgres';
const P = (i) => pg() ? `$${i}` : '?';
// Muss dieselbe Zeitzone treffen wie termine.monat (dort Europe/Berlin, siehe closeSync.js),
// sonst weichen Abdeckung und Quote an Monatsgrenzen voneinander ab.
const ymExpr = (c) => pg() ? `to_char(${c} AT TIME ZONE 'Europe/Berlin', 'YYYY-MM')` : `substr(${c}, 1, 7)`;
const NOW = () => pg() ? 'NOW()' : `datetime('now')`;

// Ab wann ist eine Quote belastbar? Entscheidend ist, welcher ANTEIL der gelegten Termine
// ueberhaupt einen nachgetragenen Ausgang hat. Bleibt die Haelfte offen, ist die Quote nur
// eine Aussage ueber die selbst gewaehlte Teilmenge der gepflegten Termine.
// (Frueher wurde hierfuer die Opportunity-Abdeckung gegen die Lead-Ebene benutzt — untauglich,
//  seit fuer nahezu jeden Termin eine Opportunity existiert; die Kennzahl ueberschritt 100 %.)
const MIN_BEWERTET = 50;     // Prozent der gelegten Termine mit Ausgang
const MIN_BASIS    = 10;     // und mindestens 10 bewertbare Termine im Monat

const quote = (ja, nein) => (ja + nein) > 0 ? Number((ja / (ja + nein) * 100).toFixed(1)) : null;
const leer = () => ({ gelegt: 0, stattgefunden: 0, nicht_stattgefunden: 0, offen: 0, unklar: 0,
  verschoben: 0, basis: 0, gepflegt: 0, rate: null });
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
    z.basis = z.stattgefunden + z.nicht_stattgefunden;          // Nenner der QUOTE
    z.gepflegt = z.basis + z.verschoben;                        // Nenner des GATES
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
    const z = m[art];
    // Gate auf `gepflegt`, nicht auf `basis` — siehe Kopfkommentar: 'verschoben' ist gepflegt.
    z.bewertetQuote = z.gelegt > 0 ? Number((z.gepflegt / z.gelegt * 100).toFixed(1)) : null;
    z.belastbar = !!(z.basis >= MIN_BASIS && z.bewertetQuote !== null && z.bewertetQuote >= MIN_BEWERTET);
  }
  const letzterSync = await db.get(`SELECT MAX(synced_at) s FROM close_status_events`);
  res.json({ monate, abdeckung: abd, letzterSync: letzterSync?.s || null,
    schwellen: { minBewertetProzent: MIN_BEWERTET, minBasis: MIN_BASIS } });
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
  // Unbekannte Status: faellt auf, sobald in Close ein Status ergaenzt wird, den das Mapping
  // nicht kennt. Ohne diese Anzeige wuerden solche Termine still aus der Quote verschwinden.
  const { BEKANNT } = require('../utils/closeSync');
  const gesehen = await db.all(
    `SELECT new_status_id id, MAX(new_status_label) label, COUNT(*) n FROM close_status_events
      WHERE typ='opportunity' AND new_status_id IS NOT NULL GROUP BY new_status_id`);
  const unbekannteStatus = gesehen.filter(r => !BEKANNT.has(r.id))
    .map(r => ({ status_id: r.id, label: r.label, n: Number(r.n) }));
  const herkunft = await db.all(`SELECT herkunft, art, COUNT(*) n FROM termine GROUP BY herkunft, art`);

  // ── Rueck-Terminierungen nach No-Show/Abgesagt ─────────────────────────────
  // Kein Pranger, sondern Sichtbarkeit: Ein geplatzter Termin, der neu gelegt wird, ist normal
  // und richtig. Auffaellig wird erst eine HAEUFUNG bei einer Person — und die soll man sehen,
  // bevor im November jemand eine Reise an einer Show-Rate festmacht.
  //
  // Gezaehlt wird ueber die Opportunity: ein negativer Termin, auf den bei derselben Opportunity
  // und derselben Art ein SPAETER gelegter Termin folgt. Der Bezug laeuft ueber gelegt_am,
  // nicht ueber die Event-Reihenfolge — die steht in termine nicht zur Verfuegung.
  const rueckTerminierungen = await db.all(
    `SELECT COALESCE(e.name, t.gelegt_von_name, '∅ unbekannt') name, t.art,
            COUNT(*) rueck,
            (SELECT COUNT(*) FROM termine x
              WHERE x.status = 'nicht_stattgefunden' AND x.art = t.art
                AND COALESCE(x.employee_id, -1) = COALESCE(t.employee_id, -1)) negativ
       FROM termine t
       LEFT JOIN employees e ON e.id = t.employee_id
      WHERE t.status = 'nicht_stattgefunden'
        AND EXISTS (SELECT 1 FROM termine n
                     WHERE n.close_opportunity_id = t.close_opportunity_id
                       AND n.art = t.art AND n.gelegt_am > t.gelegt_am)
      GROUP BY 1, 2, t.employee_id
      ORDER BY 3 DESC`);

  res.json({
    offenJePerson,
    offenGesamt: offenAlt.length,
    aeltesteOffene: offenAlt.slice(0, 25),
    termineOhneZuordnung: ohneZuordnung,
    closeUserOhneMapping: offeneUser,
    abdeckung: await abdeckung(),
    unbekannteStatus,
    herkunft,
    rueckTerminierungen: rueckTerminierungen.map(r => ({
      name: r.name, art: r.art, rueck: Number(r.rueck), negativ: Number(r.negativ),
      anteil: Number(r.negativ) > 0 ? Number((Number(r.rueck) / Number(r.negativ) * 100).toFixed(1)) : null,
    })),
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

// POST /api/showrates/sync — manueller Sync.
//
// BERECHTIGUNG: bewusst KEIN requireRole mehr. Der Router traegt oben requireFeature('show_rates_close');
// wer den Bereich sehen darf (ueber die Rolle ODER eine Einzel-Freischaltung in feature_flag_users),
// darf ihn auch aktualisieren. Der Sync ist read-only gegen Close und schreibt nur in die eigenen
// close_*-Tabellen — er kann keine Geschaeftsdaten veraendern. Der Button ist nur die Sichtbarkeit;
// durchgesetzt wird hier.
//
// ASYNCHRON: runSync dauert beim Voll-Backfill ~70 s und lief so in den 20-s-Timeout des Clients
// ("fehlgeschlagen", obwohl er im Hintergrund weiterlief). Daher 202 + Status-Polling.
router.post('/sync', wrap(async (req, res) => {
  const { since } = req.body || {};
  if (since && !/^\d{4}-\d{2}-\d{2}$/.test(since)) return res.status(400).json({ error: 'since muss YYYY-MM-DD sein' });
  if (!process.env.CLOSE_API_KEY) return res.status(503).json({ error: 'Kein Close-API-Key konfiguriert' });

  const job = require('../utils/closeSyncJob');
  // Superadmin umgeht den Cooldown (Debugging/Nachfassen), alle anderen nicht.
  const r = await job.starten({
    since: since || null,
    ausgeloestVon: 'manuell',
    user: req.user,
    cooldownUmgehen: req.user?.role === 'superadmin',
  });

  if (!r.ok && r.grund === 'laeuft') {
    return res.status(409).json({ error: 'Sync läuft bereits', grund: 'laeuft',
      runId: r.runId, gestartetAm: r.gestartetAm });
  }
  if (!r.ok && r.grund === 'cooldown') {
    return res.status(429).json({ error: 'Zuletzt erfolgreich synchronisiert — bitte kurz warten',
      grund: 'cooldown', restSek: r.restSek, letzterLauf: r.letzterLauf, cooldownMin: job.COOLDOWN_MIN });
  }

  await logAudit({ user: req.user, action: 'close_sync', entityType: 'showrates', entityId: r.runId,
    newData: { since: since || null, ausgeloest_von: 'manuell' } });

  res.status(202).json({ ok: true, runId: r.runId, gestartetAm: r.gestartetAm, status: 'laeuft' });
}));

// GET /api/showrates/sync/status — Fortschritt des laufenden Laufs + Historie (auch die Cron-Laeufe).
router.get('/sync/status', wrap(async (req, res) => {
  const job = require('../utils/closeSyncJob');
  res.json(await job.status({ historie: Math.min(Number(req.query.historie) || 10, 50) }));
}));

module.exports = router;
