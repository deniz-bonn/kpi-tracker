const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { logAudit }   = require('../utils/audit');

router.use(requireAuth);

const BASE_SELECT = `
  SELECT d.*, c.name as company_name,
    closer.name as closer_name, closer.standort as closer_standort,
    opener.name as opener_name, opener.standort as opener_standort,
    setter.name as setter_name, setter.standort as setter_standort
  FROM deals_nk d
  LEFT JOIN companies c ON c.id = d.company_id
  LEFT JOIN employees closer ON closer.id = d.closer_id
  LEFT JOIN employees opener ON opener.id = d.opener_id
  LEFT JOIN employees setter ON setter.id = d.setter_id
`;

function resolveGewonnenFelder(body, existing = null) {
  if (body.status === 'Gewonnen') {
    const gd = body.gewonnen_datum || existing?.gewonnen_datum || body.datum || new Date().toISOString().slice(0, 10);
    return { gewonnen_datum: gd, gewonnen_monat: gd.slice(0, 7) };
  }
  return { gewonnen_datum: null, gewonnen_monat: null };
}

// Restrict non-admin to own deals (by closer_id)
function ownFilter(req) {
  const user = req.user;
  if (['nk_vertrieb', 'bk_vertrieb'].includes(user.role) && user.employee_id) {
    return { field: 'd.closer_id', value: user.employee_id };
  }
  return null;
}

router.get('/', wrap(async (req, res) => {
  const { company_id, monat, gewonnen_monat, status, closer_id, opener_id, setter_id } = req.query;
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
  if (closer_id)     { conditions.push(`d.closer_id = ${p()}`);     params.push(closer_id); }
  if (opener_id)     { conditions.push(`d.opener_id = ${p()}`);     params.push(opener_id); }
  if (setter_id)     { conditions.push(`d.setter_id = ${p()}`);     params.push(setter_id); }

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
  // Auto-assign closer_id for non-admin users
  const body = { ...req.body };
  if (['nk_vertrieb'].includes(req.user.role) && req.user.employee_id) {
    body.closer_id = req.user.employee_id;
  }

  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(body);
  const fields = ['datum','monat','company_id','closer_id','opener_id','setter_id','quelle','kunde',
    'angebotsnummer','dienstleistung','angebotswert','laufzeit_monate','status','ae_wert','kommentar',
    'automatische_verlaengerung','abgerechnet','gewonnen_datum','gewonnen_monat'];
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'abgerechnet') return body[f] ?? (body.status === 'Gewonnen' ? 'Nein' : null);
    return body[f] ?? null;
  });

  let row;
  if (db.dialect === 'postgres') {
    const ph = fields.map((_,i) => `$${i+1}`).join(',');
    row = await db.get(`INSERT INTO deals_nk (${fields.join(',')}) VALUES (${ph}) RETURNING *`, values);
  } else {
    const ph = fields.map(() => '?').join(',');
    const result = db.run(`INSERT INTO deals_nk (${fields.join(',')}) VALUES (${ph})`, values);
    row = { id: result.lastInsertRowid, ...body, gewonnen_datum, gewonnen_monat };
  }

  await logAudit({ user: req.user, action: 'create', entityType: 'deal_nk', entityId: row.id, newData: row });
  res.status(201).json(row);
}));

router.put('/:id', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get('SELECT * FROM deals_nk WHERE id=$1', [req.params.id])
    : db.get('SELECT * FROM deals_nk WHERE id=?', [req.params.id]);

  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(req.body, existing);
  const fields = ['datum','monat','company_id','closer_id','opener_id','setter_id','quelle','kunde',
    'angebotsnummer','dienstleistung','angebotswert','laufzeit_monate','status','ae_wert','kommentar',
    'automatische_verlaengerung','abgerechnet','gewonnen_datum','gewonnen_monat'];
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
      `UPDATE deals_nk SET ${set}, updated_at=NOW() WHERE id=$${fields.length+1} RETURNING *`,
      [...values, req.params.id]
    );
  } else {
    const set = fields.map(f => `${f}=?`).join(',');
    db.run(`UPDATE deals_nk SET ${set}, updated_at=datetime('now') WHERE id=?`, [...values, req.params.id]);
    row = db.get(BASE_SELECT + ' WHERE d.id=?', [req.params.id]);
  }

  await logAudit({ user: req.user, action: 'update', entityType: 'deal_nk', entityId: Number(req.params.id), oldData: existing, newData: row });
  res.json(row);
}));

router.delete('/:id', wrap(async (req, res) => {
  const existing = db.dialect === 'postgres'
    ? await db.get('SELECT * FROM deals_nk WHERE id=$1', [req.params.id])
    : db.get('SELECT * FROM deals_nk WHERE id=?', [req.params.id]);

  const p = db.dialect === 'postgres' ? '$1' : '?';
  await db.run(`DELETE FROM deals_nk WHERE id=${p}`, [req.params.id]);
  await logAudit({ user: req.user, action: 'delete', entityType: 'deal_nk', entityId: Number(req.params.id), oldData: existing });
  res.status(204).end();
}));

module.exports = router;
