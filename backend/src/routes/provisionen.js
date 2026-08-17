const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { requireFeature } = require('../middleware/requireFeature');
const { logAudit } = require('../utils/audit');
const { projektionLaufend, backfillLaufend, abschliesseZeitraum, staffelStatus, kreisFor } = require('../utils/provisionen');
const KREISE = ['bonn', 'braunschweig', 'oesterreich'];

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

// Zeitraum bestimmen: expliziter (validierter) Query-Param oder der laufende (von <= heute, neuester)
// DES KREISES. Jeder Zeitraum gehoert zu genau einem Abrechnungskreis (bonn/braunschweig/oesterreich).
async function resolveZeitraum(zeitraumId, kreis = 'bonn') {
  const zid = zeitraumId != null && zeitraumId !== '' ? Number(zeitraumId) : null;
  if (zid) return db.get(`SELECT * FROM provision_zeitraeume WHERE id=${ph(1)}`, [zid]);
  const cur = await db.get(`SELECT * FROM provision_zeitraeume WHERE kreis=${ph(1)} AND von <= ${ph(2)} ORDER BY von DESC LIMIT 1`, [kreis, heute()]);
  return cur || db.get(`SELECT * FROM provision_zeitraeume WHERE kreis=${ph(1)} ORDER BY von DESC LIMIT 1`, [kreis]);
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
  const where = KREISE.includes(req.query.kreis) ? ` WHERE kreis=${ph(1)}` : '';
  const params = where ? [req.query.kreis] : [];
  res.json(await db.all(`SELECT id, von, bis, label, status, abgeschlossen_am, kreis FROM provision_zeitraeume${where} ORDER BY kreis, von DESC`, params));
}));

// ── Eigene Provision (Mitarbeiter) — NUR eigene Daten, serverseitig erzwungen ──
router.get('/me', wrap(async (req, res) => {
  const empId = req.user.employee_id;
  if (!empId) return res.json({ employee: null, zeitraum: null, summe: 0, perTyp: {}, buchungen: [], hinweis: 'Kein Mitarbeiter mit diesem Account verknüpft.' });
  const emp = await db.get(`SELECT id, name, standort FROM employees WHERE id=${ph(1)}`, [empId]);
  const kreis = kreisFor(emp?.standort) || 'bonn';                        // eigener Abrechnungskreis
  const z = await resolveZeitraum(req.query.zeitraum_id, kreis);
  const ss = await staffelStatus(heute().slice(0, 7));                    // aktueller Kalendermonat
  const staffel = ss.closers.find(c => c.employee_id === empId) || null;  // eigener Closer-Satz (Bonn/BS)
  const teamStaffel = ss.team && ss.team.employee_id === empId ? ss.team : null;
  const atStaffel = kreis === 'oesterreich'
    ? { opener: ss.atOpener.find(o => o.employee_id === empId) || null, setter: ss.atSetter.find(s => s.employee_id === empId) || null }
    : null;
  if (!z) return res.json({ employee: emp, zeitraum: null, kreis, summe: 0, perTyp: {}, buchungen: [], staffel, teamStaffel, atStaffel });
  res.json({ employee: emp, zeitraum: z, kreis, ...(await detailFor(empId, z)), staffel, teamStaffel, atStaffel });
}));

// ── Admin/Vertriebsleitung: Gesamtuebersicht + Einzeldetail ──
const adminOnly = requireRole('admin', 'vertriebsleitung');

router.get('/admin/overview', adminOnly, wrap(async (req, res) => {
  const kreis = KREISE.includes(req.query.kreis) ? req.query.kreis : 'bonn';
  const z = await resolveZeitraum(req.query.zeitraum_id, kreis);
  if (!z) return res.json({ zeitraum: null, kreis, gesamt: 0, zeilen: [] });
  const rows = await db.all(
    `SELECT b.employee_id, e.name, e.standort, COALESCE(SUM(b.betrag),0) summe
       FROM provision_buchungen b LEFT JOIN employees e ON e.id=b.employee_id
      WHERE b.zeitraum_id=${ph(1)} GROUP BY b.employee_id, e.name, e.standort ORDER BY summe DESC`, [z.id]);
  const zeilen = rows.map(r => ({ employee_id: r.employee_id, name: r.name, standort: r.standort, summe: round2(num(r.summe)) }));
  const staffel = await staffelStatus(heute().slice(0, 7));   // aktueller Monats-Satz je Closer/Team/AT (für Anzeige)
  res.json({ zeitraum: z, kreis, gesamt: round2(zeilen.reduce((a, r) => a + r.summe, 0)), zeilen, staffel });
}));

router.get('/admin/employee/:id', adminOnly, wrap(async (req, res) => {
  const emp = await db.get(`SELECT id, name, standort FROM employees WHERE id=${ph(1)}`, [Number(req.params.id)]);
  const z = await resolveZeitraum(req.query.zeitraum_id, kreisFor(emp?.standort) || 'bonn');
  if (!z) return res.json({ employee: emp, zeitraum: null, summe: 0, perTyp: {}, buchungen: [] });
  res.json({ employee: emp, zeitraum: z, ...(await detailFor(Number(req.params.id), z)) });
}));

// ── Konfiguration (Saetze/Schwellen) — Lesen fuer Admin, Schreiben nur Superadmin ──
router.get('/config', adminOnly, wrap(async (req, res) => {
  res.json(await db.all(`SELECT * FROM provision_config ORDER BY kreis, gueltig_ab DESC`));
}));

const CONFIG_COLS = ['opener_satz', 'setter_satz', 'opener_setter_pauschal', 'closer_basis', 'closer_schwelle',
  'closer_hoch', 'team_empfaenger_id', 'team_s1_bis', 'team_s1', 'team_s2_bis', 'team_s2', 'team_s3'];

// Bearbeitet die skalaren Saetze/Schwellen eines Kreises. Modus-Spalten (fix/staffel/flat_vl) und die
// AT-Staffeltabelle sind strukturell (Migration) und hier bewusst NICHT editierbar.
router.put('/config/:gueltig_ab', requireRole('superadmin'), wrap(async (req, res) => {
  const g = req.params.gueltig_ab;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(g)) return res.status(400).json({ error: 'gueltig_ab muss YYYY-MM-DD sein' });
  const f = req.body || {};
  const kreis = KREISE.includes(f.kreis) ? f.kreis : 'bonn';
  for (const c of CONFIG_COLS) {
    if (c === 'team_empfaenger_id') continue;
    if (!(Number(f[c]) >= 0)) return res.status(400).json({ error: `${c} muss eine Zahl >= 0 sein` });
  }
  const vals = CONFIG_COLS.map(c => (c === 'team_empfaenger_id' ? (f[c] ? Number(f[c]) : null) : Number(f[c])));
  const allCols = ['kreis', 'gueltig_ab', ...CONFIG_COLS], allVals = [kreis, g, ...vals];
  const setClause = CONFIG_COLS.map(c => `${c}=excluded.${c}`).join(', ') + (P ? ', updated_at=NOW()' : ", updated_at=datetime('now')");
  const phs = allCols.map((_, i) => (P ? `$${i + 1}` : '?')).join(',');
  await db.run(`INSERT INTO provision_config (${allCols.join(',')}) VALUES (${phs}) ON CONFLICT (kreis, gueltig_ab) DO UPDATE SET ${setClause}`, allVals);
  await logAudit({ user: req.user, action: 'upsert', entityType: 'provision_config', entityId: `${kreis}:${g}`, newData: f });
  res.json(await db.get(`SELECT * FROM provision_config WHERE kreis=${ph(1)} AND gueltig_ab=${ph(2)}`, [kreis, g]));
}));

// ── Zeitraum abschliessen (NUR Superadmin): einfrieren + Folgeperiode ──
router.post('/admin/zeitraeume/:id/abschluss', requireRole('superadmin'), wrap(async (req, res) => {
  const r = await abschliesseZeitraum(Number(req.params.id), req.user.id);
  if (r.error === 'not_found') return res.status(404).json({ error: 'Zeitraum nicht gefunden' });
  if (r.error === 'already_closed') return res.status(400).json({ error: 'Zeitraum ist bereits abgeschlossen' });
  if (r.error === 'still_running') return res.status(400).json({ error: `Zeitraum läuft noch bis ${r.bis} — Abschluss erst ab dem Folgetag` });
  await logAudit({ user: req.user, action: 'abschluss', entityType: 'provision_zeitraum', entityId: Number(req.params.id), newData: { abgeschlossen_am: r.abgeschlossen.abgeschlossen_am } });
  res.json(r);
}));

// ── StB-Export (NUR Superadmin — Lohndaten): CSV je Mitarbeiter mit Aufschlüsselung nach Typ ──
router.get('/admin/zeitraeume/:id/export.csv', requireRole('superadmin'), wrap(async (req, res) => {
  const z = await db.get(`SELECT * FROM provision_zeitraeume WHERE id=${ph(1)}`, [Number(req.params.id)]);
  if (!z) return res.status(404).json({ error: 'Zeitraum nicht gefunden' });
  const rows = await db.all(
    `SELECT b.employee_id, e.name, e.standort, b.typ, COALESCE(SUM(b.betrag),0) summe
       FROM provision_buchungen b LEFT JOIN employees e ON e.id=b.employee_id
      WHERE b.zeitraum_id=${ph(1)} GROUP BY b.employee_id, e.name, e.standort, b.typ`, [z.id]);
  // Typ -> Spalte (mehrere Typen bilden eine Spalte, z. B. Staffel offen/Nachtrag). Deckt alle Kreise ab.
  const SPALTE = {
    deal_gewonnen: 'Gewonnen', opener_fix: 'Opener-Fix', opener_fix_storno: 'Storno',
    at_opener_staffel: 'Opener-Staffel', at_opener_nachtrag: 'Opener-Staffel',
    at_setter_staffel: 'Setter-Staffel', at_setter_nachtrag: 'Setter-Staffel',
    staffel_upgrade: 'Closer-Staffel', staffel_nachtrag: 'Closer-Staffel',
    team_provision: 'Team', team_upgrade: 'Team-Staffel', team_nachtrag: 'Team-Staffel',
    korrektur: 'Korrektur', storno: 'Storno',
  };
  const SPALTEN = ['Gewonnen', 'Opener-Fix', 'Opener-Staffel', 'Setter-Staffel', 'Closer-Staffel', 'Team', 'Team-Staffel', 'Korrektur', 'Storno'];
  const byEmp = new Map();
  for (const r of rows) {
    if (!byEmp.has(r.employee_id)) byEmp.set(r.employee_id, { name: r.name || `#${r.employee_id}`, standort: r.standort || '', spalten: {}, summe: 0 });
    const e = byEmp.get(r.employee_id); const sp = SPALTE[r.typ] || 'Korrektur';
    e.spalten[sp] = round2(num(e.spalten[sp]) + num(r.summe)); e.summe = round2(e.summe + num(r.summe));
  }
  const esc = v => { const s = String(v ?? ''); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const fmt = n => (Number(n) || 0).toFixed(2).replace('.', ',');            // deutsches Dezimalkomma
  const header = ['Mitarbeiter', 'Standort', 'Zeitraum', ...SPALTEN, 'Summe'];
  const lines = [header.join(';')];
  for (const [, e] of [...byEmp.entries()].sort((a, b) => b[1].summe - a[1].summe)) {
    lines.push([esc(e.name), esc(e.standort), z.label, ...SPALTEN.map(s => fmt(e.spalten[s] || 0)), fmt(e.summe)].join(';'));
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="provisionen_${z.kreis || 'bonn'}_${z.von}_${z.bis}.csv"`);
  res.send('﻿' + lines.join('\r\n'));                                   // BOM + CRLF fuer Excel
}));

// ── Backfill des laufenden Zeitraums (nur Superadmin): erst Dry-Run, dann Commit ──
router.get('/admin/backfill/projektion', requireRole('superadmin'), wrap(async (req, res) => {
  res.json(await projektionLaufend(req.query.kreis));
}));

router.post('/admin/backfill', requireRole('superadmin'), wrap(async (req, res) => {
  const kreis = KREISE.includes(req.body?.kreis) ? req.body.kreis : null;
  const r = await backfillLaufend(kreis);
  await logAudit({ user: req.user, action: 'backfill', entityType: 'provision', entityId: r.kreis || 'alle', newData: { kreis: r.kreis, gewonneneInScope: r.gewonneneInScope } });
  res.json(r);
}));

module.exports = router;
