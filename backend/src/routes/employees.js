const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');

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
  res.json(await db.all(sql, params));
}));

router.post('/', wrap(async (req, res) => {
  const { name, company_id, rolle, standort } = req.body;
  if (!name || !company_id || !rolle) return res.status(400).json({ error: 'name, company_id, rolle required' });

  if (db.dialect === 'postgres') {
    const row = await db.get(
      'INSERT INTO employees (name, company_id, rolle, standort) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, company_id, rolle, standort || null]
    );
    res.status(201).json(row);
  } else {
    const result = db.run('INSERT INTO employees (name, company_id, rolle, standort) VALUES (?,?,?,?)', [name, company_id, rolle, standort || null]);
    res.status(201).json({ id: result.lastInsertRowid, name, company_id, rolle, standort: standort || null, aktiv: 1 });
  }
}));

router.patch('/:id', wrap(async (req, res) => {
  const { name, company_id, rolle, standort, aktiv } = req.body;
  if (db.dialect === 'postgres') {
    const row = await db.get(
      'UPDATE employees SET name=COALESCE($1,name), company_id=COALESCE($2,company_id), rolle=COALESCE($3,rolle), standort=COALESCE($4,standort), aktiv=COALESCE($5,aktiv) WHERE id=$6 RETURNING *',
      [name, company_id, rolle, standort !== undefined ? standort || null : undefined, aktiv, req.params.id]
    );
    res.json(row);
  } else {
    db.run(
      'UPDATE employees SET name=COALESCE(?,name), company_id=COALESCE(?,company_id), rolle=COALESCE(?,rolle), standort=COALESCE(?,standort), aktiv=COALESCE(?,aktiv) WHERE id=?',
      [name ?? null, company_id ?? null, rolle ?? null, standort !== undefined ? standort || null : null, aktiv ?? null, req.params.id]
    );
    res.json(await db.get('SELECT e.*, c.name as company_name FROM employees e JOIN companies c ON c.id=e.company_id WHERE e.id=?', [req.params.id]));
  }
}));

module.exports = router;
