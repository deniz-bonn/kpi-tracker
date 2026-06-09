const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');

router.get('/', wrap(async (req, res) => {
  const { company_id, monat } = req.query;
  const conditions = [];
  const params = [];
  let i = 1;
  const p = () => db.dialect === 'postgres' ? `$${i++}` : '?';

  if (company_id) { conditions.push(`company_id = ${p()}`); params.push(company_id); }
  if (monat) { conditions.push(`monat = ${p()}`); params.push(monat); }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  res.json(await db.all('SELECT * FROM targets' + where + ' ORDER BY monat DESC', params));
}));

router.post('/', wrap(async (req, res) => {
  const { company_id, monat, nk_ziel, bk_ziel, vl_ziel } = req.body;
  if (!company_id || !monat) return res.status(400).json({ error: 'company_id and monat required' });

  if (db.dialect === 'postgres') {
    const row = await db.get(
      `INSERT INTO targets (company_id, monat, nk_ziel, bk_ziel, vl_ziel)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (company_id, monat) DO UPDATE SET nk_ziel=$3, bk_ziel=$4, vl_ziel=$5
       RETURNING *`,
      [company_id, monat, nk_ziel ?? null, bk_ziel ?? null, vl_ziel ?? null]
    );
    res.status(201).json(row);
  } else {
    db.run(
      `INSERT INTO targets (company_id, monat, nk_ziel, bk_ziel, vl_ziel) VALUES (?,?,?,?,?)
       ON CONFLICT (company_id, monat) DO UPDATE SET nk_ziel=excluded.nk_ziel, bk_ziel=excluded.bk_ziel, vl_ziel=excluded.vl_ziel`,
      [company_id, monat, nk_ziel ?? null, bk_ziel ?? null, vl_ziel ?? null]
    );
    res.status(201).json(await db.get('SELECT * FROM targets WHERE company_id=? AND monat=?', [company_id, monat]));
  }
}));

module.exports = router;
