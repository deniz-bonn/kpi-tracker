const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { loadRates, toEur } = require('../utils/currency');

router.use(requireAuth);

const BASE_SELECT = `
  SELECT u.*, c.currency
  FROM upsale_deals u
  JOIN deals_vl v ON v.id = u.deals_vl_id
  LEFT JOIN companies c ON c.id = v.company_id
`;

router.get('/', wrap(async (req, res) => {
  const { deals_vl_id, company_id } = req.query;
  const conditions = [];
  const params = [];
  let i = 1;
  const p = () => db.dialect === 'postgres' ? `$${i++}` : '?';

  if (deals_vl_id) { conditions.push(`u.deals_vl_id = ${p()}`); params.push(deals_vl_id); }
  if (company_id)  { conditions.push(`v.company_id = ${p()}`);   params.push(company_id); }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const rows = await db.all(BASE_SELECT + where + ' ORDER BY u.angebotsdatum DESC, u.created_at DESC', params);
  // CHF → EUR anhand des Angebotsmonats (Company-Währung des zugehörigen VL-Deals)
  const rates = await loadRates();
  rows.forEach(u => {
    const monat = (u.angebotsdatum || '').slice(0, 7);
    u.angebotsvolumen_eur      = u.angebotsvolumen      == null ? null : toEur(u.angebotsvolumen, u.currency, monat, rates);
    u.angenommenes_volumen_eur = u.angenommenes_volumen == null ? null : toEur(u.angenommenes_volumen, u.currency, monat, rates);
  });
  res.json(rows);
}));

router.post('/', wrap(async (req, res) => {
  const fields = ['deals_vl_id','angebotsdatum','angebotsvolumen','status',
    'angenommenes_volumen','auto_verlaengerung','laufzeit_monate','kommentar'];
  const values = fields.map(f => req.body[f] ?? null);

  let row;
  if (db.dialect === 'postgres') {
    const ph = fields.map((_, i) => `$${i + 1}`).join(',');
    row = await db.get(`INSERT INTO upsale_deals (${fields.join(',')}) VALUES (${ph}) RETURNING *`, values);
  } else {
    const ph = fields.map(() => '?').join(',');
    const result = db.run(`INSERT INTO upsale_deals (${fields.join(',')}) VALUES (${ph})`, values);
    row = db.get('SELECT * FROM upsale_deals WHERE id=?', [result.lastInsertRowid]);
  }
  res.status(201).json(row);
}));

router.put('/:id', wrap(async (req, res) => {
  const fields = ['angebotsdatum','angebotsvolumen','status',
    'angenommenes_volumen','auto_verlaengerung','laufzeit_monate','kommentar'];
  const values = fields.map(f => req.body[f] ?? null);

  let row;
  if (db.dialect === 'postgres') {
    const set = fields.map((f, i) => `${f}=$${i + 1}`).join(',');
    row = await db.get(
      `UPDATE upsale_deals SET ${set}, updated_at=NOW() WHERE id=$${fields.length + 1} RETURNING *`,
      [...values, req.params.id]
    );
  } else {
    const set = fields.map(f => `${f}=?`).join(',');
    db.run(`UPDATE upsale_deals SET ${set}, updated_at=datetime('now') WHERE id=?`, [...values, req.params.id]);
    row = db.get('SELECT * FROM upsale_deals WHERE id=?', [req.params.id]);
  }
  res.json(row);
}));

router.delete('/:id', wrap(async (req, res) => {
  const p = db.dialect === 'postgres' ? '$1' : '?';
  await db.run(`DELETE FROM upsale_deals WHERE id=${p}`, [req.params.id]);
  res.status(204).end();
}));

module.exports = router;
