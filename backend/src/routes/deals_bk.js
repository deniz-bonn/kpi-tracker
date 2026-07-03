const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { logAudit }   = require('../utils/audit');

router.use(requireAuth);

const BASE_SELECT = `
  SELECT d.*, c.name as company_name, k.name as kam_name, k.standort as kam_standort
  FROM deals_bk d
  LEFT JOIN companies c ON c.id = d.company_id
  LEFT JOIN employees k ON k.id = d.kam_id
`;

// Syncs bk_at_ae in ae_gesamt_monthly for Österreich deals.
// Other standorts (Bonn, BS, CH) are always read live from deals_bk — no sync needed.
async function syncAeGesamtBK(deal, prev) {
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

  const p1 = d === 'postgres' ? '$1' : '?';
  const emp = await db.get(`SELECT standort FROM employees WHERE id=${p1}`, [deal.kam_id]);
  const standort = emp?.standort || '';

  const ag = await db.get(`SELECT * FROM ae_gesamt_monthly WHERE monat=${p1}`, [monat]);
  const n = v => Number(v) || 0;
  if (!ag) return;

  if (standort === 'Österreich') {
    if (n(ag.bk_at_ae) === 0) return;
    const newVal = Math.max(0, n(ag.bk_at_ae) + aeDelta);
    if (d === 'postgres') {
      await db.run(`UPDATE ae_gesamt_monthly SET bk_at_ae=$1, updated_at=NOW() WHERE monat=$2`, [newVal, monat]);
    } else {
      await db.run(`UPDATE ae_gesamt_monthly SET bk_at_ae=?, updated_at=datetime('now') WHERE monat=?`, [newVal, monat]);
    }
  } else if (standort === 'Bonn' || standort === 'Braunschweig') {
    if (n(ag.bk_de_ae) === 0) return;
    const newVal = Math.max(0, n(ag.bk_de_ae) + aeDelta);
    if (d === 'postgres') {
      await db.run(`UPDATE ae_gesamt_monthly SET bk_de_ae=$1, updated_at=NOW() WHERE monat=$2`, [newVal, monat]);
    } else {
      await db.run(`UPDATE ae_gesamt_monthly SET bk_de_ae=?, updated_at=datetime('now') WHERE monat=?`, [newVal, monat]);
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

router.get('/', wrap(async (req, res) => {
  const { company_id, monat, gewonnen_monat, status, kam_id } = req.query;
  const conditions = [];
  const params = [];
  let i = 1;
  const p = () => db.dialect === 'postgres' ? `$${i++}` : '?';

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

router.post('/', wrap(async (req, res) => {
  const body = { ...req.body };
  if (['bk_vertrieb'].includes(req.user.role) && req.user.employee_id) {
    body.kam_id = req.user.employee_id;
  }

  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(body);
  const fields = ['datum','monat','company_id','kam_id','kunde','angebotsnummer','dienstleistung',
    'angebotswert','laufzeit_monate','status','ae_wert','kommentar',
    'automatische_verlaengerung','abgerechnet','kundennummer','gewonnen_datum','gewonnen_monat',
    'termin_mit_daniel'];
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'abgerechnet') return body[f] ?? (body.status === 'Gewonnen' ? 'Nein' : null);
    return body[f] ?? null;
  });

  let row;
  if (db.dialect === 'postgres') {
    const ph = fields.map((_,i) => `$${i+1}`).join(',');
    row = await db.get(`INSERT INTO deals_bk (${fields.join(',')}) VALUES (${ph}) RETURNING *`, values);
  } else {
    const ph = fields.map(() => '?').join(',');
    const result = db.run(`INSERT INTO deals_bk (${fields.join(',')}) VALUES (${ph})`, values);
    row = { id: result.lastInsertRowid, ...body, gewonnen_datum, gewonnen_monat };
  }

  try { await syncAeGesamtBK(row, null); } catch (e) { console.error('[sync-bk] POST:', e.message); }
  await logAudit({ user: req.user, action: 'create', entityType: 'deal_bk', entityId: row.id, newData: row });
  res.status(201).json(row);
}));

router.put('/:id', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get('SELECT * FROM deals_bk WHERE id=$1', [req.params.id])
    : db.get('SELECT * FROM deals_bk WHERE id=?', [req.params.id]);

  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(req.body, existing);
  const fields = ['datum','monat','company_id','kam_id','kunde','angebotsnummer','dienstleistung',
    'angebotswert','laufzeit_monate','status','ae_wert','kommentar',
    'automatische_verlaengerung','abgerechnet','kundennummer','gewonnen_datum','gewonnen_monat',
    'termin_mit_daniel'];
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'abgerechnet') return req.body[f] ?? (req.body.status === 'Gewonnen' ? 'Nein' : null);
    return req.body[f] ?? null;
  });

  let row;
  if (db.dialect === 'postgres') {
    const set = fields.map((f,i) => `${f}=$${i+1}`).join(',');
    row = await db.get(
      `UPDATE deals_bk SET ${set}, updated_at=NOW() WHERE id=$${fields.length+1} RETURNING *`,
      [...values, req.params.id]
    );
  } else {
    const set = fields.map(f => `${f}=?`).join(',');
    db.run(`UPDATE deals_bk SET ${set}, updated_at=datetime('now') WHERE id=?`, [...values, req.params.id]);
    row = db.get(BASE_SELECT + ' WHERE d.id=?', [req.params.id]);
  }

  try { await syncAeGesamtBK(row, existing); } catch (e) { console.error('[sync-bk] PUT:', e.message); }
  await logAudit({ user: req.user, action: 'update', entityType: 'deal_bk', entityId: Number(req.params.id), oldData: existing, newData: row });
  res.json(row);
}));

router.delete('/:id', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get('SELECT * FROM deals_bk WHERE id=$1', [req.params.id])
    : db.get('SELECT * FROM deals_bk WHERE id=?', [req.params.id]);

  if (existing?.status === 'Gewonnen') {
    try { await syncAeGesamtBK({ ...existing, status: 'Gelöscht' }, existing); } catch (e) { console.error('[sync-bk] DELETE:', e.message); }
  }
  const p = db.dialect === 'postgres' ? '$1' : '?';
  await db.run(`DELETE FROM deals_bk WHERE id=${p}`, [req.params.id]);
  await logAudit({ user: req.user, action: 'delete', entityType: 'deal_bk', entityId: Number(req.params.id), oldData: existing });
  res.status(204).end();
}));

module.exports = router;
