const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { requireFeature } = require('../middleware/requireFeature');
const { logAudit } = require('../utils/audit');
const { projektionLaufend, backfillLaufend } = require('../utils/provisionen');

// ─────────────────────────────────────────────────────────────────────────────
// Provisionen (NK, Bonn/Braunschweig) — READ-APIs. Modul liest nur, das Ledger
// (provision_*) wird ausschliesslich von der Engine im NK-Write-Hook gepflegt.
// Sichtbarkeit: requireFeature('provisionen') (leeres Flag = nur Superadmin).
//   /me                     eigene Provision (serverseitig auf req.user.employee_id begrenzt)
//   /zeitraeume             Abrechnungszeitraeume (Auswahl)
//   /admin/overview         Gesamtuebersicht je Zeitraum (Admin/Vertriebsleitung)
//   /admin/employee/:id     Einzeldetail (Admin/Vertriebsleitung)
//   /config                 Saetze/Schwellen (Admin, read)
//   /admin/backfill[/…]     laufenden Zeitraum initialisieren (nur Superadmin)
// ─────────────────────────────────────────────────────────────────────────────

const P  = db.dialect === 'postgres';
const ph = i => (P ? `$${i}` : '?');
const num = n => Number(n) || 0;
const round2 = n => Math.round((Number(n) || 0) * 100) / 100;
const heute = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

router.use(requireAuth);
router.use(requireFeature('provisionen'));

// Zeitraum bestimmen: expliziter (validierter) Query-Param oder der laufende (von <= heute, neuester).
async function resolveZeitraum(zeitraumId) {
  const zid = zeitraumId != null && zeitraumId !== '' ? Number(zeitraumId) : null;
  if (zid) return db.get(`SELECT * FROM provision_zeitraeume WHERE id=${ph(1)}`, [zid]);
  const cur = await db.get(`SELECT * FROM provision_zeitraeume WHERE von <= ${ph(1)} ORDER BY von DESC LIMIT 1`, [heute()]);
  return cur || db.get(`SELECT * FROM provision_zeitraeume ORDER BY von DESC LIMIT 1`);
}

// Buchungen + Zusammenfassung eines Mitarbeiters in einem Zeitraum.
async function detailFor(employeeId, z) {
  const buchungen = await db.all(
    `SELECT id, deal_id, rolle, typ, satz, bemessungsgrundlage, betrag, kalendermonat, gewonnen_datum, beschreibung, eingefroren, created_at
       FROM provision_buchungen WHERE employee_id=${ph(1)} AND zeitraum_id=${ph(2)} ORDER BY created_at, id`,
    [employeeId, z.id]);
  const perTyp = {}; let summe = 0;
  for (const b of buchungen) { const be = num(b.betrag); summe += be; perTyp[b.typ] = round2(num(perTyp[b.typ]) + be); b.betrag = be; }
  return { summe: round2(summe), perTyp, buchungen };
}

// ── Abrechnungszeitraeume ──
router.get('/zeitraeume', wrap(async (req, res) => {
  res.json(await db.all(`SELECT id, von, bis, label, status, abgeschlossen_am FROM provision_zeitraeume ORDER BY von DESC`));
}));

// ── Eigene Provision (Mitarbeiter) — NUR eigene Daten, serverseitig erzwungen ──
router.get('/me', wrap(async (req, res) => {
  const empId = req.user.employee_id;
  if (!empId) return res.json({ employee: null, zeitraum: null, summe: 0, perTyp: {}, buchungen: [], hinweis: 'Kein Mitarbeiter mit diesem Account verknüpft.' });
  const z = await resolveZeitraum(req.query.zeitraum_id);
  const emp = await db.get(`SELECT id, name, standort FROM employees WHERE id=${ph(1)}`, [empId]);
  if (!z) return res.json({ employee: emp, zeitraum: null, summe: 0, perTyp: {}, buchungen: [] });
  res.json({ employee: emp, zeitraum: z, ...(await detailFor(empId, z)) });
}));

// ── Admin/Vertriebsleitung: Gesamtuebersicht + Einzeldetail ──
const adminOnly = requireRole('admin', 'vertriebsleitung');

router.get('/admin/overview', adminOnly, wrap(async (req, res) => {
  const z = await resolveZeitraum(req.query.zeitraum_id);
  if (!z) return res.json({ zeitraum: null, gesamt: 0, zeilen: [] });
  const rows = await db.all(
    `SELECT b.employee_id, e.name, e.standort, COALESCE(SUM(b.betrag),0) summe
       FROM provision_buchungen b LEFT JOIN employees e ON e.id=b.employee_id
      WHERE b.zeitraum_id=${ph(1)} GROUP BY b.employee_id, e.name, e.standort ORDER BY summe DESC`, [z.id]);
  const zeilen = rows.map(r => ({ employee_id: r.employee_id, name: r.name, standort: r.standort, summe: round2(num(r.summe)) }));
  res.json({ zeitraum: z, gesamt: round2(zeilen.reduce((a, r) => a + r.summe, 0)), zeilen });
}));

router.get('/admin/employee/:id', adminOnly, wrap(async (req, res) => {
  const z = await resolveZeitraum(req.query.zeitraum_id);
  const emp = await db.get(`SELECT id, name, standort FROM employees WHERE id=${ph(1)}`, [Number(req.params.id)]);
  if (!z) return res.json({ employee: emp, zeitraum: null, summe: 0, perTyp: {}, buchungen: [] });
  res.json({ employee: emp, zeitraum: z, ...(await detailFor(Number(req.params.id), z)) });
}));

// ── Konfiguration (Saetze/Schwellen) — Lesen fuer Admin ──
router.get('/config', adminOnly, wrap(async (req, res) => {
  res.json(await db.all(`SELECT * FROM provision_config ORDER BY gueltig_ab DESC`));
}));

// ── Backfill des laufenden Zeitraums (nur Superadmin): erst Dry-Run, dann Commit ──
router.get('/admin/backfill/projektion', requireRole('superadmin'), wrap(async (req, res) => {
  res.json(await projektionLaufend());
}));

router.post('/admin/backfill', requireRole('superadmin'), wrap(async (req, res) => {
  const r = await backfillLaufend();
  await logAudit({ user: req.user, action: 'backfill', entityType: 'provision', entityId: r.goLive, newData: { inScopeDeals: r.inScopeDeals } });
  res.json(r);
}));

module.exports = router;
