const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');
const { logAudit } = require('../utils/audit');
const {
  verwaltungsZugriff, requireVerwaltung, mitarbeiterMitBuchungen, mitarbeiterSperre, PROV_SPERRE,
} = require('../utils/verwaltung');

router.get('/', wrap(async (req, res) => {
  const { company_id, all } = req.query;
  const conds = [];
  const params = [];
  let i = 1;
  const p = () => db.dialect === 'postgres' ? `$${i++}` : '?';

  // By default only return active employees; pass ?all=1 to include inactive
  if (!all) { conds.push(`e.aktiv = ${p()}`); params.push(1); }
  if (company_id) { conds.push(`e.company_id = ${p()}`); params.push(company_id); }

  const where = conds.length ? ' WHERE ' + conds.join(' AND ') : '';
  const sql = `SELECT e.*, c.name as company_name FROM employees e JOIN companies c ON c.id=e.company_id${where} ORDER BY e.name`;
  const rows = await db.all(sql, params);

  // ?verwaltung=1 (Mitarbeiter-Seite): je Zeile ausweisen, was DIESER Nutzer daran aendern darf —
  // dieselbe Regel wie in POST/PATCH, damit die Seite nichts nachbaut. Mit Standort-Scope nur
  // der eigene Standort. Ohne Verwaltungsrecht bleibt die Liste, wie sie war (Dropdowns ueberall).
  if (req.query.verwaltung) {
    const z = await verwaltungsZugriff(req.user, 'mitarbeiter');
    if (!z) return res.status(403).json({ error: 'Kein Zugriff auf dieses Feature' });
    const sicht = z.scope === 'standort' ? rows.filter(e => e.standort === z.standort) : rows;
    const gebucht = z.ebene === 'superadmin' ? new Set() : await mitarbeiterMitBuchungen(sicht.map(e => e.id));
    return res.json(sicht.map(e => ({
      ...e,
      sperre: mitarbeiterSperre(z, e),
      prov_gesperrt: gebucht.has(Number(e.id)),
    })));
  }
  res.json(rows);
}));

// BK-Gruppe (nur 'kam' | 'am' | null) validieren — betrifft praktisch nur rolle='Multi'.
const normBkGruppe = v => (v === 'kam' || v === 'am') ? v : null;
// Namens-Normalisierung für den Dubletten-Check (case-/whitespace-insensitiv).
const normName = s => (s == null ? '' : String(s)).toLowerCase().replace(/\s+/g, ' ').trim();
const isActive = v => v === true || v === 1;

// Wie viele Deals hängen an einem Mitarbeiter (NK als Opener/Setter/Closer, BK/VL als KAM)?
async function dealCountFor(id) {
  const isPg = db.dialect === 'postgres';
  const idp = isPg ? '$1' : '?';
  const nk = Number((await db.get(
    isPg ? `SELECT COUNT(*) n FROM deals_nk WHERE opener_id=$1 OR setter_id=$1 OR closer_id=$1`
         : `SELECT COUNT(*) n FROM deals_nk WHERE opener_id=? OR setter_id=? OR closer_id=?`,
    isPg ? [id] : [id, id, id]))?.n || 0);
  const bk = Number((await db.get(`SELECT COUNT(*) n FROM deals_bk WHERE kam_id=${idp}`, [id]))?.n || 0);
  const vl = Number((await db.get(`SELECT COUNT(*) n FROM deals_vl WHERE kam_id=${idp}`, [id]))?.n || 0);
  return { total: nk + bk + vl, nk, bk, vl };
}

router.post('/', requireVerwaltung('mitarbeiter'), wrap(async (req, res) => {
  const { name, company_id, rolle, standort, bk_gruppe, confirm } = req.body;
  if (!name || !company_id || !rolle) return res.status(400).json({ error: 'name, company_id, rolle required' });
  const z = req.verwaltung;
  if (z.scope === 'standort' && standort !== z.standort) {
    return res.status(403).json({ error: `Nur Mitarbeiter am eigenen Standort (${z.standort}).` });
  }

  // Härtung gegen Mitarbeiter-Dubletten (siehe Vorfall #55/#70 „Veikko-Colin Poppinga"): Beim Anlegen
  // eines normalisiert gleichen Namens — auch eines INAKTIVEN — warnen und auf den Bestand verweisen.
  // Bewusst überschreibbar mit confirm=true. Gilt nur für den UI-/API-Anlegeweg (Importe schreiben direkt).
  if (!confirm) {
    const all = await db.all('SELECT id, name, rolle, standort, aktiv, company_id FROM employees');
    const dupes = all.filter(e => normName(e.name) === normName(name));
    if (dupes.length) {
      const hatInaktiv = dupes.some(d => !isActive(d.aktiv));
      return res.status(409).json({
        error: 'duplicate_name',
        message: `Es existiert bereits ein Mitarbeiter mit dem Namen „${name}"${hatInaktiv ? ' (auch inaktiv/archiviert)' : ''}. Reaktivieren statt neu anlegen?`,
        existing: dupes.map(d => ({ id: d.id, name: d.name, rolle: d.rolle, standort: d.standort, aktiv: isActive(d.aktiv), company_id: d.company_id })),
      });
    }
  }
  const bk = normBkGruppe(bk_gruppe);

  let row;
  if (db.dialect === 'postgres') {
    row = await db.get(
      'INSERT INTO employees (name, company_id, rolle, standort, bk_gruppe) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, company_id, rolle, standort || null, bk]
    );
  } else {
    const result = db.run('INSERT INTO employees (name, company_id, rolle, standort, bk_gruppe) VALUES (?,?,?,?,?)', [name, company_id, rolle, standort || null, bk]);
    row = { id: result.lastInsertRowid, name, company_id, rolle, standort: standort || null, bk_gruppe: bk, aktiv: 1 };
  }
  await logAudit({ user: req.user, action: 'create', entityType: 'employee', entityId: Number(row.id), newData: row });
  res.status(201).json(row);
}));

router.patch('/:id', requireVerwaltung('mitarbeiter'), wrap(async (req, res) => {
  const { name, company_id, rolle, standort, aktiv, show_in_kpi, confirm } = req.body;
  const z = req.verwaltung;
  const vorher = await db.get(`SELECT * FROM employees WHERE id=${db.dialect === 'postgres' ? '$1' : '?'}`, [req.params.id]);
  if (!vorher) return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });

  // Leitplanken (utils/verwaltung.js) — fuer jeden ausser dem Superadmin.
  const sperre = mitarbeiterSperre(z, vorher);
  if (sperre) return res.status(403).json({ error: sperre });
  if (z.ebene !== 'superadmin') {
    if (show_in_kpi !== undefined && show_in_kpi !== null) {
      return res.status(403).json({ error: 'Die KPI-Sichtbarkeit ändert nur der Superadmin.' });
    }
    // Was die Provisions-Zuordnung WIRKLICH aendert. Das Formular schickt beim Bearbeiten alle
    // Felder mit — unveraenderte Werte duerfen nicht als Aenderung zaehlen. Leerer Standort /
    // fehlende Company / Rolle bedeuten "unveraendert" (COALESCE unten).
    const zielRolle = rolle || vorher.rolle;
    const geaendert = [];
    if (rolle && rolle !== vorher.rolle) geaendert.push('rolle');
    if (standort && standort !== vorher.standort) geaendert.push('standort');
    if (company_id != null && String(company_id) !== String(vorher.company_id)) geaendert.push('company_id');
    if (Object.prototype.hasOwnProperty.call(req.body, 'bk_gruppe') && zielRolle === 'Multi'
        && normBkGruppe(req.body.bk_gruppe) !== (vorher.bk_gruppe || null)) geaendert.push('bk_gruppe');
    if (geaendert.length) {
      if ((await mitarbeiterMitBuchungen([vorher.id])).size) {
        return res.status(403).json({ error: PROV_SPERRE, felder: geaendert });
      }
      if (z.scope === 'standort' && geaendert.includes('standort')) {
        return res.status(403).json({ error: `Nur Mitarbeiter am eigenen Standort (${z.standort}).` });
      }
    }
  }

  // Härtung: Deaktivieren eines Mitarbeiters, an dem noch Deals hängen -> warnen (mit Anzahl), außer confirm.
  // Grund: inaktive MA verschwinden aus den Filter-Dropdowns; ihre Deals bleiben zugeordnet, sind aber
  // nicht mehr filterbar (genau das Muster, das #55 zu „Filter-Geistern" gemacht hat).
  const willDeactivate = aktiv !== undefined && aktiv !== null && (aktiv === 0 || aktiv === false || aktiv === '0');
  if (willDeactivate && !confirm) {
    const dc = await dealCountFor(req.params.id);
    if (dc.total > 0) {
      return res.status(409).json({
        error: 'has_deals',
        dealCount: dc.total,
        breakdown: dc,
        message: `An diesem Mitarbeiter hängen ${dc.total} Deals (NK ${dc.nk}, BK ${dc.bk}, VL ${dc.vl}). Wirklich deaktivieren? Die Deals bleiben zugeordnet, erscheinen aber nicht mehr in den Filtern.`,
      });
    }
  }

  // bk_gruppe nur setzen, wenn im Body vorhanden (sonst wuerden Teil-Updates wie der Aktiv-Toggle
  // die Zuordnung ueberschreiben). Leerwert -> NULL (Zuordnung aufheben).
  const setBk = Object.prototype.hasOwnProperty.call(req.body, 'bk_gruppe');
  const bkVal = setBk ? normBkGruppe(req.body.bk_gruppe) : null;
  if (db.dialect === 'postgres') {
    const row = await db.get(
      `UPDATE employees SET
         name=COALESCE($1,name), company_id=COALESCE($2,company_id),
         rolle=COALESCE($3,rolle), standort=COALESCE($4,standort),
         aktiv=COALESCE($5,aktiv), show_in_kpi=COALESCE($6,show_in_kpi),
         bk_gruppe=CASE WHEN $7 THEN $8 ELSE bk_gruppe END
       WHERE id=$9 RETURNING *`,
      [name, company_id, rolle,
       standort !== undefined ? standort || null : undefined,
       aktiv, show_in_kpi !== undefined ? show_in_kpi : null,
       setBk, bkVal, req.params.id]
    );
    await logAudit({ user: req.user, action: 'update', entityType: 'employee', entityId: Number(vorher.id), oldData: vorher, newData: row });
    res.json(row);
  } else {
    db.run(
      `UPDATE employees SET
         name=COALESCE(?,name), company_id=COALESCE(?,company_id),
         rolle=COALESCE(?,rolle), standort=COALESCE(?,standort),
         aktiv=COALESCE(?,aktiv), show_in_kpi=COALESCE(?,show_in_kpi),
         bk_gruppe=CASE WHEN ? THEN ? ELSE bk_gruppe END
       WHERE id=?`,
      [name ?? null, company_id ?? null, rolle ?? null,
       standort !== undefined ? standort || null : null,
       aktiv ?? null, show_in_kpi !== undefined ? show_in_kpi : null,
       setBk ? 1 : 0, bkVal, req.params.id]
    );
    const row = await db.get('SELECT e.*, c.name as company_name FROM employees e JOIN companies c ON c.id=e.company_id WHERE e.id=?', [req.params.id]);
    await logAudit({ user: req.user, action: 'update', entityType: 'employee', entityId: Number(vorher.id), oldData: vorher, newData: row });
    res.json(row);
  }
}));

// ── Foto (Live-Board) ─────────────────────────────────────────────────────────────────────────
// Der Browser schneidet quadratisch zu und verkleinert auf 256 px; hier wird nur noch geprueft.
// Rohes Bild als Body (Content-Type image/*) statt JSON — umgeht das 100-KB-Limit von express.json
// gezielt fuer diese eine Route, mit eigener Grenze von 500 KB.
const FOTO_MAX = 500 * 1024;
const FOTO_TYPEN = ['image/jpeg', 'image/png', 'image/webp'];
const ph1 = () => (db.dialect === 'postgres' ? '$1' : '?');

// Wer Mitarbeiter verwalten darf, darf auch das Foto setzen — mit Standort-Scope nur am eigenen Standort.
async function fotoRecht(req, res) {
  const z = req.verwaltung;
  const emp = await db.get(`SELECT id, name, standort FROM employees WHERE id=${ph1()}`, [Number(req.params.id)]);
  if (!emp) { res.status(404).json({ error: 'Mitarbeiter nicht gefunden' }); return null; }
  if (z.scope === 'standort' && emp.standort !== z.standort) { res.status(403).json({ error: 'Nur Mitarbeiter des eigenen Standorts' }); return null; }
  return emp;
}

// Welche Mitarbeiter haben ein Foto (und seit wann)? Fuer die Mitarbeiter-Seite.
router.get('/fotos', wrap(async (_req, res) => {
  res.json(await db.all(`SELECT employee_id, bytes, updated_at FROM employee_fotos`));
}));

router.get('/:id/foto', wrap(async (req, res) => {
  const f = await db.get(`SELECT mime, daten FROM employee_fotos WHERE employee_id=${ph1()}`, [Number(req.params.id)]);
  if (!f) return res.status(404).json({ error: 'Kein Foto' });
  res.set('Content-Type', f.mime);
  res.set('Cache-Control', 'private, max-age=300');
  res.send(Buffer.from(f.daten, 'base64'));
}));

router.put('/:id/foto', requireVerwaltung('mitarbeiter'),
  require('express').raw({ type: FOTO_TYPEN, limit: FOTO_MAX }),
  wrap(async (req, res) => {
    const emp = await fotoRecht(req, res); if (!emp) return;
    const mime = String(req.headers['content-type'] || '').split(';')[0].trim();
    if (!FOTO_TYPEN.includes(mime) || !Buffer.isBuffer(req.body) || !req.body.length) {
      return res.status(400).json({ error: 'Bitte ein Bild (JPEG, PNG oder WebP) senden' });
    }
    if (req.body.length > FOTO_MAX) return res.status(413).json({ error: 'Bild größer als 500 KB' });
    const daten = req.body.toString('base64');
    const werte = [emp.id, mime, daten, req.body.length, req.user?.id ?? null];
    if (db.dialect === 'postgres') {
      await db.run(`INSERT INTO employee_fotos (employee_id, mime, daten, bytes, updated_at, updated_by) VALUES ($1,$2,$3,$4,NOW(),$5)
        ON CONFLICT (employee_id) DO UPDATE SET mime=EXCLUDED.mime, daten=EXCLUDED.daten, bytes=EXCLUDED.bytes, updated_at=NOW(), updated_by=EXCLUDED.updated_by`, werte);
    } else {
      await db.run(`INSERT INTO employee_fotos (employee_id, mime, daten, bytes, updated_at, updated_by) VALUES (?,?,?,?,datetime('now'),?)
        ON CONFLICT (employee_id) DO UPDATE SET mime=excluded.mime, daten=excluded.daten, bytes=excluded.bytes, updated_at=datetime('now'), updated_by=excluded.updated_by`, werte);
    }
    await logAudit({ user: req.user, action: 'update', entityType: 'employee_foto', entityId: emp.id, newData: { mime, bytes: req.body.length } });
    res.json({ ok: true, bytes: req.body.length });
  }));

router.delete('/:id/foto', requireVerwaltung('mitarbeiter'), wrap(async (req, res) => {
  const emp = await fotoRecht(req, res); if (!emp) return;
  await db.run(`DELETE FROM employee_fotos WHERE employee_id=${ph1()}`, [emp.id]);
  await logAudit({ user: req.user, action: 'delete', entityType: 'employee_foto', entityId: emp.id });
  res.json({ ok: true });
}));

module.exports = router;
