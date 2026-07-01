const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

const FIELDS = ['company_id','datum','monat','inbound_mail','inbound_fax','inbound_ad','terminiert_mail','terminiert_fax','terminiert_ad','kommentar'];

router.get('/', wrap(async (req, res) => {
  const { company_id, monat, datum } = req.query;
  const conds = []; const params = []; let i = 1;
  const p = () => db.dialect === 'postgres' ? `$${i++}` : '?';

  if (company_id) { conds.push(`company_id = ${p()}`); params.push(company_id); }
  if (monat)      { conds.push(`monat = ${p()}`);      params.push(monat); }
  if (datum)      { conds.push(`datum = ${p()}`);      params.push(datum); }

  const where = conds.length ? ' WHERE ' + conds.join(' AND ') : '';
  res.json(await db.all(`SELECT * FROM inbound_daily${where} ORDER BY datum DESC`, params));
}));

router.post('/', wrap(async (req, res) => {
  const body = req.body;
  const num  = f => Number(body[f]) || 0;
  const vals = FIELDS.map(f =>
    f === 'company_id'                        ? (Number(body[f]) || null) :
    ['datum','monat','kommentar'].includes(f) ? (body[f] ?? null)         : num(f)
  );

  let row;
  if (db.dialect === 'postgres') {
    const ph     = FIELDS.map((_, j) => `$${j + 1}`).join(',');
    const update = FIELDS.filter(f => !['company_id','datum'].includes(f))
                         .map(f => `${f}=EXCLUDED.${f}`).join(',');
    row = await db.get(
      `INSERT INTO inbound_daily (${FIELDS.join(',')}) VALUES (${ph})
       ON CONFLICT (company_id, datum) DO UPDATE SET ${update}, updated_at=NOW()
       RETURNING *`,
      vals
    );
  } else {
    const ph     = FIELDS.map(() => '?').join(',');
    const update = FIELDS.filter(f => !['company_id','datum'].includes(f))
                         .map(f => `${f}=excluded.${f}`).join(',');
    db.run(
      `INSERT INTO inbound_daily (${FIELDS.join(',')}) VALUES (${ph})
       ON CONFLICT(company_id, datum) DO UPDATE SET ${update}, updated_at=datetime('now')`,
      vals
    );
    row = db.get('SELECT * FROM inbound_daily WHERE company_id=? AND datum=?', [body.company_id, body.datum]);
  }
  res.status(201).json(row);
}));

module.exports = router;
