// KPIs aus dem Tracker je Mitarbeiter und Zeitraum, gegen Tagesziel-Pace.
//   Ist:  activity_logs (Entscheider erreicht, terminiert, Settings geplant/stattgefunden, Sales Calls gelegt/stattgefunden),
//         deals_nk (gewonnen, AE in EUR mit AE-Gate wie Dashboard/Board).
//   Soll: board_ziele je Person (ziel_tag fuer settings / sales_calls / ae) x Werktage Mo–Fr bis Stichtag.
//         KPIs ohne Tagesziel: nur Ist (Festlegung 04.11.2026).
//   Team: Tagesziele aus shared/kpiConstants.json (Team gesamt), AE-Ziel Bonn aus monthly_targets_standort.
const { db, P, PH, TEAM, werktageIm, r2 } = require('./basis');
const { aeEurGatedSql } = require('../utils/currency');
const K = require('../../../shared/kpiConstants.json');

const AE = aeEurGatedSql('d', 'c');
const LOGS = ['entscheider_erreicht', 'entscheider_terminiert', 'settings_geplant', 'settings_stattgefunden',
  'beratung_vereinbart', 'beratung_vereinbart_direkt', 'beratungen_geplant', 'beratungen_stattgefunden'];
const n = (v) => Number(v) || 0;

async function personKpis(employeeId, { von, bis, stichtag, closer = true }) {
  const ist = Object.fromEntries(LOGS.map(f => [f, 0]));
  if (employeeId) {
    const r = await db.get(`SELECT ${LOGS.map(f => `COALESCE(SUM(${f}),0) AS ${f}`).join(', ')} FROM activity_logs
                             WHERE employee_id=${P(1)} AND datum >= ${P(2)} AND datum <= ${P(3)}`, [employeeId, von, bis]);
    for (const f of LOGS) ist[f] = n(r && r[f]);
  }
  const deals = employeeId ? await db.get(
    `SELECT COUNT(*) AS anzahl, COALESCE(SUM(CASE WHEN d.closer_id=${P(1)} THEN ${AE} ELSE 0 END),0) AS ae_closer, COALESCE(SUM(${AE}),0) AS ae_beteiligt,
            SUM(CASE WHEN d.closer_id=${P(1)} THEN 1 ELSE 0 END) AS als_closer
       FROM deals_nk d LEFT JOIN companies c ON c.id = d.company_id
      WHERE d.status='Gewonnen' AND d.gewonnen_datum >= ${P(2)} AND d.gewonnen_datum <= ${P(3)}
        AND (d.closer_id=${P(1)} OR d.setter_id=${P(1)} OR d.opener_id=${P(1)})`, [employeeId, von, bis]) : null;
  const ziele = employeeId ? await db.all(`SELECT kennzahl, ziel_tag FROM board_ziele WHERE employee_id=${P(1)}`, [employeeId]) : [];
  const zt = Object.fromEntries(ziele.filter(z => z.ziel_tag != null).map(z => [z.kennzahl, Number(z.ziel_tag)]));
  const wt = werktageIm(von, stichtag < bis ? stichtag : bis);
  const pace = (ist2, kennz) => (zt[kennz] != null ? { soll: r2(zt[kennz] * wt), ziel_tag: zt[kennz], erreichung: zt[kennz] * wt ? Math.round(100 * ist2 / (zt[kennz] * wt)) : null } : null);
  const scGelegt = ist.beratung_vereinbart + ist.beratung_vereinbart_direkt;
  const ae = r2(n(deals && deals.ae_closer));
  return {
    werktage: wt,
    kpis: [
      { key: 'entscheider_erreicht', label: 'Entscheider erreicht', ist: ist.entscheider_erreicht, pace: null },
      { key: 'terminiert', label: 'Terminiert (Settings gelegt)', ist: ist.entscheider_terminiert, pace: pace(ist.entscheider_terminiert, 'settings') },
      { key: 'settings_geplant', label: 'Settings geplant', ist: ist.settings_geplant, pace: null },
      { key: 'settings_stattgefunden', label: 'Settings stattgefunden', ist: ist.settings_stattgefunden, pace: null },
      { key: 'sc_gelegt', label: 'Sales Calls gelegt', ist: scGelegt, pace: pace(scGelegt, 'sales_calls') },
      { key: 'sc_stattgefunden', label: 'Sales Calls stattgefunden', ist: ist.beratungen_stattgefunden, pace: null },
      { key: 'gewonnen', label: 'Gewonnen (beteiligt)', ist: n(deals && deals.anzahl), pace: null },
      closer
        ? { key: 'ae', label: 'AE als Closer (EUR)', ist: ae, pace: pace(ae, 'ae') }
        // Opener/Setter: AE wird dem Closer gutgeschrieben — hier der AE der Deals, an denen die Person beteiligt war.
        : { key: 'ae', label: 'AE beteiligt (EUR)', ist: r2(n(deals && deals.ae_beteiligt)), pace: null },
    ],
  };
}

async function teamKpis(employeeIds, { von, bis, stichtag }) {
  const ids = employeeIds.filter(Boolean);
  const r = ids.length ? await db.get(`SELECT ${LOGS.map(f => `COALESCE(SUM(${f}),0) AS ${f}`).join(', ')} FROM activity_logs
                                         WHERE employee_id IN (${PH(ids.length)}) AND datum >= ${P(ids.length + 1)} AND datum <= ${P(ids.length + 2)}`,
  [...ids, von, bis]) : {};
  const ae = await db.get(
    `SELECT COUNT(*) anzahl, COALESCE(SUM(${AE}),0) ae FROM deals_nk d JOIN employees e ON e.id = d.closer_id LEFT JOIN companies c ON c.id = d.company_id
      WHERE d.status='Gewonnen' AND e.standort=${P(1)} AND d.gewonnen_datum >= ${P(2)} AND d.gewonnen_datum <= ${P(3)}`, [TEAM.standort, von, bis]);
  const wt = werktageIm(von, stichtag < bis ? stichtag : bis);
  const monat = von.slice(0, 7);
  const zielAe = await db.get(`SELECT ziel_ae FROM monthly_targets_standort WHERE monat=${P(1)} AND standort=${P(2)}`, [monat, TEAM.standort]).catch(() => null);
  const [y, m] = monat.split('-').map(Number);
  const wtMonat = werktageIm(`${monat}-01`, `${monat}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`);
  const aeSoll = zielAe && zielAe.ziel_ae != null && wtMonat ? r2(Number(zielAe.ziel_ae) / wtMonat * wt) : null;
  const sc = n(r.beratung_vereinbart) + n(r.beratung_vereinbart_direkt);
  return {
    werktage: wt,
    zeilen: [
      { label: 'Settings gelegt (terminiert)', ist: n(r.entscheider_terminiert), soll: K.tagesziele.settings * wt },
      { label: 'Sales Calls gelegt', ist: sc, soll: K.tagesziele.sales_calls * wt },
      { label: 'Sales Calls stattgefunden', ist: n(r.beratungen_stattgefunden), soll: null },
      { label: 'Gewonnen (Bonn)', ist: n(ae && ae.anzahl), soll: null },
      { label: 'AE Bonn (EUR)', ist: r2(n(ae && ae.ae)), soll: aeSoll },
    ],
  };
}

/** Durchschnittlicher Deal (AE je gewonnenem NK-Deal Bonn, letzte 90 Tage) fuer die Potenzial-Rechnung. */
async function durchschnittDeal(stichtag) {
  const von = new Date(Date.parse(stichtag + 'T12:00:00Z') - 90 * 864e5).toISOString().slice(0, 10);
  const r = await db.get(
    `SELECT COUNT(*) anzahl, COALESCE(SUM(${AE}),0) ae FROM deals_nk d JOIN employees e ON e.id = d.closer_id LEFT JOIN companies c ON c.id = d.company_id
      WHERE d.status='Gewonnen' AND e.standort=${P(1)} AND d.gewonnen_datum >= ${P(2)} AND d.gewonnen_datum <= ${P(3)}`, [TEAM.standort, von, stichtag]);
  return n(r && r.anzahl) ? { wert: r2(n(r.ae) / n(r.anzahl)), basis: n(r.anzahl), von, bis: stichtag } : { wert: null, basis: 0, von, bis: stichtag };
}

module.exports = { personKpis, teamKpis, durchschnittDeal };
