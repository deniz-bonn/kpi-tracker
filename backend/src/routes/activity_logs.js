const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

const FIELDS = [
  'employee_id','company_id','datum','monat',
  'entscheider_erreicht','entscheider_terminiert',
  'terminiert_cold_calls','terminiert_inbound',
  'settings_geplant','settings_stattgefunden',
  'setting_abgesagt','setting_verschoben','nicht_erreicht',
  'unqualifiziert','follow_up','beratung_vereinbart',
  'beratungen_geplant','beratungen_stattgefunden',
  'beratungen_verschoben','beratungen_no_show',
  'beratungen_follow_up_cc2','beratungen_direkter_close','beratungen_kein_close',
  'inbound_mail','inbound_fax','inbound_ad','kommentar',
];

const BASE_SELECT = `
  SELECT a.*, e.name AS employee_name, e.rolle AS employee_rolle, e.standort AS employee_standort
  FROM activity_logs a
  LEFT JOIN employees e ON e.id = a.employee_id
`;

router.get('/', wrap(async (req, res) => {
  const { company_id, monat, datum, employee_id } = req.query;
  const conds = []; const params = []; let i = 1;
  const p = () => db.dialect === 'postgres' ? `$${i++}` : '?';

  if (company_id)  { conds.push(`a.company_id = ${p()}`);  params.push(company_id); }
  if (monat)       { conds.push(`a.monat = ${p()}`);       params.push(monat); }
  if (datum)       { conds.push(`a.datum = ${p()}`);       params.push(datum); }
  if (employee_id) { conds.push(`a.employee_id = ${p()}`); params.push(employee_id); }

  const where = conds.length ? ' WHERE ' + conds.join(' AND ') : '';
  res.json(await db.all(BASE_SELECT + where + ' ORDER BY a.datum DESC, e.name', params));
}));

// Upsert — create or update by (employee_id, datum)
router.post('/', wrap(async (req, res) => {
  const body = req.body;
  const num = f => Number(body[f]) || 0;
  const vals = FIELDS.map(f => ['employee_id','company_id'].includes(f)
    ? (Number(body[f]) || null)
    : ['datum','monat','kommentar'].includes(f) ? (body[f] ?? null) : num(f));

  let row;
  if (db.dialect === 'postgres') {
    const ph     = FIELDS.map((_, j) => `$${j + 1}`).join(',');
    const update = FIELDS.filter(f => !['employee_id','company_id','datum','monat'].includes(f))
                         .map(f => `${f}=EXCLUDED.${f}`).join(',');
    row = await db.get(
      `INSERT INTO activity_logs (${FIELDS.join(',')}) VALUES (${ph})
       ON CONFLICT (employee_id, datum) DO UPDATE SET ${update}, updated_at=NOW()
       RETURNING *`,
      vals
    );
  } else {
    const ph     = FIELDS.map(() => '?').join(',');
    const update = FIELDS.filter(f => !['employee_id','datum'].includes(f))
                         .map(f => `${f}=excluded.${f}`).join(',');
    db.run(
      `INSERT INTO activity_logs (${FIELDS.join(',')}) VALUES (${ph})
       ON CONFLICT(employee_id, datum) DO UPDATE SET ${update}, updated_at=datetime('now')`,
      vals
    );
    row = db.get(BASE_SELECT + ' WHERE a.employee_id=? AND a.datum=?', [body.employee_id, body.datum]);
  }
  res.status(201).json(row);
}));

router.delete('/:id', wrap(async (req, res) => {
  const p = db.dialect === 'postgres' ? '$1' : '?';
  await db.run(`DELETE FROM activity_logs WHERE id=${p}`, [req.params.id]);
  res.status(204).end();
}));

module.exports = router;
