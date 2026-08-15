const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { requireFeature } = require('../middleware/requireFeature');
const { logAudit } = require('../utils/audit');
const { projektionLaufend, backfillLaufend, abschliesseZeitraum } = require('../utils/provisionen');

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

// ── Konfiguration (Saetze/Schwellen) — Lesen fuer Admin, Schreiben nur Superadmin ──
router.get('/config', adminOnly, wrap(async (req, res) => {
  res.json(await db.all(`SELECT * FROM provision_config ORDER BY gueltig_ab DESC`));
}));

const CONFIG_COLS = ['opener_satz', 'setter_satz', 'opener_setter_pauschal', 'closer_basis', 'closer_schwelle',
  'closer_hoch', 'team_empfaenger_id', 'team_s1_bis', 'team_s1', 'team_s2_bis', 'team_s2', 'team_s3'];

router.put('/config/:gueltig_ab', requireRole('superadmin'), wrap(async (req, res) => {
  const g = req.params.gueltig_ab;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(g)) return res.status(400).json({ error: 'gueltig_ab muss YYYY-MM-DD sein' });
  const f = req.body || {};
  for (const c of CONFIG_COLS) {
    if (c === 'team_empfaenger_id') continue;
    if (!(Number(f[c]) >= 0)) return res.status(400).json({ error: `${c} muss eine Zahl >= 0 sein` });
  }
  const vals = CONFIG_COLS.map(c => (c === 'team_empfaenger_id' ? (f[c] ? Number(f[c]) : null) : Number(f[c])));
  const allCols = ['gueltig_ab', ...CONFIG_COLS], allVals = [g, ...vals];
  const setClause = CONFIG_COLS.map(c => `${c}=excluded.${c}`).join(', ') + (P ? ', updated_at=NOW()' : ", updated_at=datetime('now')");
  const phs = allCols.map((_, i) => (P ? `$${i + 1}` : '?')).join(',');
  await db.run(`INSERT INTO provision_config (${allCols.join(',')}) VALUES (${phs}) ON CONFLICT (gueltig_ab) DO UPDATE SET ${setClause}`, allVals);
  await logAudit({ user: req.user, action: 'upsert', entityType: 'provision_config', entityId: g, newData: f });
  res.json(await db.get(`SELECT * FROM provision_config WHERE gueltig_ab=${ph(1)}`, [g]));
}));

// ── Zeitraum abschliessen (Admin/Superadmin): einfrieren + Folgeperiode ──
router.post('/admin/zeitraeume/:id/abschluss', requireRole('admin'), wrap(async (req, res) => {
  const r = await abschliesseZeitraum(Number(req.params.id), req.user.id);
  if (r.error === 'not_found') return res.status(404).json({ error: 'Zeitraum nicht gefunden' });
  if (r.error === 'already_closed') return res.status(400).json({ error: 'Zeitraum ist bereits abgeschlossen' });
  if (r.error === 'still_running') return res.status(400).json({ error: `Zeitraum läuft noch bis ${r.bis} — Abschluss erst ab dem Folgetag (21.)` });
  await logAudit({ user: req.user, action: 'abschluss', entityType: 'provision_zeitraum', entityId: Number(req.params.id), newData: { abgeschlossen_am: r.abgeschlossen.abgeschlossen_am } });
  res.json(r);
}));

// ── StB-Export (Admin/Superadmin): CSV je Mitarbeiter mit Aufschlüsselung nach Typ ──
router.get('/admin/zeitraeume/:id/export.csv', requireRole('admin'), wrap(async (req, res) => {
  const z = await db.get(`SELECT * FROM provision_zeitraeume WHERE id=${ph(1)}`, [Number(req.params.id)]);
  if (!z) return res.status(404).json({ error: 'Zeitraum nicht gefunden' });
  const rows = await db.all(
    `SELECT b.employee_id, e.name, e.standort, b.typ, COALESCE(SUM(b.betrag),0) summe
       FROM provision_buchungen b LEFT JOIN employees e ON e.id=b.employee_id
      WHERE b.zeitraum_id=${ph(1)} GROUP BY b.employee_id, e.name, e.standort, b.typ`, [z.id]);
  const TYPEN = ['deal_gewonnen', 'team_provision', 'korrektur', 'storno', 'staffel_nachtrag', 'team_nachtrag'];
  const TYP_LABEL = { deal_gewonnen: 'Gewonnen', team_provision: 'Team', korrektur: 'Korrektur', storno: 'Storno', staffel_nachtrag: 'Staffel-Nachtrag', team_nachtrag: 'Team-Nachtrag' };
  const byEmp = new Map();
  for (const r of rows) {
    if (!byEmp.has(r.employee_id)) byEmp.set(r.employee_id, { name: r.name || `#${r.employee_id}`, standort: r.standort || '', typen: {}, summe: 0 });
    const e = byEmp.get(r.employee_id); e.typen[r.typ] = round2(num(r.summe)); e.summe = round2(e.summe + num(r.summe));
  }
  const esc = v => { const s = String(v ?? ''); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const fmt = n => (Number(n) || 0).toFixed(2).replace('.', ',');            // deutsches Dezimalkomma
  const header = ['Mitarbeiter', 'Standort', 'Zeitraum', ...TYPEN.map(t => TYP_LABEL[t]), 'Summe'];
  const lines = [header.join(';')];
  for (const [, e] of [...byEmp.entries()].sort((a, b) => b[1].summe - a[1].summe)) {
    lines.push([esc(e.name), esc(e.standort), z.label, ...TYPEN.map(t => fmt(e.typen[t] || 0)), fmt(e.summe)].join(';'));
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="provisionen_${z.von}_${z.bis}.csv"`);
  res.send('﻿' + lines.join('\r\n'));                                   // BOM + CRLF fuer Excel
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
