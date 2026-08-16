const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { buildKpiExport, toCsv } = require('../utils/kpiExport');

router.use(requireAuth);

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape  = (v) => {
    if (v === null || v === undefined) return '';
    // DATE-Spalten kommen aus Postgres als JS-Date-Objekt -> als YYYY-MM-DD ausgeben
    // (lokale Komponenten, kein toISOString/UTC-Shift), sonst steht "Wed Aug 05 2026 ..." im CSV.
    const s = v instanceof Date
      ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`
      : String(v);
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
  const { company_id, monat, monat_von, monat_bis, status } = req.query;
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
  if (monat) {
    conditions.push(`d.monat = ${p()}`); params.push(monat);
  } else {
    // Zeitraum (Von–Bis): monat ist CHAR(7), vergleicht lexikografisch korrekt.
    // Nur wenn kein Einzelmonat gesetzt ist -- Einzelmonat bleibt der Default.
    if (monat_von) { conditions.push(`d.monat >= ${p()}`); params.push(monat_von); }
    if (monat_bis) { conditions.push(`d.monat <= ${p()}`); params.push(monat_bis); }
  }
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
           d.angebot_erstellt, d.kein_angebot_grund, d.kein_angebot_grund_text,
           d.gewonnen_monat, d.gewonnen_datum, d.kommentar
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
           d.gewonnen_monat, d.gewonnen_datum, d.kommentar
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
           d.gewonnen_monat, d.gewonnen_datum, d.kommentar
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

// ── GET /api/export/kpi-vollexport.csv ───────────────────────────────────────
// Vollexport der KPI-Mitarbeiter-Beta-Auswertung (Sektionen S0–S8), Long-Format.
// Query: von, bis (YYYY-MM-DD), granularitaet (tag|woche|monat), stichtag, standort, company_id
router.get('/kpi-vollexport.csv', wrap(async (req, res) => {
  const { von, bis, granularitaet, stichtag, standort, company_id } = req.query;
  if (!von || !bis) return res.status(400).json({ error: 'von und bis sind erforderlich' });

  const { columns, rows, meta } = await buildKpiExport({
    von, bis, granularitaet, stichtag, standort, company_id,
  });

  const label = standort ? String(standort).replace(/[^\wÄÖÜäöüß-]/g, '_') : 'alle';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition',
    `attachment; filename="kpi-vollexport_${meta.von}_${meta.bis}_${label}.csv"`);
  res.send(toCsv(columns, rows));
}));

module.exports = router;
