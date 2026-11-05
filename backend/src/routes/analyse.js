// Wochenanalyse Bonn: Admin-Endpoints (Laeufe anstossen/nachholen, Status, Versandmodus) und
// die Verbleib-Ansicht fuer das Dashboard.
//   /api/admin/analyse/*  — nur Superadmin
//   /api/verbleib*        — Feature 'vertriebsanalyse' (Superadmin immer)
const express = require('express');
const db = require('../db');
const wrap = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { requireFeature } = require('../middleware/requireFeature');
const { logAudit } = require('../utils/audit');

const datum = (v) => (v && /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : null);
const P = (i) => (db.dialect === 'postgres' ? `$${i}` : '?');

// ── Admin ────────────────────────────────────────────────────────────────────────────────
const admin = express.Router();
admin.use(requireAuth, requireRole('superadmin'));

admin.get('/status', wrap(async (req, res) => {
  const job = require('../analyse/job');
  const { setting } = require('../analyse/basis');
  const laeufe = await db.all(`SELECT id, typ, ausgeloest_von, user_name, zeitraum_von, zeitraum_bis, status, gestartet_am, beendet_am, abdeckung, fehler, kosten_usd
                                 FROM analyse_runs ORDER BY gestartet_am DESC LIMIT 40`);
  const batches = await db.all(`SELECT * FROM analyse_batches ORDER BY eingereicht_am DESC LIMIT 20`);
  const auftraege = await db.all(`SELECT quelle, status, COUNT(*) n FROM codier_auftraege GROUP BY quelle, status ORDER BY quelle, status`);
  const reports = await db.all(`SELECT id, jahr, kw, woche_von, woche_bis, modus, empfaenger, anzahl_codiert_woche, nicht_vollstaendig, offen_ungecodiert,
                                       kosten_codierung_usd, kosten_texte_usd, kosten_gesamt_usd, versand_status, versendet_am, fehler, erstellt_am
                                  FROM weekly_reports ORDER BY erstellt_am DESC LIMIT 20`);
  // Nur ob etwas gesetzt ist — nie Werte.
  const konfiguration = { anthropic: !!process.env.ANTHROPIC_API_KEY, fireflies: !!process.env.FIREFLIES_API_KEY,
    mail: process.env.RESEND_API_KEY ? 'resend' : process.env.SMTP_HOST ? 'smtp' : 'keiner', absender: !!process.env.SMTP_FROM };
  res.json({ versandModus: await setting('versand_modus', 'test'), konfiguration, laufend: job.status(), laeufe, batches, auftraege, reports });
}));

admin.get('/laeufe/:id', wrap(async (req, res) => {
  const r = await db.get(`SELECT * FROM analyse_runs WHERE id=${P(1)}`, [Number(req.params.id)]);
  if (!r) return res.status(404).json({ error: 'Lauf nicht gefunden' });
  res.json(r);
}));

// Laeufe starten: antworten sofort (202), der Lauf protokolliert sich in analyse_runs.
const starte = (fn) => (req, res) => {
  const p = fn(req);
  p.then(r => { if (r && r.ok === false && r.grund === 'laeuft') console.log('[analyse] Lauf laeuft bereits'); }).catch(() => {});
  res.status(202).json({ gestartet: true, hinweis: 'Fortschritt unter GET /api/admin/analyse/status' });
};

admin.post('/codierung', wrap(async (req, res) => {
  const { von, bis } = req.body || {};
  if ((von && !datum(von)) || (bis && !datum(bis))) return res.status(400).json({ error: 'von/bis als YYYY-MM-DD' });
  starte(() => require('../analyse/job').codierlauf({ von: datum(von), bis: datum(bis), ausgeloestVon: 'manuell', user: req.user }))(req, res);
}));

admin.post('/einsammeln', (req, res) => starte(() => require('../analyse/job').einsammeln({ ausgeloestVon: 'manuell' }))(req, res));

admin.post('/verbleib', wrap(async (req, res) => {
  const stichtag = datum((req.body || {}).stichtag) || undefined;
  starte(() => require('../analyse/job').verbleiblauf({ stichtag, ausgeloestVon: 'manuell', user: req.user }))(req, res);
}));

admin.post('/report', wrap(async (req, res) => {
  const { stichtag, von, bis, modus } = req.body || {};
  if (![undefined, null, 'test', 'live', 'ohne_versand'].includes(modus)) return res.status(400).json({ error: 'modus: test | live | ohne_versand' });
  if ((von && !datum(von)) || (bis && !datum(bis)) || (stichtag && !datum(stichtag))) return res.status(400).json({ error: 'Datumsangaben als YYYY-MM-DD' });
  if (!!von !== !!bis) return res.status(400).json({ error: 'von und bis nur gemeinsam' });
  // Live-Versand an alle drei nur, wenn er freigegeben ist (versand_modus = live).
  const { setting } = require('../analyse/basis');
  if (modus === 'live' && (await setting('versand_modus', 'test')) !== 'live') {
    return res.status(409).json({ error: 'Live-Versand ist noch nicht freigegeben (versand_modus = test).' });
  }
  starte(() => require('../analyse/job').reportlauf({ stichtag: datum(stichtag) || undefined, von: datum(von), bis: datum(bis),
    modus: modus || null, ausgeloestVon: 'manuell', user: req.user }))(req, res);
}));

admin.put('/versand-modus', wrap(async (req, res) => {
  const { modus } = req.body || {};
  if (!['test', 'live'].includes(modus)) return res.status(400).json({ error: 'modus: test | live' });
  const { setzeSetting, setting } = require('../analyse/basis');
  const alt = await setting('versand_modus', 'test');
  await setzeSetting('versand_modus', modus, req.user.name || req.user.email);
  await logAudit({ user: req.user, action: 'update', entityType: 'analyse_versand_modus', entityId: null, oldData: { modus: alt }, newData: { modus } });
  res.json({ versandModus: modus });
}));

// ── Verbleib-Ansicht ─────────────────────────────────────────────────────────────────────
const verbleib = express.Router();
verbleib.use(requireAuth, requireFeature('vertriebsanalyse'));

async function verbleibDaten(stand) {
  const V = require('../analyse/verbleib');
  const { berichtswoche, heute } = require('../analyse/basis');
  const snap = await V.ladeSnapshot(stand);
  const st = snap.stand || heute();
  const w = berichtswoche(st);
  const woche = { von: w.von, bis: w.bis };
  const monat = { von: st.slice(0, 7) + '-01', bis: st };
  const staende = (await db.all(`SELECT DISTINCT stand_datum FROM verbleib_snapshot ORDER BY stand_datum DESC LIMIT 60`)).map(r => require('../analyse/basis').ymd(r.stand_datum));
  return { stand: snap.stand, staende, zeilen: V.jeOpportunity(snap.zeilen).map(({ _setterName, _closerName, ...z }) => z),
    kennzahlen: { woche: V.kennzahlen(snap.zeilen, woche), monat: V.kennzahlen(snap.zeilen, monat) } };
}

verbleib.get('/', wrap(async (req, res) => res.json(await verbleibDaten(datum(req.query.stand)))));

verbleib.get('/export.xlsx', wrap(async (req, res) => {
  const d = await verbleibDaten(datum(req.query.stand));
  const V = require('../analyse/verbleib');
  const snap = await V.ladeSnapshot(d.stand);
  const buf = await require('../analyse/excel').verbleibXlsx({ verbleib: { zeilen: snap.zeilen, woche: d.kennzahlen.woche, monat: d.kennzahlen.monat } });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="Verbleib_Bonn_${d.stand || 'leer'}.xlsx"`);
  res.send(Buffer.from(buf));
}));

module.exports = { admin, verbleib };
