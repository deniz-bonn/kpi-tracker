const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');

const BASE_SELECT = `
  SELECT d.*, c.name as company_name, k.name as kam_name, k.standort as kam_standort
  FROM deals_vl d
  LEFT JOIN companies c ON c.id = d.company_id
  LEFT JOIN employees k ON k.id = d.kam_id
`;

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

  if (company_id) { conditions.push(`d.company_id = ${p()}`); params.push(company_id); }
  if (monat) { conditions.push(`d.monat = ${p()}`); params.push(monat); }
  if (gewonnen_monat) { conditions.push(`d.gewonnen_monat = ${p()}`); params.push(gewonnen_monat); }
  if (status) { conditions.push(`d.status = ${p()}`); params.push(status); }
  if (kam_id) { conditions.push(`d.kam_id = ${p()}`); params.push(kam_id); }

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
  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(req.body);
  const fields = ['datum','monat','company_id','kam_id','kunde','dienstleistung','angebotswert',
    'ae_wert','laufzeit_monate','status','wie_vielt_verlaengerung','kommentar',
    'abgerechnet','gewonnen_datum','gewonnen_monat'];
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'abgerechnet') return req.body[f] ?? (req.body.status === 'Gewonnen' ? 'Nein' : null);
    return req.body[f] ?? null;
  });

  if (db.dialect === 'postgres') {
    const ph = fields.map((_,i) => `$${i+1}`).join(',');
    const row = await db.get(`INSERT INTO deals_vl (${fields.join(',')}) VALUES (${ph}) RETURNING *`, values);
    res.status(201).json(row);
  } else {
    const ph = fields.map(() => '?').join(',');
    const result = db.run(`INSERT INTO deals_vl (${fields.join(',')}) VALUES (${ph})`, values);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body, gewonnen_datum, gewonnen_monat });
  }
}));

router.put('/:id', wrap(async (req, res) => {
  const existing = db.get('SELECT * FROM deals_vl WHERE id=?', [req.params.id]);
  const { gewonnen_datum, gewonnen_monat } = resolveGewonnenFelder(req.body, existing);

  const fields = ['datum','monat','company_id','kam_id','kunde','dienstleistung','angebotswert',
    'ae_wert','laufzeit_monate','status','wie_vielt_verlaengerung','kommentar',
    'abgerechnet','gewonnen_datum','gewonnen_monat'];
  const values = fields.map(f => {
    if (f === 'gewonnen_datum') return gewonnen_datum;
    if (f === 'gewonnen_monat') return gewonnen_monat;
    if (f === 'abgerechnet') return req.body[f] ?? (req.body.status === 'Gewonnen' ? 'Nein' : null);
    return req.body[f] ?? null;
  });

  if (db.dialect === 'postgres') {
    const set = fields.map((f,i) => `${f}=$${i+1}`).join(',');
    const row = await db.get(
      `UPDATE deals_vl SET ${set}, updated_at=NOW() WHERE id=$${fields.length+1} RETURNING *`,
      [...values, req.params.id]
    );
    res.json(row);
  } else {
    const set = fields.map(f => `${f}=?`).join(',');
    db.run(`UPDATE deals_vl SET ${set}, updated_at=datetime('now') WHERE id=?`, [...values, req.params.id]);
    res.json(db.get(BASE_SELECT + ' WHERE d.id=?', [req.params.id]));
  }
}));

router.delete('/:id', wrap(async (req, res) => {
  const p = db.dialect === 'postgres' ? '$1' : '?';
  await db.run(`DELETE FROM deals_vl WHERE id=${p}`, [req.params.id]);
  res.status(204).end();
}));

module.exports = router;
