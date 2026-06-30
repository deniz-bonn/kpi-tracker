const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { logAudit }   = require('../utils/audit');

router.use(requireAuth);

const BASE_SELECT = `
  SELECT d.*, c.name as company_name, k.name as kam_name, k.standort as kam_standort
  FROM deals_vl d
  LEFT JOIN companies c ON c.id = d.company_id
  LEFT JOIN employees k ON k.id = d.kam_id
`;

async function syncAeGesamtVL(deal, prev) {
  const d = db.dialect;
  const wasGewonnen = prev?.status === 'Gewonnen';
  const isNowGewonnen = deal.status === 'Gewonnen';

  if (!wasGewonnen && !isNowGewonnen) return;

  let aeDelta = 0;
  if (!wasGewonnen && isNowGewonnen) {
    aeDelta = Number(deal.ae_wert) || 0;
  } else if (wasGewonnen && !isNowGewonnen) {
    aeDelta = -(Number(prev.ae_wert) || 0);
  } else {
    aeDelta = (Number(deal.ae_wert) || 0) - (Number(prev.ae_wert) || 0);
    if (aeDelta === 0) return;
  }

  const monat = deal.gewonnen_monat || prev?.gewonnen_monat;
  if (!monat) return;

  // Jan–Jun 2026: statische Sollwerte — Automation nicht anwenden
  if (monat <= '2026-06') return;

  const p1 = d === 'postgres' ? '$1' : '?';
  const emp = await db.get(`SELECT standort FROM employees WHERE id=${p1}`, [deal.kam_id]);
  const standort = emp?.standort || '';

  const ag = await db.get(`SELECT * FROM ae_gesamt_monthly WHERE monat=${p1}`, [monat]);
  const n = v => Number(v) || 0;
  // Kein ae_gesamt_monthly-Row → Live-Daten werden im Dashboard angezeigt
  if (!ag) return;

  if (standort === 'Österreich') {
    if (n(ag.vl_at_ae) === 0) return;
    const newVal = Math.max(0, n(ag.vl_at_ae) + aeDelta);
    if (d === 'postgres') {
      await db.run(`UPDATE ae_gesamt_monthly SET vl_at_ae=$1, updated_at=NOW() WHERE monat=$2`, [newVal, monat]);
    } else {
      await db.run(`UPDATE ae_gesamt_monthly SET vl_at_ae=?, updated_at=datetime('now') WHERE monat=?`, [newVal, monat]);
    }
  } else if (standort === 'Bonn' || standort === 'Braunschweig') {
    if (n(ag.vl_de_ae) === 0) return;
    const newVal = Math.max(0, n(ag.vl_de_ae) + aeDelta);
    if (d === 'postgres') {
      await db.run(`UPDATE ae_gesamt_monthly SET vl_de_ae=$1, updated_at=NOW() WHERE monat=$2`, [newVal, monat]);
    } else {
      await db.run(`UPDATE ae_gesamt_monthly SET vl_de_ae=?, updated_at=datetime('now') WHERE monat=?`, [newVal, monat]);
    }
  }
}

function resolveGewonnenFelder(body, existing = null) {
  if (body.status === 'Gewonnen') {
    const gd = body.gewonnen_datum || existing?.gewonnen_datum || body.datum || new Date().toISOString().slice(0, 10);
    return { gewonnen_datum: gd, gewonnen_monat: gd.slice(0, 7) };
  }
  return { gewonnen_datum: null, gewonnen_monat: null };
}

function ownFilter(_req) {
  // VL und Kuendigungen: alle KAMs sehen alle Datensaetze (kein per-User-Filter)
  return null;
}

router.get('/', wrap(async (req, res) => {
  const { company_id, monat, gewonnen_monat, status, kam_id } = req.query;
  const conditions = [];
  const params = [];
  let i = 1;
  const p = () => db.dialect === 'postgres' ? `$${i++}` : '?';

  const own = ownFilter(req);
  if (own) { conditions.push(`${own.field} = ${p()}`); params.push(own.value); }

  if (company_id)    { conditions.push(`d.company_id = ${p()}`);    params.push(company_id); }
  if (monat)         { conditions.push(`d.monat = ${p()}`);         params.push(monat); }
  if (gewonnen_monat){ conditions.push(`d.gewonnen_monat = ${p()}`);params.push(gewonnen_monat); }
  if (status)        { conditions.push(`d.status = ${p()}`);        params.push(status); }
  if (kam_id)        { conditions.push(`d.kam_id = ${p()}`);        params.push(kam_id); }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  res.json(await db.all(BASE_SELECT + where + ' ORDER BY d.datum DESC', params));
}));

router.get('/:id', wrap(async (req, res) => {
  const p = db.dialect === 'postgres' ? '$1' : '?';
  const row = await db.get(BASE_SELECT + ` WHERE d.id=${p}`, [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
}));

router.post('/import-kontakt', wrap(async (req, res) => {
  const rows = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Keine Daten' });
  }
  const ALLOWED = ['gekuendigt_am','auslaufend_am','ansprechpartner','telefon','email_kontakt','terminiert','neuer_ap_intern'];
  let updated = 0;
  const errors = [];
  for (const row of rows) {
    if (!row.id) { errors.push('Zeile ohne ID übersprungen'); continue; }
    const toUpdate = ALLOWED.filter(f => Object.prototype.hasOwnProperty.call(row, f));
    if (toUpdate.length === 0) continue;
    try {
      if (db.dialect === 'postgres') {
        const set = toUpdate.map((f, i) => `${f}=$${i + 1}`).join(',');
        await db.run(
          `UPDATE deals_vl SET ${set}, updated_at=NOW() WHERE id=$${toUpdate.length + 1}`,
          [...toUpdate.map(f => row[f] || null), row.id]
        );
      } else {
        const set = toUpdate.map(f => `${f}=?`).join(',');
        db.run(
          `UPDATE deals_vl SET ${set}, updated_at=datetime('now') WHERE id=?`,
          [...toUpdate.map(f => row[f] || null), row.id]
        );
      }
      updated++;
    } catch (e) {
      errors.push(`ID ${row.id}: ${e.message}`);
    }
  }
  res.json({ updated, errors });
}));

router.post('/import-csv', wrap(async (req, res) => {
  const { rows, company_id } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: 'Keine Daten' });
  if (!company_id) return res.status(400).json({ error: 'company_id fehlt' });

  // Build lowercase KAM name → id map
  const kamRows = db.dialect === 'postgres'
    ? await db.all("SELECT id, name FROM employees WHERE rolle='KAM'")
    : db.all("SELECT id, name FROM employees WHERE rolle='KAM'");
  const kamMap = {};
  for (const k of kamRows) kamMap[k.name.trim().toLowerCase()] = k.id;

  let created = 0;
  const errors = [];

  for (const row of rows) {
    if (!row.kunde || !row.datum) {
      errors.push(`Übersprungen: Kunde oder Datum fehlt (${row.kunde || '?'})`);
      continue;
    }
    const monat = String(row.datum).slice(0, 7);
    const kam_id = kamMap[(row.kam_name || '').trim().toLowerCase()] || null;
    const angebotswert = row.angebotswert ? Number(row.angebotswert) || null : null;
    const laufzeit_monate = row.laufzeit_monate ? Number(row.laufzeit_monate) || null : null;
    const wie_vielt = row.wie_vielt_verlaengerung ? Number(row.wie_vielt_verlaengerung) || null : null;
    try {
      if (db.dialect === 'postgres') {
        await db.run(
          `INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,created_at,updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Offen',NOW(),NOW())`,
          [row.datum, monat, company_id, kam_id, row.kunde, row.dienstleistung || null,
           angebotswert, laufzeit_monate, wie_vielt, row.auslaufend_am || null]
        );
      } else {
        db.run(
          `INSERT INTO deals_vl (datum,monat,company_id,kam_id,kunde,dienstleistung,angebotswert,laufzeit_monate,wie_vielt_verlaengerung,auslaufend_am,status,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,'Offen',datetime('now'),datetime('now'))`,
          [row.datum, monat, company_id, kam_id, row.kunde, row.dienstleistung || null,
           angebotswert, laufzeit_monate, wie_vielt, row.auslaufend_am || null]
        );
      }
      created++;
    } catch (e) {
      errors.push(`${row.kunde}: ${e.message}`);
    }
  }
  res.json({ created, errors });
}));

router.post('/', wrap(async (req, res) => {
  const body = { ...req.body };
  if (['bk_vertrieb'].includes(req.user.role) && req.user.employee_id) {
    body.kam_id = req.user.employee_id;
  }

  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(body);
  const fields = ['datum','monat','company_id','kam_id','kunde','dienstleistung','angebotswert',
    'ae_wert','laufzeit_monate','status','wie_vielt_verlaengerung','kommentar',
    'abgerechnet','kundennummer','gewonnen_datum','gewonnen_monat',
    'gekuendigt_am','auslaufend_am','ansprechpartner','telefon','email_kontakt',
    'upsale_angesprochen','upsale_summe','upsale_angenommen','upsale_angenommen_summe',
    'weitergeben_an_vertrieb','terminiert','neuer_ap_intern',
    'vertragsnummer','vertragsbeginn','ende_laufzeit','ende_kuendigungsfrist'];
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'abgerechnet') return body[f] ?? (body.status === 'Gewonnen' ? 'Nein' : null);
    if (f === 'upsale_angesprochen' || f === 'upsale_angenommen') return Number(body[f]) || 0;
    if (f === 'terminiert') return Number(body[f]) || 0;
    if (f === 'neuer_ap_intern') {
      const v = body[f] ?? null;
      if (!v && body.weitergeben_an_vertrieb === 'Ja') return 'Vertrieb';
      if (!v && body.weitergeben_an_vertrieb === 'Nein' && body.kam_id) return String(body.kam_id);
      return v;
    }
    return body[f] ?? null;
  });

  let row;
  if (db.dialect === 'postgres') {
    const ph = fields.map((_,i) => `$${i+1}`).join(',');
    row = await db.get(`INSERT INTO deals_vl (${fields.join(',')}) VALUES (${ph}) RETURNING *`, values);
  } else {
    const ph = fields.map(() => '?').join(',');
    const result = db.run(`INSERT INTO deals_vl (${fields.join(',')}) VALUES (${ph})`, values);
    row = { id: result.lastInsertRowid, ...body, gewonnen_datum, gewonnen_monat };
  }

  try { await syncAeGesamtVL(row, null); } catch (e) { console.error('[sync-vl] POST:', e.message); }
  await logAudit({ user: req.user, action: 'create', entityType: 'deal_vl', entityId: row.id, newData: row });
  res.status(201).json(row);
}));

router.put('/:id', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get('SELECT * FROM deals_vl WHERE id=$1', [req.params.id])
    : db.get('SELECT * FROM deals_vl WHERE id=?', [req.params.id]);

  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(req.body, existing);
  const fields = ['datum','monat','company_id','kam_id','kunde','dienstleistung','angebotswert',
    'ae_wert','laufzeit_monate','status','wie_vielt_verlaengerung','kommentar',
    'abgerechnet','kundennummer','gewonnen_datum','gewonnen_monat',
    'gekuendigt_am','auslaufend_am','ansprechpartner','telefon','email_kontakt',
    'upsale_angesprochen','upsale_summe','upsale_angenommen','upsale_angenommen_summe',
    'weitergeben_an_vertrieb','terminiert','neuer_ap_intern',
    'vertragsnummer','vertragsbeginn','ende_laufzeit','ende_kuendigungsfrist'];
  // Fields only editable inline in Kündigungen — preserve existing value when not in form body
  const PRESERVE_FIELDS = ['gekuendigt_am','auslaufend_am','ansprechpartner','telefon','email_kontakt','terminiert','neuer_ap_intern'];
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'abgerechnet') return req.body[f] ?? (req.body.status === 'Gewonnen' ? 'Nein' : null);
    if (f === 'upsale_angesprochen' || f === 'upsale_angenommen') return Number(req.body[f]) || 0;
    if (f === 'terminiert') {
      if (req.body.terminiert !== undefined) return Number(req.body.terminiert) || 0;
      return Number(existing?.terminiert) || 0;
    }
    if (f === 'neuer_ap_intern') {
      if (req.body.neuer_ap_intern !== undefined) return req.body.neuer_ap_intern ?? null;
      const weitergeben = req.body.weitergeben_an_vertrieb;
      const kamId = req.body.kam_id || existing?.kam_id;
      if (weitergeben === 'Ja') return 'Vertrieb';
      if (weitergeben === 'Nein' && kamId) return String(kamId);
      return existing?.neuer_ap_intern ?? null;
    }
    if (PRESERVE_FIELDS.includes(f) && req.body[f] === undefined) return existing?.[f] ?? null;
    return req.body[f] ?? null;
  });

  let row;
  if (db.dialect === 'postgres') {
    const set = fields.map((f,i) => `${f}=$${i+1}`).join(',');
    row = await db.get(
      `UPDATE deals_vl SET ${set}, updated_at=NOW() WHERE id=$${fields.length+1} RETURNING *`,
      [...values, req.params.id]
    );
  } else {
    const set = fields.map(f => `${f}=?`).join(',');
    db.run(`UPDATE deals_vl SET ${set}, updated_at=datetime('now') WHERE id=?`, [...values, req.params.id]);
    row = db.get(BASE_SELECT + ' WHERE d.id=?', [req.params.id]);
  }

  try { await syncAeGesamtVL(row, existing); } catch (e) { console.error('[sync-vl] PUT:', e.message); }
  await logAudit({ user: req.user, action: 'update', entityType: 'deal_vl', entityId: Number(req.params.id), oldData: existing, newData: row });
  res.json(row);
}));

router.patch('/:id/kontakt', wrap(async (req, res) => {
  const KONTAKT_FIELDS = ['gekuendigt_am','auslaufend_am','ansprechpartner','telefon','email_kontakt','terminiert','neuer_ap_intern'];
  const toUpdate = KONTAKT_FIELDS.filter(f => Object.prototype.hasOwnProperty.call(req.body, f));
  if (toUpdate.length === 0) return res.json({ ok: true });

  let row;
  if (db.dialect === 'postgres') {
    const set = toUpdate.map((f, i) => `${f}=$${i + 1}`).join(',');
    row = await db.get(
      `UPDATE deals_vl SET ${set}, updated_at=NOW() WHERE id=$${toUpdate.length + 1} RETURNING *`,
      [...toUpdate.map(f => req.body[f] ?? null), req.params.id]
    );
  } else {
    const set = toUpdate.map(f => `${f}=?`).join(',');
    db.run(
      `UPDATE deals_vl SET ${set}, updated_at=datetime('now') WHERE id=?`,
      [...toUpdate.map(f => req.body[f] ?? null), req.params.id]
    );
    row = db.get(BASE_SELECT + ' WHERE d.id=?', [req.params.id]);
  }
  res.json(row);
}));

router.patch('/:id/upsale', wrap(async (req, res) => {
  const { upsale_angesprochen, upsale_summe, upsale_angenommen, upsale_angenommen_summe } = req.body;
  let row;
  if (db.dialect === 'postgres') {
    row = await db.get(
      `UPDATE deals_vl SET upsale_angesprochen=$1, upsale_summe=$2, upsale_angenommen=$3,
       upsale_angenommen_summe=$4, updated_at=NOW() WHERE id=$5 RETURNING *`,
      [upsale_angesprochen ?? 0, upsale_summe ?? null, upsale_angenommen ?? 0, upsale_angenommen_summe ?? null, req.params.id]
    );
  } else {
    db.run(
      `UPDATE deals_vl SET upsale_angesprochen=?, upsale_summe=?, upsale_angenommen=?,
       upsale_angenommen_summe=?, updated_at=datetime('now') WHERE id=?`,
      [upsale_angesprochen ?? 0, upsale_summe ?? null, upsale_angenommen ?? 0, upsale_angenommen_summe ?? null, req.params.id]
    );
    row = db.get(BASE_SELECT + ' WHERE d.id=?', [req.params.id]);
  }
  res.json(row);
}));

router.delete('/:id', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get('SELECT * FROM deals_vl WHERE id=$1', [req.params.id])
    : db.get('SELECT * FROM deals_vl WHERE id=?', [req.params.id]);

  if (existing?.status === 'Gewonnen') {
    try { await syncAeGesamtVL({ ...existing, status: 'Gelöscht' }, existing); } catch (e) { console.error('[sync-vl] DELETE:', e.message); }
  }
  const p = db.dialect === 'postgres' ? '$1' : '?';
  await db.run(`DELETE FROM deals_vl WHERE id=${p}`, [req.params.id]);
  await logAudit({ user: req.user, action: 'delete', entityType: 'deal_vl', entityId: Number(req.params.id), oldData: existing });
  res.status(204).end();
}));

module.exports = router;
