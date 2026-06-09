const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');

router.get('/', wrap(async (req, res) => {
  const rows = await db.all('SELECT * FROM companies ORDER BY name');
  res.json(rows);
}));

router.post('/', wrap(async (req, res) => {
  const { name, standort } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  if (db.dialect === 'postgres') {
    const row = await db.get(
      'INSERT INTO companies (name, standort) VALUES ($1, $2) RETURNING *',
      [name, standort || null]
    );
    res.status(201).json(row);
  } else {
    const result = db.run('INSERT INTO companies (name, standort) VALUES (?, ?)', [name, standort || null]);
    res.status(201).json({ id: result.lastInsertRowid, name, standort, aktiv: 1 });
  }
}));

router.patch('/:id', wrap(async (req, res) => {
  const { name, standort, aktiv } = req.body;
  if (db.dialect === 'postgres') {
    const row = await db.get(
      'UPDATE companies SET name=COALESCE($1,name), standort=COALESCE($2,standort), aktiv=COALESCE($3,aktiv) WHERE id=$4 RETURNING *',
      [name, standort, aktiv, req.params.id]
    );
    res.json(row);
  } else {
    db.run(
      'UPDATE companies SET name=COALESCE(?,name), standort=COALESCE(?,standort), aktiv=COALESCE(?,aktiv) WHERE id=?',
      [name, standort, aktiv, req.params.id]
    );
    res.json(await db.get('SELECT * FROM companies WHERE id=?', [req.params.id]));
  }
}));

module.exports = router;
