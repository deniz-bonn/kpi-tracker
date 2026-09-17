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
const { requireFeature, requireAnyFeature, hatFeature } = require('../middleware/requireFeature');
const { freigeschaltetePersonen, istFreigeschaltet,
        alleRelevantenPersonen, istRelevant } = require('../utils/featureScope');
const { logAudit } = require('../utils/audit');
const { kreisFor, resolveZeitraum, detailFor, staffelStatus } = require('../utils/provisionen');
const { aeEurGatedSql, moneyEurSql } = require('../utils/currency');
const inc = require('../utils/incentive');
const { provisionsForecast, aeForecast, ZIEL_CLOSING_RATE } = require('../utils/forecast');

const P  = (i) => (db.dialect === 'postgres' ? `$${i}` : '?');
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const heute = inc.heute;

router.use(requireAuth);
// Die Seite oeffnet sich auch fuer reine Kontrolleure: wer nur KONTROLL_SICHT hat (z.B. die
// Vertriebsleitung), braucht Zugriff, ohne selbst fuer die Nutzer-Sicht freigeschaltet zu sein.
// Vorher pruefte der Router nur NUTZER_SICHT — das Frontend liess solche Nutzer auf die Seite,
// der Server antwortete 403. Genau das traf Tobias Boettcher.
router.use(requireAnyFeature('mein_dashboard', 'mein_dashboard_kontrolle'));

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

// Zwei Berechtigungen je Bereich, einheitliches Muster (siehe auch routes/provisionen.js):
//   NUTZER_SICHT   — sieht den Bereich mit den EIGENEN Daten
//   KONTROLL_SICHT — Team-Ueberblick + "Aus der Sicht von"
// Superadmin hat beides strukturell (hatFeature laesst ihn durch).
const NUTZER_SICHT   = 'mein_dashboard';
const KONTROLL_SICHT = 'mein_dashboard_kontrolle';
// Bereichsuebergreifend: wer den VOLLEN Kontroll-Scope hat, sieht ALLE dashboard-relevanten
// Mitarbeiter — auch ohne Nutzerkonto und mit deaktiviertem Konto. Superadmin hat es strukturell;
// weitere Personen werden ausdruecklich gleichgestellt (Chip in der Zugriffssteuerung).
// Delegierte Kontrolleure OHNE dieses Flag sehen weiterhin nur die Freischalt-Menge.
const VOLLER_SCOPE   = 'kontrolle_alle_mitarbeiter';

/**
 * Der komplette Dashboard-Datensatz EINER Person.
 *
 * Bewusst als Funktion und nicht im Handler: "Sehen als" und der Team-Ueberblick muessen exakt
 * dieselben Zahlen liefern wie der eigene Aufruf. Gaebe es hier zwei Wege, koennte die Kontrolle
 * etwas anderes zeigen als der Mitarbeiter — und waere damit wertlos.
 * `ss` (staffelStatus) kann durchgereicht werden, damit der Team-Ueberblick es nicht je Person neu
 * berechnet; das Ergebnis ist identisch, nur die Abfrage faellt einmal statt n-mal an.
 */
const AKT_MONAT = () => heute().slice(0, 7);
const MONAT_RE = /^\d{4}-\d{2}$/;

async function dashboardFuer(empId, { zeitraumId = null, monat = null, ss = null } = {}) {
  const emp = await db.get(
    `SELECT id, name, rolle, standort FROM employees WHERE id=${P(1)}`, [empId]);
  if (!emp) return null;
  const kreis = kreisFor(emp.standort) || 'bonn';

  // ── 1) Provision: laufender/gewaehlter Zeitraum + Historie ──
  const z = await resolveZeitraum(zeitraumId, kreis);
  const provision = z ? await detailFor(empId, z) : { summe: 0, perTyp: {}, buchungen: [] };
  const zeitraeume = await db.all(
    `SELECT id, von, bis, label, status, abgeschlossen_am FROM provision_zeitraeume
      WHERE kreis=${P(1)} ORDER BY von DESC`, [kreis]);
  // Summe je Zeitraum in EINER Abfrage (statt N Aufrufen von /me).
  const summen = await db.all(
    `SELECT zeitraum_id, COALESCE(SUM(betrag),0) summe FROM provision_buchungen
      WHERE employee_id=${P(1)} GROUP BY zeitraum_id`, [empId]);
  const summeVon = Object.fromEntries(summen.map(s => [String(s.zeitraum_id), r2(s.summe)]));
  const st = ss || await staffelStatus(heute().slice(0, 7));
  const staffel = st.closers.find(c => c.employee_id === empId) || null;

  // ── 2) Eigene Deals — Achse: KALENDERMONAT ──
  //
  // Frueher lief hier ein Datums-Vergleich gegen den PROVISIONS-Zeitraum:
  //     const tag = String(d.gewonnen_datum || d.datum || '').slice(0, 10);
  //     return tag >= String(z.von).slice(0, 10) && tag <= String(z.bis).slice(0, 10);
  // Das hatte ZWEI Fehler auf einmal, und beide sind mit der Monats-Achse strukturell weg:
  //
  // (a) TYPFEHLER, nur unter Postgres sichtbar: gewonnen_datum/datum sind DATE-Spalten und
  //     kommen aus node-pg als JS-Date zurueck. String(Date).slice(0,10) ergibt "Thu Aug 06",
  //     verglichen wurde gegen "2026-09-20" — als Zeichenkette liegt jedes Wochentagskuerzel
  //     ueber der Ziffer 2, die Bedingung war fuer JEDEN Deal falsch. Ergebnis in Produktion:
  //     "Gewonnen" und "Verloren" standen bei ALLEN Mitarbeitern auf 0, waehrend "Offen"
  //     stimmte — denn das laeuft bewusst nicht durch den Filter. Unter SQLite (Text-Spalten)
  //     rechnete derselbe Code richtig, deshalb fiel es lokal nie auf.
  //     gewonnen_monat/monat sind CHAR(7)-TEXT in beiden Dialekten — hier gibt es keinen Typ,
  //     der sich unterwegs verwandeln kann.
  //
  // (b) FALSCHE ACHSE: der Provisions-Zeitraum laeuft fuer Bonn vom 21. bis zum 20. und zog
  //     damit die letzten zehn Tage des Vormonats mit herein. Auswertung, Bestenliste, KPI
  //     Mitarbeiter und die Ziele zaehlen alle den Kalendermonat — die Zahlen konnten also
  //     gar nicht zusammenpassen. Die Provisionskachel oben behaelt ihren Abrechnungszeitraum
  //     (dort ist er richtig und steht auch dran); die Deal-Kacheln folgen jetzt dem Monat.
  //
  // Achsen je Kachel, bewusst unterschiedlich:
  //   gewonnen -> gewonnen_monat (Abschlussmonat, realisierter AE)
  //   verloren -> monat          (Angebotsmonat) — verlorene Deals haben KEIN gewonnen_monat
  //                              (0 von 513 im Bestand), ueber diese Achse waere die Kachel
  //                              dauerhaft leer geblieben.
  //   offen    -> voller Bestand, ungefiltert (der Forecast rechnet damit)
  const mon = MONAT_RE.test(String(monat || '')) ? String(monat) : AKT_MONAT();
  const alle = await meineDeals(empId);
  const gewonnen = alle.filter(d => d.status === 'Gewonnen' && d.gewonnen_monat === mon);
  const offen    = alle.filter(d => OFFEN.includes(d.status));   // offen: immer der volle Bestand
  const verloren = alle.filter(d => d.status === 'Verloren' && d.monat === mon);
  // Monate mit eigener Aktivitaet, fuer den Umschalter (neueste zuerst).
  const monate = [...new Set(alle.map(d => d.gewonnen_monat || d.monat).filter(m => MONAT_RE.test(String(m))))]
    .sort().reverse();
  if (!monate.includes(mon)) monate.unshift(mon);
  const vol = (arr, feld) => r2(arr.reduce((s, d) => s + (Number(d[feld]) || 0), 0));
  const mapDeal = (d) => ({ id: d.id, kunde: d.kunde, datum: d.datum, status: d.status,
    gewonnen_monat: d.gewonnen_monat, rollen: rollenAn(d, empId),
    wert: d.status === 'Gewonnen' ? r2(d.ae_eur) : r2(d.angebotswert_eur) });

  const deals = {
    gewonnen: { n: gewonnen.length, volumen: vol(gewonnen, 'ae_eur'), liste: gewonnen.map(mapDeal) },
    offen:    { n: offen.length,    volumen: vol(offen, 'angebotswert_eur'), liste: offen.map(mapDeal) },
    verloren: { n: verloren.length, volumen: vol(verloren, 'angebotswert_eur'), liste: verloren.map(mapDeal) },
    ae_je_abschluss: gewonnen.length ? r2(vol(gewonnen, 'ae_eur') / gewonnen.length) : null,
    monat: mon,          // auf welchen Monat sich gewonnen/verloren beziehen
    monate,              // Auswahl fuer den Umschalter
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

  return {
    employee: { id: emp.id, name: emp.name, rolle: emp.rolle, standort: emp.standort, kreis },
    provision: { zeitraum: z, ...provision, staffel,
      zeitraeume: zeitraeume.map(zz => ({ ...zz, summe: summeVon[String(zz.id)] || 0 })) },
    deals, forecast, kpis, incentive,
    konfiguration: { closing_rate: ZIEL_CLOSING_RATE, teamziel: inc.TEAMZIEL_MONAT,
      freeze_tag: inc.FREEZE_TAG },
  };
}

// Die Auswahl fuer "Aus der Sicht von" IST die Freischalt-Liste der Nutzer-Sicht: nur wer den
// Bereich selbst sehen darf, taucht hier auf. Serverseitig wird ?als= gegen dieselbe Menge
// validiert (istFreigeschaltet), nicht nur das Dropdown gefiltert.
const personenFuerAuswahl = (vollerScope, standort = null) => vollerScope
  ? alleRelevantenPersonen(NUTZER_SICHT, { standort })
  : freigeschaltetePersonen(NUTZER_SICHT, { standort });

/** Darf diese Person geoeffnet werden? Voller Scope: jede relevante. Sonst: nur freigeschaltete. */
const darfOeffnen = (vollerScope, empId) => vollerScope
  ? istRelevant(empId)
  : istFreigeschaltet(empId, NUTZER_SICHT);

// ── GET /api/mein-dashboard[?als=<employee_id>] ──────────────────────────────
router.get('/', wrap(async (req, res) => {
  const darfFremd   = await hatFeature(req.user, KONTROLL_SICHT);
  const vollerScope = darfFremd && await hatFeature(req.user, VOLLER_SCOPE);

  // `als` wirkt NUR fuer Berechtigte UND nur fuer Personen, die fuer die Nutzer-Sicht
  // freigeschaltet sind. Fuer alle anderen wird der Parameter still ignoriert — kein 403,
  // keine Fehlermeldung: ein Vertriebler soll ueber die Antwort nicht einmal herausfinden
  // koennen, welche employee_id existiert oder wer freigeschaltet ist.
  const gewuenscht = darfFremd && req.query.als ? Number(req.query.als) : null;
  const alsId = (gewuenscht && await darfOeffnen(vollerScope, gewuenscht)) ? gewuenscht : null;
  const empId = alsId || req.user.employee_id;
  const alsFremde = !!(alsId && String(alsId) !== String(req.user.employee_id));

  const sicht = {
    fremdsicht_erlaubt: darfFremd,
    als_fremde: alsFremde,
    voller_scope: vollerScope,
    personen: darfFremd ? await personenFuerAuswahl(vollerScope) : [],
  };

  if (!empId) {
    return res.json({ employee: null, sicht,
      hinweis: darfFremd
        ? 'Dein Account ist mit keinem Mitarbeiter verknüpft — nutze den Team-Überblick oder wähle oben eine Person.'
        : 'Kein Mitarbeiter mit diesem Account verknüpft.' });
  }

  const daten = await dashboardFuer(empId, { zeitraumId: req.query.zeitraum_id, monat: req.query.monat });
  if (!daten) return res.json({ employee: null, sicht, hinweis: 'Mitarbeiter nicht gefunden.' });

  // Leise protokollieren, wer wessen Sicht geoeffnet hat.
  if (alsFremde) {
    await logAudit({ user: req.user, action: 'sehen_als', entityType: 'mein_dashboard',
      entityId: empId, newData: { employee_id: empId, name: daten.employee.name } });
  }
  res.json({ ...daten, sicht });
}));

// ── GET /api/mein-dashboard/team — Ueberblick fuer Berechtigte ───────────────
router.get('/team', wrap(async (req, res) => {
  if (!await hatFeature(req.user, KONTROLL_SICHT)) {
    return res.status(403).json({ error: 'Keine Berechtigung für den Team-Überblick' });
  }
  const vollerScope = await hatFeature(req.user, VOLLER_SCOPE);
  const standort = req.query.standort || 'Bonn';
  const personen = await personenFuerAuswahl(vollerScope, standort === 'alle' ? null : standort);

  // staffelStatus einmal statt je Person — dieselbe Quelle, nur nicht n-mal abgefragt.
  const ss = await staffelStatus(heute().slice(0, 7));

  // Bewusst derselbe Rechenweg wie die Einzelsicht: dashboardFuer() je Person, danach nur
  // projiziert. Kein zweiter Pfad fuer AE/Show-Rate/Forecast — sonst koennte die Tabelle
  // etwas anderes zeigen als die Detailsicht.
  const zeilen = [];
  for (const p of personen) {
    const d = await dashboardFuer(p.id, { ss });
    if (!d) continue;
    const i = d.incentive;
    zeilen.push({
      employee_id: p.id, name: p.name, rolle: p.rolle, standort: p.standort,
      hat_konto: p.hat_konto, konto_aktiv: p.konto_aktiv, freigeschaltet: p.freigeschaltet,
      messbasis: i?.messbasis || null, showrate_art: i?.showrate_art || null,
      provision: d.provision.summe,
      forecast: d.forecast.forecast,
      ae_gesamt: i?.ae_gesamt ?? null,
      sr_mittel: i?.sr_mittel ?? null,
      sr_nicht_messbar: i ? i.sr_nicht_messbar : null,
      ae_forecast: i?.ae_forecast?.ae_forecast ?? null,
      ziele: i?.ziele || null,
      status: i?.status || null,
      vorlaeufig: i?.vorlaeufig || false,
      hat_incentive: !!i,
    });
  }

  // Teamgate einmal fuer alle — gleiche Komponente wie in der Mitarbeiter-Sicht.
  const irgendeinZiel = await db.get(`SELECT zeitraum_von, zeitraum_bis FROM incentive_ziele LIMIT 1`);
  const monate = irgendeinZiel
    ? inc.monateVon(irgendeinZiel.zeitraum_von, irgendeinZiel.zeitraum_bis) : [];
  // Wer ein Incentive-Ziel hat, aber NICHT freigeschaltet ist, faellt aus der Tabelle — sonst
  // kommentarlos. Das ist fast immer ein Versehen (fehlende Freischaltung, deaktiviertes Konto,
  // kein Nutzerkonto) und gehoert der Fuehrung vor Augen, statt als Luecke unterzugehen.
  const drin = new Set(zeilen.map(z => String(z.employee_id)));
  const fehlend = (await db.all(
    `SELECT e.id, TRIM(e.name) AS name, e.standort,
            MAX(CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END) AS hat_konto,
            MAX(CASE WHEN u.active = ${db.dialect === 'postgres' ? 'TRUE' : '1'} THEN 1 ELSE 0 END) AS konto_aktiv
       FROM incentive_ziele z
       JOIN employees e ON e.id = z.employee_id
       LEFT JOIN users u ON u.employee_id = e.id
      GROUP BY e.id, e.name, e.standort`))
    .filter(r => !drin.has(String(r.id)))
    .map(r => ({ employee_id: r.id, name: r.name, standort: r.standort,
      grund: Number(r.hat_konto) !== 1 ? 'kein Nutzerkonto'
           : Number(r.konto_aktiv) !== 1 ? 'Konto deaktiviert'
           : 'nicht für „Mein Dashboard" freigeschaltet' }));

  res.json({
    standort, standorte: ['Bonn', 'Braunschweig', 'Österreich', 'Schweiz'],
    teamgate: await inc.teamGate(monate),
    zeilen, voller_scope: vollerScope,
    // Incentive-Teilnehmer ohne Freischaltung — sie sehen ihr Dashboard nicht und stehen deshalb
    // auch nicht in der Tabelle.
    nicht_freigeschaltet: fehlend,
    konfiguration: { closing_rate: ZIEL_CLOSING_RATE, teamziel: inc.TEAMZIEL_MONAT },
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
