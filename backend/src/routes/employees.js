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

// BK-Gruppe (nur 'kam' | 'am' | null) validieren — betrifft praktisch nur rolle='Multi'.
const normBkGruppe = v => (v === 'kam' || v === 'am') ? v : null;

router.post('/', wrap(async (req, res) => {
  const { name, company_id, rolle, standort, bk_gruppe } = req.body;
  if (!name || !company_id || !rolle) return res.status(400).json({ error: 'name, company_id, rolle required' });
  const bk = normBkGruppe(bk_gruppe);

  if (db.dialect === 'postgres') {
    const row = await db.get(
      'INSERT INTO employees (name, company_id, rolle, standort, bk_gruppe) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, company_id, rolle, standort || null, bk]
    );
    res.status(201).json(row);
  } else {
    const result = db.run('INSERT INTO employees (name, company_id, rolle, standort, bk_gruppe) VALUES (?,?,?,?,?)', [name, company_id, rolle, standort || null, bk]);
    res.status(201).json({ id: result.lastInsertRowid, name, company_id, rolle, standort: standort || null, bk_gruppe: bk, aktiv: 1 });
  }
}));

router.patch('/:id', wrap(async (req, res) => {
  const { name, company_id, rolle, standort, aktiv, show_in_kpi } = req.body;
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
    res.json(await db.get('SELECT e.*, c.name as company_name FROM employees e JOIN companies c ON c.id=e.company_id WHERE e.id=?', [req.params.id]));
  }
}));

module.exports = router;
