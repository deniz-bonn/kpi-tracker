const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { requireFeature, requireAnyFeature, hatFeature } = require('../middleware/requireFeature');
const { freigeschaltetePersonen, istFreigeschaltet,
        alleRelevantenPersonen, istRelevant } = require('../utils/featureScope');
const { logAudit } = require('../utils/audit');
const { projektionLaufend, backfillLaufend, abschliesseZeitraum, staffelStatus, kreisFor,
        resolveZeitraum, detailFor, labelForKreis } = require('../utils/provisionen');
const { projektionBk, backfillBk, KREIS: BK_KREIS } = require('../utils/provisionenBk');
const { KREIS_KEYS, NK_KREISE, KALENDERMONAT_KREISE, istKreis, kreisInfo, labelFuer } = require('../utils/kreise');
const { gruppeVonEmp } = require('../utils/rollen');

// Kreis aus der Query holen. `pflicht: true` -> unbekannter/fehlender Kreis ist ein 400.
// FRUEHER stand hier ueberall `KREISE.includes(x) ? x : 'bonn'`. Das war nicht "kein Zugang",
// sondern ein stiller Fallback: ein Tippfehler zeigte Bonner Zahlen unter fremder Ueberschrift —
// und bei PUT /config ueberschrieb er die Bonn-Saetze. Unbekannte Kreise fehlern jetzt laut.
const kreisAus = (wert, { pflicht = false, standard = null } = {}) => {
  if (wert == null || wert === '') return pflicht ? { fehler: 'Kreis fehlt' } : { kreis: standard };
  if (!istKreis(wert)) return { fehler: `Unbekannter Abrechnungskreis: ${wert}` };
  return { kreis: wert };
};

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

// Zwei Berechtigungen, einheitliches Muster (siehe auch routes/mein_dashboard.js):
//   NUTZER_SICHT   'meine_provision'            — eigene Provision (/me)
//   KONTROLL_SICHT 'meine_provision_kontrolle'  — "Aus der Sicht von" auf /me
// 'provisionen' bleibt das ADMIN-Flag fuer /admin/*, /config und den Export. Frueher gab
// 'provisionen' beides frei; Migration 106 spiegelt alle bestehenden Freischaltungen auf
// 'meine_provision', damit durch die Trennung niemand Zugang verliert.
const NUTZER_SICHT   = 'meine_provision';
const KONTROLL_SICHT = 'meine_provision_kontrolle';
// Voller Kontroll-Scope (bereichsuebergreifend, siehe mein_dashboard.js): alle relevanten
// Mitarbeiter statt nur der freigeschalteten. Superadmin implizit.
const VOLLER_SCOPE   = 'kontrolle_alle_mitarbeiter';
const nurAdminFeature = requireFeature('provisionen');

// resolveZeitraum() und detailFor() liegen in utils/provisionen.js — geteilt mit "Mein Dashboard",
// damit beide Seiten denselben Zeitraum und dieselbe Summenbildung benutzen.

// ── Abrechnungszeitraeume ──
router.get('/zeitraeume', requireAnyFeature(NUTZER_SICHT, KONTROLL_SICHT, 'provisionen'), wrap(async (req, res) => {
  // Ohne kreis-Param: alle Kreise (die Auswahl-Liste braucht das). Mit unbekanntem: 400.
  const k = kreisAus(req.query.kreis);
  if (k.fehler) return res.status(400).json({ error: k.fehler });
  const where = k.kreis ? ` WHERE kreis=${ph(1)}` : '';
  const params = k.kreis ? [k.kreis] : [];
  res.json(await db.all(`SELECT id, von, bis, label, status, abgeschlossen_am, kreis FROM provision_zeitraeume${where} ORDER BY kreis, von DESC`, params));
}));

// ── Eigene Provision — NUR eigene Daten, ausser die Kontroll-Sicht ist freigeschaltet ──
// `als` verhaelt sich exakt wie im Dashboard: nur fuer Berechtigte, nur fuer Personen, die fuer
// die Nutzer-Sicht freigeschaltet sind, und fuer alle anderen STILL ignoriert (kein 403, kein
// Hinweis darauf, welche IDs existieren).
// requireAnyFeature: wer NUR die Kontroll-Sicht hat (z.B. Vertriebsleitung), muss hier durch —
// sonst faende er die Seite offen und den Endpoint mit 403 verschlossen.
router.get('/me', requireAnyFeature(NUTZER_SICHT, KONTROLL_SICHT), wrap(async (req, res) => {
  const darfFremd   = await hatFeature(req.user, KONTROLL_SICHT);
  const vollerScope = darfFremd && await hatFeature(req.user, VOLLER_SCOPE);
  const gewuenscht = darfFremd && req.query.als ? Number(req.query.als) : null;
  const darfOeffnen = vollerScope ? istRelevant(gewuenscht) : istFreigeschaltet(gewuenscht, NUTZER_SICHT);
  const alsId = (gewuenscht && await darfOeffnen) ? gewuenscht : null;
  const empId = alsId || req.user.employee_id;
  const alsFremde = !!(alsId && String(alsId) !== String(req.user.employee_id));
  const sicht = {
    fremdsicht_erlaubt: darfFremd,
    als_fremde: alsFremde,
    voller_scope: vollerScope,
    personen: darfFremd
      ? (vollerScope ? await alleRelevantenPersonen(NUTZER_SICHT) : await freigeschaltetePersonen(NUTZER_SICHT))
      : [],
  };
  if (!empId) return res.json({ employee: null, zeitraum: null, summe: 0, perTyp: {}, buchungen: [], sicht,
    hinweis: darfFremd
      ? 'Dein Account ist mit keinem Mitarbeiter verknüpft — wähle oben eine Person.'
      : 'Kein Mitarbeiter mit diesem Account verknüpft.' });
  const emp = await db.get(`SELECT id, name, standort FROM employees WHERE id=${ph(1)}`, [empId]);
  const kreis = kreisFor(emp?.standort) || 'bonn';                        // eigener Abrechnungskreis
  const z = await resolveZeitraum(req.query.zeitraum_id, kreis);
  const ss = await staffelStatus(heute().slice(0, 7));                    // aktueller Kalendermonat
  const staffel = ss.closers.find(c => c.employee_id === empId) || null;  // eigener Closer-Satz (Bonn/BS)
  const teamStaffel = ss.team && ss.team.employee_id === empId ? ss.team : null;
  const atStaffel = kreis === 'oesterreich'
    ? { opener: ss.atOpener.find(o => o.employee_id === empId) || null, setter: ss.atSetter.find(s => s.employee_id === empId) || null }
    : null;
  if (alsFremde) {
    await logAudit({ user: req.user, action: 'sehen_als', entityType: 'meine_provision',
      entityId: empId, newData: { employee_id: empId, name: emp?.name } });
  }
  if (!z) return res.json({ employee: emp, zeitraum: null, kreis, summe: 0, perTyp: {}, buchungen: [], staffel, teamStaffel, atStaffel, sicht });
  res.json({ employee: emp, zeitraum: z, kreis, ...(await detailFor(empId, z)), staffel, teamStaffel, atStaffel, sicht });
}));

// ── Admin/Vertriebsleitung: Gesamtuebersicht + Einzeldetail ──
const adminOnly = requireRole('admin', 'vertriebsleitung');

router.get('/admin/overview', adminOnly, nurAdminFeature, wrap(async (req, res) => {
  const k = kreisAus(req.query.kreis, { standard: 'bonn' });
  if (k.fehler) return res.status(400).json({ error: k.fehler });
  const kreis = k.kreis;
  const z = await resolveZeitraum(req.query.zeitraum_id, kreis);
  if (!z) return res.json({ zeitraum: null, kreis, gesamt: 0, zeilen: [] });
  const rows = await db.all(
    // rolle/bk_gruppe werden mitgeliefert, damit die UI nach Rollen-Gruppe filtern kann
    // (Account Manager vs. Key Account Manager) — im BK-Kreis buendelt eine Liste alle Standorte.
    `SELECT b.employee_id, e.name, e.standort, e.rolle, e.bk_gruppe, COALESCE(SUM(b.betrag),0) summe
       FROM provision_buchungen b LEFT JOIN employees e ON e.id=b.employee_id
      WHERE b.zeitraum_id=${ph(1)} GROUP BY b.employee_id, e.name, e.standort, e.rolle, e.bk_gruppe ORDER BY summe DESC`, [z.id]);
  const zeilen = rows.map(r => ({ employee_id: r.employee_id, name: r.name, standort: r.standort,
    rolle: r.rolle, gruppe: gruppeVonEmp(r), summe: round2(num(r.summe)) }));
  const staffel = await staffelStatus(heute().slice(0, 7));   // aktueller Monats-Satz je Closer/Team/AT (für Anzeige)
  res.json({ zeitraum: z, kreis, gesamt: round2(zeilen.reduce((a, r) => a + r.summe, 0)), zeilen, staffel });
}));

router.get('/admin/employee/:id', adminOnly, nurAdminFeature, wrap(async (req, res) => {
  const emp = await db.get(`SELECT id, name, standort FROM employees WHERE id=${ph(1)}`, [Number(req.params.id)]);
  const z = await resolveZeitraum(req.query.zeitraum_id, kreisFor(emp?.standort) || 'bonn');
  if (!z) return res.json({ employee: emp, zeitraum: null, summe: 0, perTyp: {}, buchungen: [] });
  res.json({ employee: emp, zeitraum: z, ...(await detailFor(Number(req.params.id), z)) });
}));

// ── Konfiguration (Saetze/Schwellen) — Lesen fuer Admin, Schreiben nur Superadmin ──
router.get('/config', adminOnly, nurAdminFeature, wrap(async (req, res) => {
  res.json(await db.all(`SELECT * FROM provision_config ORDER BY kreis, gueltig_ab DESC`));
}));

// Editierbare Satz-Spalten je Kreis-Art. Die NK-Kreise haben Rollen-Saetze, der BK-Kreis
// zwei Prozentsaetze und sonst nichts — eine gemeinsame Liste haette fuer BK elf Pflichtfelder
// erzwungen, die dort keine Bedeutung haben.
const CONFIG_COLS_NK = ['opener_satz', 'setter_satz', 'opener_setter_pauschal', 'closer_basis', 'closer_schwelle',
  'closer_hoch', 'team_empfaenger_id', 'team_s1_bis', 'team_s1', 'team_s2_bis', 'team_s2', 'team_s3'];
const CONFIG_COLS_BK = ['upsell_satz', 'auto_vl_satz'];
const configColsFuer = kreis => (kreis === BK_KREIS ? CONFIG_COLS_BK : CONFIG_COLS_NK);

// Bearbeitet die skalaren Saetze/Schwellen eines Kreises. Modus-Spalten (fix/staffel/flat_vl) und die
// AT-Staffeltabelle sind strukturell (Migration) und hier bewusst NICHT editierbar.
router.put('/config/:gueltig_ab', requireRole('superadmin'), nurAdminFeature, wrap(async (req, res) => {
  const g = req.params.gueltig_ab;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(g)) return res.status(400).json({ error: 'gueltig_ab muss YYYY-MM-DD sein' });
  const f = req.body || {};
  // KRITISCH: hier stand `KREISE.includes(f.kreis) ? f.kreis : 'bonn'`. Ein Speicherversuch mit
  // vertipptem Kreis legte damit nicht etwa nichts an — er lief per ON CONFLICT (kreis, gueltig_ab)
  // in ein UPDATE der BONN-Saetze desselben Datums. Unbekannter Kreis ist jetzt ein 400.
  const k = kreisAus(f.kreis, { pflicht: true });
  if (k.fehler) return res.status(400).json({ error: k.fehler });
  const kreis = k.kreis;
  const COLS = configColsFuer(kreis);
  for (const c of COLS) {
    if (c === 'team_empfaenger_id') continue;
    if (!(Number(f[c]) >= 0)) return res.status(400).json({ error: `${c} muss eine Zahl >= 0 sein` });
  }
  const vals = COLS.map(c => (c === 'team_empfaenger_id' ? (f[c] ? Number(f[c]) : null) : Number(f[c])));
  // Die NK-Satzspalten sind NOT NULL ohne Default (Migration 091). Legt der BK-Kreis einen NEUEN
  // gueltig_ab an, muessen sie deshalb mitgeschrieben werden — mit 0, wie Migration 108/094 es
  // vormachen. Fuer diesen Kreis werden sie nie gelesen.
  const fuellCols = kreis === BK_KREIS ? CONFIG_COLS_NK.filter(c => c !== 'team_empfaenger_id') : [];
  const allCols = ['kreis', 'gueltig_ab', ...COLS, ...fuellCols];
  const allVals = [kreis, g, ...vals, ...fuellCols.map(() => 0)];
  const setClause = COLS.map(c => `${c}=excluded.${c}`).join(', ') + (P ? ', updated_at=NOW()' : ", updated_at=datetime('now')");
  const phs = allCols.map((_, i) => (P ? `$${i + 1}` : '?')).join(',');
  await db.run(`INSERT INTO provision_config (${allCols.join(',')}) VALUES (${phs}) ON CONFLICT (kreis, gueltig_ab) DO UPDATE SET ${setClause}`, allVals);
  await logAudit({ user: req.user, action: 'upsert', entityType: 'provision_config', entityId: `${kreis}:${g}`, newData: f });
  res.json(await db.get(`SELECT * FROM provision_config WHERE kreis=${ph(1)} AND gueltig_ab=${ph(2)}`, [kreis, g]));
}));

// ── Zeitraum abschliessen (NUR Superadmin): einfrieren + Folgeperiode ──
router.post('/admin/zeitraeume/:id/abschluss', requireRole('superadmin'), nurAdminFeature, wrap(async (req, res) => {
  const r = await abschliesseZeitraum(Number(req.params.id), req.user.id);
  if (r.error === 'not_found') return res.status(404).json({ error: 'Zeitraum nicht gefunden' });
  if (r.error === 'already_closed') return res.status(400).json({ error: 'Zeitraum ist bereits abgeschlossen' });
  if (r.error === 'still_running') return res.status(400).json({ error: `Zeitraum läuft noch bis ${r.bis} — Abschluss erst ab dem Folgetag` });
  await logAudit({ user: req.user, action: 'abschluss', entityType: 'provision_zeitraum', entityId: Number(req.params.id), newData: { abgeschlossen_am: r.abgeschlossen.abgeschlossen_am } });
  res.json(r);
}));

// ── StB-Export (NUR Superadmin — Lohndaten) ──────────────────────────────────
// Typ -> Spalte (mehrere Typen bilden eine Spalte, z. B. Staffel offen/Nachtrag). Deckt alle Kreise ab.
// ACHTUNG beim Ergaenzen neuer Buchungstypen: der Fallback unten ist 'Korrektur'. Ein hier
// vergessener Typ landet also STILL in der falschen Spalte — die Summe stimmt, die
// Aufschluesselung fuer den Steuerberater nicht, und nichts weist darauf hin.
const SPALTE = {
  deal_gewonnen: 'Gewonnen', opener_fix: 'Opener-Fix', opener_fix_storno: 'Storno',
  at_opener_staffel: 'Opener-Staffel', at_opener_nachtrag: 'Opener-Staffel',
  at_setter_staffel: 'Setter-Staffel', at_setter_nachtrag: 'Setter-Staffel',
  staffel_upgrade: 'Closer-Staffel', staffel_nachtrag: 'Closer-Staffel',
  team_provision: 'Team', team_upgrade: 'Team-Staffel', team_nachtrag: 'Team-Staffel',
  bk_upsell: 'Upsell 3 %', bk_verlaengerung: 'Verlängerung 2 %',     // Bestandskundenvertrieb
  korrektur: 'Korrektur', storno: 'Storno',
};
// Spalten der NK-Kreise — unveraendert in Bestand UND REIHENFOLGE. Die BK-Spalten werden nur
// dort angehaengt, wo tatsaechlich BK-Buchungen drinstehen. Grund: der Steuerberater arbeitet
// mit einem Template, das auf Spaltenpositionen zeigt; zwei neue Dauer-Nullspalten in den
// Bonn-/BS-/AT-Dateien wuerden es stillschweigend verschieben.
const SPALTEN_NK = ['Gewonnen', 'Opener-Fix', 'Opener-Staffel', 'Setter-Staffel', 'Closer-Staffel',
  'Team', 'Team-Staffel', 'Korrektur', 'Storno'];
const SPALTEN_BK = ['Upsell 3 %', 'Verlängerung 2 %'];
// Die Satz-Spalten stehen VOR Korrektur/Storno, damit die Aufschluesselung zusammenhaengt.
const spaltenFuer = (mitBk) => mitBk
  ? [...SPALTEN_NK.slice(0, -2), ...SPALTEN_BK, ...SPALTEN_NK.slice(-2)]
  : SPALTEN_NK;

const esc = v => { const s = String(v ?? ''); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const fmtCsv = n => (Number(n) || 0).toFixed(2).replace('.', ',');           // deutsches Dezimalkomma

/** Buchungen mehrerer Zeitraeume -> Zeilen je (Mitarbeiter, Zeitraum). Geteilt von Einzel- und Sammelexport. */
async function exportZeilen(zeitraeume) {
  const out = [];
  for (const z of zeitraeume) {
    const rows = await db.all(
      `SELECT b.employee_id, e.name, e.standort, b.typ, COALESCE(SUM(b.betrag),0) summe
         FROM provision_buchungen b LEFT JOIN employees e ON e.id=b.employee_id
        WHERE b.zeitraum_id=${ph(1)} GROUP BY b.employee_id, e.name, e.standort, b.typ`, [z.id]);
    const byEmp = new Map();
    for (const r of rows) {
      if (!byEmp.has(r.employee_id)) byEmp.set(r.employee_id, { name: r.name || `#${r.employee_id}`, standort: r.standort || '', spalten: {}, summe: 0 });
      const e = byEmp.get(r.employee_id); const sp = SPALTE[r.typ] || 'Korrektur';
      e.spalten[sp] = round2(num(e.spalten[sp]) + num(r.summe)); e.summe = round2(e.summe + num(r.summe));
    }
    for (const [, e] of byEmp) out.push({ ...e, kreis: z.kreis || 'bonn', zeitraum: z.label });
  }
  return out.sort((a, b) => b.summe - a.summe);
}

function csvAntwort(res, zeilen, { mitKreis = false, dateiname, mitBk = false }) {
  const SPALTEN = spaltenFuer(mitBk);
  const header = ['Mitarbeiter', 'Standort', ...(mitKreis ? ['Kreis'] : []), 'Zeitraum', ...SPALTEN, 'Summe'];
  const lines = [header.join(';')];
  for (const e of zeilen) {
    lines.push([esc(e.name), esc(e.standort), ...(mitKreis ? [esc(labelFuer(e.kreis))] : []), e.zeitraum,
      ...SPALTEN.map(s => fmtCsv(e.spalten[s] || 0)), fmtCsv(e.summe)].join(';'));
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${dateiname}"`);
  res.send('﻿' + lines.join('\r\n'));                                  // BOM + CRLF fuer Excel
}

// Einzelner Zeitraum (ein Kreis).
router.get('/admin/zeitraeume/:id/export.csv', requireRole('superadmin'), nurAdminFeature, wrap(async (req, res) => {
  const z = await db.get(`SELECT * FROM provision_zeitraeume WHERE id=${ph(1)}`, [Number(req.params.id)]);
  if (!z) return res.status(404).json({ error: 'Zeitraum nicht gefunden' });
  csvAntwort(res, await exportZeilen([z]), { mitBk: z.kreis === BK_KREIS,
    dateiname: `provisionen_${z.kreis || 'bonn'}_${z.von}_${z.bis}.csv` });
}));

// ── Monats-Sammelexport ueber ALLE Kalendermonats-Kreise ─────────────────────
// Eine Datei je Lohnlauf statt drei. Grund: wer in zwei Kreisen Provision bekommt (Closer-KAM
// wie Daniel Adams oder Stefan Morawitz — NK ueber den Standort, BK ueber seine Bestandskunden),
// stuende sonst in drei getrennten Dateien und muesste beim Lohnbuero von Hand zusammengefuehrt
// werden. Die Spalte "Kreis" haelt die Abrechnungskreise dabei sauber getrennt — zusammengefasst
// wird die DATEI, nicht die Abrechnung.
// Bonn ist bewusst NICHT dabei: dessen Zyklus laeuft 21.–20. und passt auf keinen Kalendermonat.
router.get('/admin/export/monat.csv', requireRole('superadmin'), nurAdminFeature, wrap(async (req, res) => {
  const monat = String(req.query.monat || '');
  if (!/^\d{4}-\d{2}$/.test(monat)) return res.status(400).json({ error: 'monat muss YYYY-MM sein' });
  const phs = KALENDERMONAT_KREISE.map((_, i) => ph(i + 2)).join(',');
  const zeitraeume = await db.all(
    `SELECT * FROM provision_zeitraeume WHERE von=${ph(1)} AND kreis IN (${phs}) ORDER BY kreis`,
    [`${monat}-01`, ...KALENDERMONAT_KREISE]);
  if (!zeitraeume.length) return res.status(404).json({ error: `Kein Kalendermonats-Zeitraum für ${monat}` });
  csvAntwort(res, await exportZeilen(zeitraeume), { mitKreis: true, mitBk: zeitraeume.some(z => z.kreis === BK_KREIS),
    dateiname: `provisionen_sammel_${monat}.csv` });
}));

// ── Backfill des laufenden Zeitraums (nur Superadmin): erst Dry-Run, dann Commit ──
// Der BK-Kreis laeuft ueber sein eigenes Modul und haengt ABSICHTLICH NICHT in reconcileAll()
// (das 4 s nach jedem Serverstart laeuft) — Stufe 1 wird ausschliesslich ueber diesen Knopf
// ausgeloest, nach Ansicht des Dry-Runs. Kein Auto-Go-Live beim Deploy.
router.get('/admin/backfill/projektion', requireRole('superadmin'), nurAdminFeature, wrap(async (req, res) => {
  const k = kreisAus(req.query.kreis);
  if (k.fehler) return res.status(400).json({ error: k.fehler });
  if (k.kreis === BK_KREIS) return res.json(await projektionBk());
  res.json(await projektionLaufend(k.kreis));
}));

router.post('/admin/backfill', requireRole('superadmin'), nurAdminFeature, wrap(async (req, res) => {
  const k = kreisAus(req.body?.kreis);
  if (k.fehler) return res.status(400).json({ error: k.fehler });
  const r = k.kreis === BK_KREIS ? await backfillBk() : await backfillLaufend(k.kreis);
  await logAudit({ user: req.user, action: 'backfill', entityType: 'provision', entityId: r.kreis || 'alle',
    newData: { kreis: r.kreis, gewonneneInScope: r.gewonneneInScope ?? r.verarbeitet } });
  res.json(r);
}));

module.exports = router;
