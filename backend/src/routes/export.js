const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape  = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ];
  return lines.join('\r\n');
}

function buildFilter(req, userIdField) {
  const { company_id, monat, status } = req.query;
  const user = req.user;
  const conditions = [];
  const params = [];
  let i = 1;
  const p = () => db.dialect === 'postgres' ? `$${i++}` : '?';

  // Non-admin: restrict to own deals
  if (['nk_vertrieb', 'bk_vertrieb'].includes(user.role) && user.employee_id) {
    conditions.push(`d.${userIdField} = ${p()}`);
    params.push(user.employee_id);
  }
  if (company_id) { conditions.push(`d.company_id = ${p()}`); params.push(company_id); }
  if (monat)      { conditions.push(`d.monat = ${p()}`);      params.push(monat); }
  if (status)     { conditions.push(`d.status = ${p()}`);     params.push(status); }

  return { where: conditions.length ? ' WHERE ' + conditions.join(' AND ') : '', params };
}

// ── GET /api/export/nk.csv ───────────────────────────────────────────────────
router.get('/nk.csv', wrap(async (req, res) => {
  const { where, params } = buildFilter(req, 'closer_id');
  const sql = `
    SELECT d.datum, d.monat, c.name as company, d.kunde, d.angebotsnummer,
           d.dienstleistung, d.quelle,
           closer.name as closer, opener.name as opener, setter.name as setter,
           d.angebotswert, d.ae_wert, d.laufzeit_monate,
           d.automatische_verlaengerung, d.status, d.abgerechnet,
           d.gewonnen_datum, d.kommentar
    FROM deals_nk d
    LEFT JOIN companies c ON c.id = d.company_id
    LEFT JOIN employees closer ON closer.id = d.closer_id
    LEFT JOIN employees opener ON opener.id = d.opener_id
    LEFT JOIN employees setter ON setter.id = d.setter_id
    ${where} ORDER BY d.datum DESC
  `;
  const rows = db.dialect === 'postgres' ? await db.all(sql, params) : db.all(sql, params);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="neukunden.csv"');
  res.send('﻿' + toCSV(rows)); // BOM for Excel UTF-8 compatibility
}));

// ── GET /api/export/bk.csv ───────────────────────────────────────────────────
router.get('/bk.csv', wrap(async (req, res) => {
  const { where, params } = buildFilter(req, 'kam_id');
  const sql = `
    SELECT d.datum, d.monat, c.name as company, d.kunde, d.angebotsnummer,
           d.dienstleistung, k.name as kam,
           d.angebotswert, d.ae_wert, d.laufzeit_monate,
           d.automatische_verlaengerung, d.status, d.abgerechnet,
           d.gewonnen_datum, d.kommentar
    FROM deals_bk d
    LEFT JOIN companies c ON c.id = d.company_id
    LEFT JOIN employees k ON k.id = d.kam_id
    ${where} ORDER BY d.datum DESC
  `;
  const rows = db.dialect === 'postgres' ? await db.all(sql, params) : db.all(sql, params);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="bestandskunden.csv"');
  res.send('﻿' + toCSV(rows));
}));

// ── GET /api/export/vl.csv ───────────────────────────────────────────────────
router.get('/vl.csv', wrap(async (req, res) => {
  const { where, params } = buildFilter(req, 'kam_id');
  const sql = `
    SELECT d.datum, d.monat, c.name as company, d.kunde,
           d.dienstleistung, k.name as kam,
           d.angebotswert, d.ae_wert, d.laufzeit_monate,
           d.wie_vielt_verlaengerung, d.status, d.abgerechnet,
           d.gewonnen_datum, d.kommentar
    FROM deals_vl d
    LEFT JOIN companies c ON c.id = d.company_id
    LEFT JOIN employees k ON k.id = d.kam_id
    ${where} ORDER BY d.datum DESC
  `;
  const rows = db.dialect === 'postgres' ? await db.all(sql, params) : db.all(sql, params);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="verlaengerungen.csv"');
  res.send('﻿' + toCSV(rows));
}));

module.exports = router;
