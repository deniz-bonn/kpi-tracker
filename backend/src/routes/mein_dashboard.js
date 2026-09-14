// "Mein Dashboard" — persoenliche Startseite je Vertriebler.
//
// EIN gebuendelter Endpoint statt acht Einzelcalls (Vorgabe PRD). Liefert Provision, eigene Deals,
// Forecast, KPIs und den Incentive-Stand.
//
// ZUGRIFF — hier gilt STRIKT "nur eigene Daten": Alles haengt an req.user.employee_id, es gibt
// KEINEN Parameter, mit dem sich eine fremde Person abfragen liesse. Das ist die bewusste
// Ausnahme gegenueber der allgemeinen Deal-API: dort sehen nk_vertrieb-Nutzer absichtlich ALLE
// NK-Deals (Treppchen, Abschlussquoten, Bestenliste leben von der Team-Sichtbarkeit). Hier nicht —
// Provisions- und Incentive-Daten sind persoenlich. Siehe auch den Kommentar in deals_nk.js.
const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const { requireFeature } = require('../middleware/requireFeature');
const { logAudit } = require('../utils/audit');
const { kreisFor, resolveZeitraum, detailFor, staffelStatus } = require('../utils/provisionen');
const { aeEurGatedSql, moneyEurSql } = require('../utils/currency');
const inc = require('../utils/incentive');
const { provisionsForecast, aeForecast, ZIEL_CLOSING_RATE } = require('../utils/forecast');

const P  = (i) => (db.dialect === 'postgres' ? `$${i}` : '?');
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const heute = inc.heute;

router.use(requireAuth);
router.use(requireFeature('mein_dashboard'));

// Status, die als "offen" gelten — deckungsgleich mit der Deal-Liste im NK-Bereich.
const OFFEN = ['Offen', 'In Verhandlung', 'In Closing Call 2'];

/** Alle Deals, an denen die Person in IRGENDEINER Rolle haengt (ODER, nicht UND). */
async function meineDeals(empId, { von = null, bis = null } = {}) {
  const p = [];
  let i = 1;
  const add = (v) => { p.push(v); return P(i++); };
  const emp = add(empId), emp2 = add(empId), emp3 = add(empId);
  let zeit = '';
  if (von && bis) zeit = ` AND d.gewonnen_monat >= ${add(von)} AND d.gewonnen_monat <= ${add(bis)}`;
  return db.all(
    `SELECT d.id, d.kunde, d.datum, d.monat, d.status, d.gewonnen_monat, d.gewonnen_datum,
            d.opener_id, d.setter_id, d.closer_id, d.quelle,
            ${aeEurGatedSql('d', 'c')} AS ae_eur,
            ${moneyEurSql('angebotswert', 'monat', 'd', 'c')} AS angebotswert_eur
       FROM deals_nk d LEFT JOIN companies c ON c.id = d.company_id
      WHERE (d.opener_id = ${emp} OR d.setter_id = ${emp2} OR d.closer_id = ${emp3})${zeit}
      ORDER BY d.datum DESC`, p);
}

/** Rolle(n) der Person an einem Deal — fuer die Deal-Liste im UI. */
const rollenAn = (d, empId) => [
  String(d.opener_id) === String(empId) ? 'Opener' : null,
  String(d.setter_id) === String(empId) ? 'Setter' : null,
  String(d.closer_id) === String(empId) ? 'Closer' : null,
].filter(Boolean);

// ── GET /api/mein-dashboard ──────────────────────────────────────────────────
router.get('/', wrap(async (req, res) => {
  const empId = req.user.employee_id;
  if (!empId) {
    return res.json({ employee: null, hinweis: 'Kein Mitarbeiter mit diesem Account verknüpft.' });
  }
  const emp = await db.get(
    `SELECT id, name, rolle, standort FROM employees WHERE id=${P(1)}`, [empId]);
  const kreis = kreisFor(emp?.standort) || 'bonn';

  // ── 1) Provision: laufender/gewaehlter Zeitraum + Historie ──
  const z = await resolveZeitraum(req.query.zeitraum_id, kreis);
  const provision = z ? await detailFor(empId, z) : { summe: 0, perTyp: {}, buchungen: [] };
  const zeitraeume = await db.all(
    `SELECT id, von, bis, label, status, abgeschlossen_am FROM provision_zeitraeume
      WHERE kreis=${P(1)} ORDER BY von DESC`, [kreis]);
  // Summe je Zeitraum in EINER Abfrage (statt N Aufrufen von /me).
  const summen = await db.all(
    `SELECT zeitraum_id, COALESCE(SUM(betrag),0) summe FROM provision_buchungen
      WHERE employee_id=${P(1)} GROUP BY zeitraum_id`, [empId]);
  const summeVon = Object.fromEntries(summen.map(s => [String(s.zeitraum_id), r2(s.summe)]));
  const ss = await staffelStatus(heute().slice(0, 7));
  const staffel = ss.closers.find(c => c.employee_id === empId) || null;

  // ── 2) Eigene Deals ──
  const alle = await meineDeals(empId);
  const imZeitraum = (d) => {
    if (!z) return true;
    const tag = String(d.gewonnen_datum || d.datum || '').slice(0, 10);
    return tag >= String(z.von).slice(0, 10) && tag <= String(z.bis).slice(0, 10);
  };
  const scope   = alle.filter(imZeitraum);
  const gewonnen = scope.filter(d => d.status === 'Gewonnen');
  const offen    = alle.filter(d => OFFEN.includes(d.status));   // offen: immer der volle Bestand
  const verloren = scope.filter(d => d.status === 'Verloren');
  const vol = (arr, feld) => r2(arr.reduce((s, d) => s + (Number(d[feld]) || 0), 0));
  const mapDeal = (d) => ({ id: d.id, kunde: d.kunde, datum: d.datum, status: d.status,
    gewonnen_monat: d.gewonnen_monat, rollen: rollenAn(d, empId),
    wert: d.status === 'Gewonnen' ? r2(d.ae_eur) : r2(d.angebotswert_eur) });

  const deals = {
    gewonnen: { n: gewonnen.length, volumen: vol(gewonnen, 'ae_eur'), liste: gewonnen.map(mapDeal) },
    offen:    { n: offen.length,    volumen: vol(offen, 'angebotswert_eur'), liste: offen.map(mapDeal) },
    verloren: { n: verloren.length, volumen: vol(verloren, 'angebotswert_eur'), liste: verloren.map(mapDeal) },
    ae_je_abschluss: gewonnen.length ? r2(vol(gewonnen, 'ae_eur') / gewonnen.length) : null,
  };

  // ── 3) Provisions-Forecast ──
  const forecast = await provisionsForecast({
    empId, standort: emp?.standort,
    offene: offen.map(d => ({ opener_id: d.opener_id, setter_id: d.setter_id, closer_id: d.closer_id,
      wert: Number(d.angebotswert_eur) || 0 })),
    gebucht: provision.summe, stichtag: heute(),
  });

  // ── 4) KPIs: Termine/Show-Rate des laufenden Monats ──
  const km = heute().slice(0, 7);
  const termine = await db.all(
    `SELECT art, COUNT(*) gelegt,
            SUM(CASE WHEN status IN ('stattgefunden','nicht_stattgefunden') THEN 1 ELSE 0 END) bewertet,
            SUM(CASE WHEN status='stattgefunden' THEN 1 ELSE 0 END) statt
       FROM termine WHERE employee_id=${P(1)} AND monat=${P(2)} GROUP BY art`, [empId, km]);
  const kpis = { monat: km, termine: termine.map(t => {
    const gelegt = Number(t.gelegt) || 0, bewertet = Number(t.bewertet) || 0, statt = Number(t.statt) || 0;
    const abdeckung = gelegt ? (bewertet / gelegt) * 100 : 0;
    const messbar = gelegt > 0 && bewertet >= inc.MIN_BASIS && abdeckung >= inc.MIN_BEWERTET;
    return { art: t.art, gelegt, bewertet, statt, abdeckung: Math.round(abdeckung),
      rate: bewertet ? Number((statt / bewertet * 100).toFixed(1)) : null, messbar };
  }) };

  // ── 5) Incentive ──
  const ziel = await db.get(
    `SELECT * FROM incentive_ziele WHERE employee_id=${P(1)} ORDER BY zeitraum_von DESC LIMIT 1`, [empId]);
  let incentive = null;
  if (ziel) {
    const f = await inc.fortschrittFuer(ziel);
    const monate = inc.monateVon(ziel.zeitraum_von, ziel.zeitraum_bis);
    const gate = await inc.teamGate(monate);
    const teamOk = gate.every(g => g.erreicht);
    // AE-Forecast auf die Messbasis: offene Angebotswerte NUR der Deals, an denen die Person in
    // ihrer Messbasis-Rolle haengt (nicht alle offenen Deals).
    const spalte = { opener: 'opener_id', setter: 'setter_id', closer: 'closer_id' }[ziel.messbasis];
    const offenMessbasis = offen.filter(d => String(d[spalte]) === String(empId));
    const aeFc = aeForecast({ aeGebucht: f.ae_gesamt,
      offenesVolumen: vol(offenMessbasis, 'angebotswert_eur') });
    incentive = {
      ...f, teamgate: gate, team_erreicht: teamOk, ae_forecast: aeFc,
      offene_messbasis: { n: offenMessbasis.length, volumen: vol(offenMessbasis, 'angebotswert_eur') },
      status: {
        warschau: inc.reiseStatus({ aeIst: f.ae_gesamt, aeZiel: f.ziele.warschau.ae,
          srIst: f.sr_mittel, srZiel: f.ziele.warschau.sr, teamNoetig: false }),
        muenchen: inc.reiseStatus({ aeIst: f.ae_gesamt, aeZiel: f.ziele.muenchen.ae,
          srIst: f.sr_mittel, srZiel: f.ziele.muenchen.sr, teamOk, teamNoetig: true }),
      },
      // Die Show-Rate rechnet ohne Ausnahme fuer Direkt-Settings — im Close-Modell nicht
      // identifizierbar. Das UI weist es aus, damit die Zahl einordbar bleibt.
      hinweis_direktsettings: ziel.showrate_art
        ? 'Show-Rate inkl. Direkt-Settings — sie sind in Close derzeit nicht als solche markiert.' : null,
    };
  }

  res.json({
    employee: { id: emp.id, name: emp.name, rolle: emp.rolle, standort: emp.standort, kreis },
    provision: { zeitraum: z, ...provision, staffel,
      zeitraeume: zeitraeume.map(zz => ({ ...zz, summe: summeVon[String(zz.id)] || 0 })) },
    deals, forecast, kpis, incentive,
    konfiguration: { closing_rate: ZIEL_CLOSING_RATE, teamziel: inc.TEAMZIEL_MONAT,
      freeze_tag: inc.FREEZE_TAG },
  });
}));

// ── Incentive-Ziele pflegen (nur Superadmin) ─────────────────────────────────
const nurSuperadmin = requireRole('superadmin');

router.get('/incentive/ziele', nurSuperadmin, wrap(async (_req, res) => {
  res.json(await db.all(
    `SELECT z.*, e.name FROM incentive_ziele z JOIN employees e ON e.id = z.employee_id
      ORDER BY z.zeitraum_von DESC, e.name`));
}));

router.put('/incentive/ziele/:id', nurSuperadmin, wrap(async (req, res) => {
  const alt = await db.get(`SELECT * FROM incentive_ziele WHERE id=${P(1)}`, [req.params.id]);
  if (!alt) return res.status(404).json({ error: 'Ziel nicht gefunden' });
  const felder = ['messbasis', 'showrate_art', 'ziel_ae_warschau', 'ziel_sr_warschau',
    'ziel_ae_muenchen', 'ziel_sr_muenchen', 'vorlaeufig', 'notiz'];
  // Teil-Update: fehlt ein Feld im Body, bleibt der Bestand (wie in deals_vl).
  const werte = felder.map(f => (req.body[f] === undefined ? alt[f] : req.body[f]));
  const set = felder.map((f, i) => `${f}=${P(i + 1)}`).join(',');
  await db.run(
    `UPDATE incentive_ziele SET ${set}, updated_at=${db.dialect === 'postgres' ? 'NOW()' : "datetime('now')"}
      WHERE id=${P(felder.length + 1)}`, [...werte, req.params.id]);
  const neu = await db.get(`SELECT * FROM incentive_ziele WHERE id=${P(1)}`, [req.params.id]);
  await logAudit({ user: req.user, action: 'update', entityType: 'incentive_ziel',
    entityId: Number(req.params.id), oldData: alt, newData: neu });
  res.json(neu);
}));

// Manuelles Neu-Einfrieren — ausdruecklich mit Audit-Eintrag (Vorgabe).
router.post('/incentive/freeze', nurSuperadmin, wrap(async (req, res) => {
  const { monat, neu } = req.body || {};
  if (monat && !/^\d{4}-\d{2}$/.test(monat)) {
    return res.status(400).json({ error: 'monat muss YYYY-MM sein' });
  }
  const r = await inc.freezeFaelligeMonate({ userId: req.user.id, nurMonat: monat || null, neu: !!neu });
  await logAudit({ user: req.user, action: 'incentive_freeze', entityType: 'incentive_monatswerte',
    entityId: null, newData: { monat: monat || 'alle faelligen', neu: !!neu, anzahl: r.eingefroren.length } });
  res.json(r);
}));

module.exports = router;
