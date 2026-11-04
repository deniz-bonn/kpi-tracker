// ── Live-Board (/board): Wettbewerbs-Dashboard fuer den Bildschirm im Bonner NK-Vertrieb ───────
//
// Zugang auf ZWEI Wegen, beide nur lesend:
//   (a) angemeldete Person mit Feature 'live_board' (Session-JWT) — zum Ansehen und Einrichten
//   (b) Display-Token (api_tokens, Scope 'board:read', Migration 116) — fuer den TV. Das Token
//       oeffnet NUR diesen Router: die Session-Routen verlangen ein JWT, die externe API die
//       Scopes vl:*. Es gilt nur, solange die Person, die es erzeugt hat, aktiv ist und das
//       Feature noch hat — entzieht man ihr den Chip, wird auch der Bildschirm dunkel.
//
// KEINE NEUEN FORMELN. Jede Zahl stammt aus einer bestehenden Definition:
//   Auftragseingang   = incentive.teamGate / Dashboard nk_bonn: deals_nk Gewonnen, gewonnen_monat,
//                       Closer-Standort Bonn, aeEurGatedSql (EUR + ae_ab_monat-Gate)
//   Monatsziel        = monthly_targets_standort (Bonn) > shared/kpiConstants.json (750k = Bonn)
//   Teamgate          = incentive.TEAMZIEL (700k)
//   Settings/SC gelegt= termine (art setting/closing, gelegt_am), Attribution employee_id
//   Show-Rate + Gate  = utils/showrateRegeln.js (dieselben Regeln wie die Show-Rate-Seite)
//   Provision         = provision_buchungen (Journal) je Bonn-Zeitraum; Team-Anteil = rolle 'team'
//   Closing-Rate      = rechnet das Frontend mit rollenStats() auf den mitgelieferten Calls
// Scope: Standort Bonn, Neukunden.
const router = require('express').Router();
const db     = require('../db');
const wrap   = require('../middleware/asyncHandler');
const jwt    = require('jsonwebtoken');
const { SECRET } = require('../middleware/auth');
const { hatFeature } = require('../middleware/requireFeature');
const { hashToken, neuesToken, rateLimitUeberschritten } = require('../middleware/apiToken');
const { aeEurGatedSql, moneyEurSql } = require('../utils/currency');
const { heuteBerlin } = require('../utils/heute');
const { bewerte, MIN_BASIS } = require('../utils/showrateRegeln');
const { logAudit } = require('../utils/audit');
const K = require('../../../shared/kpiConstants.json');

const STANDORT = 'Bonn';
const TEAMZIEL = Number(process.env.INCENTIVE_TEAMZIEL || 700000);   // wie utils/incentive.js
const SCOPE    = 'board:read';
const pg = () => db.dialect === 'postgres';
const P  = (i) => (pg() ? `$${i}` : '?');
const wahr = (v) => v === true || v === 1 || v === '1' || v === 't';
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const ymd = (v) => (v == null ? null : (v instanceof Date ? heuteBerlin(v) : String(v).slice(0, 10)));

// ── Zugang ───────────────────────────────────────────────────────────────────────────────────
// Display-Token oder Session. Fehlerformat wie im Rest der App ({ error: '...' }).
async function boardZugang(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) return res.status(401).json({ error: 'Nicht angemeldet' });

    if (token.startsWith('kpt_')) {
      const row = await db.get(`SELECT * FROM api_tokens WHERE token_hash=${P(1)}`, [hashToken(token)]);
      if (!row || !wahr(row.aktiv) || row.widerrufen_am) return res.status(401).json({ error: 'Display-Sitzung ungültig oder widerrufen' });
      if (!String(row.scopes || '').split(',').includes(SCOPE)) return res.status(403).json({ error: 'Token ist keine Display-Sitzung' });
      // Die Person hinter dem Token muss (noch) aktiv sein und das Feature haben.
      const u = row.erstellt_von ? await db.get(`SELECT id, name, role, active FROM users WHERE id=${P(1)}`, [row.erstellt_von]) : null;
      if (!u || !wahr(u.active) || !(await hatFeature(u, 'live_board'))) {
        return res.status(403).json({ error: 'Die Person, die diese Display-Sitzung geöffnet hat, hat keinen Zugriff mehr' });
      }
      const warte = rateLimitUeberschritten(`board:${row.id}`);
      if (warte) { res.set('Retry-After', String(warte)); return res.status(429).json({ error: 'Zu viele Anfragen' }); }
      merkeBenutzung(row.id);
      req.display = { tokenId: row.id, name: row.name };
      req.user = null;
      return next();
    }

    try { req.user = jwt.verify(token, SECRET); }
    catch { return res.status(401).json({ error: 'Token ungültig oder abgelaufen' }); }
    if (!(await hatFeature(req.user, 'live_board'))) return res.status(403).json({ error: 'Kein Zugriff auf dieses Feature' });
    next();
  } catch (e) { next(e); }
}

const zuletzt = new Map();
async function merkeBenutzung(id) {
  const jetzt = Date.now();
  if (jetzt - (zuletzt.get(id) || 0) < 60_000) return;
  zuletzt.set(id, jetzt);
  try { await db.run(`UPDATE api_tokens SET zuletzt_benutzt=${pg() ? 'NOW()' : "datetime('now')"} WHERE id=${P(1)}`, [id]); }
  catch (e) { console.error('[board] zuletzt_benutzt:', e.message); }
}

// Nur Session (Einrichten, Display-Sitzungen, Ziele) — ein Display-Token kommt hier nie durch.
function nurSession(req, res, next) {
  if (!req.user) return res.status(403).json({ error: 'Nur mit Anmeldung' });
  next();
}

// ── Kalender-Helfer (Berlin, Mo–Fr; Feiertage zaehlen als Arbeitstag) ─────────────────────────
const addTage = (d, n) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const wochentag = (d) => new Date(d + 'T12:00:00Z').getUTCDay();          // 0 = So
const istArbeitstag = (d) => { const w = wochentag(d); return w >= 1 && w <= 5; };
function arbeitstage(monat, bis) {
  let n = 0, nBis = 0;
  for (let d = `${monat}-01`; d.slice(0, 7) === monat; d = addTage(d, 1)) {
    if (!istArbeitstag(d)) continue;
    n++; if (d <= bis) nBis++;
  }
  return { gesamt: n, bisHeute: nBis };
}
const wochenStart = (d) => addTage(d, -((wochentag(d) + 6) % 7));        // Montag
const vormonat = (monat) => { const [y, m] = monat.split('-').map(Number); return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`; };

// Mitternacht Berlin des Stichtags als UTC-Zeitpunkt — Grenze "Stand gestern" fuer das Journal.
function berlinMitternachtUtc(tag) {
  const probe = new Date(`${tag}T12:00:00Z`);
  const berlinMittag = new Date(probe.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
  const utcMittag = new Date(probe.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offsetMs = berlinMittag - utcMittag;                     // +1 h / +2 h
  return new Date(Date.parse(`${tag}T00:00:00Z`) - offsetMs);
}
const tsParam = (d) => (pg() ? d.toISOString() : d.toISOString().replace('T', ' ').slice(0, 19));

// ── Datensammlung ─────────────────────────────────────────────────────────────────────────────
const AE_EUR = aeEurGatedSql('d', 'c');
const ANGEBOT_EUR = moneyEurSql('angebotswert', 'monat', 'd', 'c');
const HAT_ANGEBOT = pg() ? `(d.angebot_erstellt IS NULL OR d.angebot_erstellt = TRUE)` : `(d.angebot_erstellt IS NULL OR d.angebot_erstellt <> 0)`;

// AE gewonnen (Closer Bonn) zwischen zwei Tagen, je Person in einer Rolle oder gesamt.
async function aeSumme(von, bis, feld = null) {
  const sel = feld ? `d.${feld} AS employee_id,` : '';
  const grp = feld ? `GROUP BY d.${feld}` : '';
  const rows = await db.all(
    `SELECT ${sel} COALESCE(SUM(${AE_EUR}),0) ae, COUNT(*) n
       FROM deals_nk d JOIN employees e ON e.id = d.closer_id LEFT JOIN companies c ON c.id = d.company_id
      WHERE d.status='Gewonnen' AND e.standort=${P(1)} AND d.gewonnen_datum >= ${P(2)} AND d.gewonnen_datum <= ${P(3)} ${feld ? `AND d.${feld} IS NOT NULL` : ''}
      ${grp}`, [STANDORT, von, bis]);
  return feld ? rows.map(r => ({ employee_id: Number(r.employee_id), ae: r2(r.ae), n: Number(r.n) })) : { ae: r2(rows[0]?.ae), n: Number(rows[0]?.n || 0) };
}

// Termine gelegt je Person und Art (Bonn) in einem Zeitraum, mit Ausgangs-Zaehlern.
async function termineJePerson(von, bis) {
  const rows = await db.all(
    `SELECT t.employee_id, t.art, t.status, COUNT(*) n
       FROM termine t JOIN employees e ON e.id = t.employee_id
      WHERE e.standort=${P(1)} AND t.gelegt_am >= ${P(2)} AND t.gelegt_am <= ${P(3)}
      GROUP BY t.employee_id, t.art, t.status`, [STANDORT, von, bis]);
  const out = {};   // id -> { setting: {...}, closing: {...} }
  for (const r of rows) {
    const p = (out[r.employee_id] = out[r.employee_id] || {});
    const z = (p[r.art] = p[r.art] || { gelegt: 0, stattgefunden: 0, nicht_stattgefunden: 0, verschoben: 0, offen: 0, unklar: 0 });
    const n = Number(r.n) || 0;
    z[r.status] = (z[r.status] || 0) + n; z.gelegt += n;
  }
  return out;
}

async function provisionsSichten(stichtag) {
  const z = await db.get(
    `SELECT id, von, bis, label, status FROM provision_zeitraeume WHERE kreis='bonn' AND von <= ${P(1)} ORDER BY von DESC LIMIT 1`, [stichtag]);
  const jahr = stichtag.slice(0, 4);
  const grenze = tsParam(berlinMitternachtUtc(stichtag));
  // EIN Abruf je Sicht: Summe gesamt, Summe "Stand gestern 24 Uhr", Team-Anteil (nur Transparenz).
  const lade = async (where, params) => db.all(
    `SELECT b.employee_id, b.rolle,
            COALESCE(SUM(b.betrag),0) summe,
            COALESCE(SUM(CASE WHEN b.created_at < ${P(params.length + 1)} THEN b.betrag ELSE 0 END),0) gestern
       FROM provision_buchungen b JOIN employees e ON e.id = b.employee_id
      WHERE e.standort=${P(params.length + 2)} AND ${where}
      GROUP BY b.employee_id, b.rolle`, [...params, grenze, STANDORT]);
  const zeitraumRows = z ? await lade(`b.zeitraum_id=${P(1)}`, [z.id]) : [];
  const jahrZeitraeume = await db.all(
    `SELECT id FROM provision_zeitraeume WHERE kreis='bonn' AND von >= ${P(1)} AND von <= ${P(2)}`, [`${jahr}-01-01`, stichtag]);
  const jIds = jahrZeitraeume.map(x => x.id);
  const jahrRows = jIds.length ? await lade(`b.zeitraum_id IN (${jIds.map((_, i) => P(i + 1)).join(',')})`, jIds) : [];

  // Rollen-Sichten. 'opener_setter' (Pauschale: dieselbe Person war Opener UND Setter) gehoert in
  // beide Listen. 'team' (Teamprovision der Vertriebsleitung) zaehlt in KEINE Sicht.
  const SICHT = {
    alle:   (r) => r !== 'team',
    opener: (r) => r === 'opener' || r === 'opener_setter',
    setter: (r) => r === 'setter' || r === 'opener_setter',
    closer: (r) => r === 'closer',
  };
  const rangliste = (rows, filter) => {
    const m = new Map();
    for (const r of rows) {
      if (!filter(r.rolle)) continue;
      const e = m.get(r.employee_id) || { employee_id: Number(r.employee_id), summe: 0, gestern: 0 };
      e.summe += Number(r.summe) || 0; e.gestern += Number(r.gestern) || 0;
      m.set(r.employee_id, e);
    }
    const liste = [...m.values()].filter(e => Math.abs(e.summe) > 0.004 || Math.abs(e.gestern) > 0.004)
      .map(e => ({ ...e, summe: r2(e.summe), gestern: r2(e.gestern), heute: r2(e.summe - e.gestern) }));
    const platzGestern = new Map([...liste].sort((a, b) => b.gestern - a.gestern).map((e, i) => [e.employee_id, i + 1]));
    return liste.sort((a, b) => b.summe - a.summe || a.employee_id - b.employee_id)
      .map((e, i) => ({ ...e, platz: i + 1, platz_gestern: e.gestern > 0.004 ? platzGestern.get(e.employee_id) : null }));
  };
  const teamAnteil = (rows) => {
    const t = {};
    for (const r of rows) if (r.rolle === 'team') t[r.employee_id] = r2((t[r.employee_id] || 0) + Number(r.summe));
    return t;
  };
  return {
    zeitraum: z ? { id: z.id, von: z.von, bis: z.bis, label: z.label, status: z.status } : null,
    jahr: { jahr, zeitraeume: jIds.length, ab: jahrZeitraeume.length ? (await db.get(`SELECT MIN(von) v FROM provision_zeitraeume WHERE id IN (${jIds.map((_, i) => P(i + 1)).join(',')})`, jIds))?.v : null },
    sichten: {
      alle:   rangliste(zeitraumRows, SICHT.alle),
      opener: rangliste(zeitraumRows, SICHT.opener),
      setter: rangliste(zeitraumRows, SICHT.setter),
      closer: rangliste(zeitraumRows, SICHT.closer),
      jahr:   rangliste(jahrRows, SICHT.alle),
    },
    team_ausgeschlossen: { zeitraum: teamAnteil(zeitraumRows), jahr: teamAnteil(jahrRows) },
  };
}

async function monatsziel(monat) {
  let row = null;
  try { row = await db.get(`SELECT ziel_ae FROM monthly_targets_standort WHERE monat=${P(1)} AND standort=${P(2)}`, [monat, STANDORT]); }
  catch { /* Tabelle fehlt (sehr alte DB) -> Konstante */ }
  if (row && Number(row.ziel_ae) > 0) return { ziel: Number(row.ziel_ae), quelle: 'standortziel' };
  return { ziel: Number(K.auftragseingang.ziel_monat_eur), quelle: 'kpi_vorgabe' };
}

async function verlauf(monat) {
  const rows = await db.all(
    `SELECT d.gewonnen_datum tag, COALESCE(SUM(${AE_EUR}),0) ae
       FROM deals_nk d JOIN employees e ON e.id = d.closer_id LEFT JOIN companies c ON c.id = d.company_id
      WHERE d.status='Gewonnen' AND e.standort=${P(1)} AND d.gewonnen_monat=${P(2)}
      GROUP BY d.gewonnen_datum`, [STANDORT, monat]);
  const jeTag = {};
  for (const r of rows) { const t = ymd(r.tag); if (t) jeTag[t] = (jeTag[t] || 0) + Number(r.ae); }
  return jeTag;   // tag -> AE (nicht kumuliert; das Frontend kumuliert)
}

async function boardDaten(stichtag) {
  const monat = stichtag.slice(0, 7);
  const monatsStart = `${monat}-01`;
  const woche = wochenStart(stichtag);
  const at = arbeitstage(monat, stichtag);
  const ziel = await monatsziel(monat);
  const vm = vormonat(monat);

  // Team. Monatswert EXAKT wie Dashboard-Zelle nk_bonn und incentive.teamGate: nach gewonnen_monat
  // (nicht nach Datumsbereich), damit Board und Dashboard nie auseinanderlaufen.
  const aeMonatRow = await db.get(
    `SELECT COALESCE(SUM(${AE_EUR}),0) ae, COUNT(*) n
       FROM deals_nk d JOIN employees e ON e.id = d.closer_id LEFT JOIN companies c ON c.id = d.company_id
      WHERE d.status='Gewonnen' AND d.gewonnen_monat=${P(1)} AND e.standort=${P(2)}`, [monat, STANDORT]);
  const aeMonat = { ae: r2(aeMonatRow?.ae), n: Number(aeMonatRow?.n || 0) };
  const aeHeute = await aeSumme(stichtag, stichtag);
  const sollHeute = at.gesamt ? r2(ziel.ziel * at.bisHeute / at.gesamt) : 0;

  // Termine
  const tHeute = await termineJePerson(stichtag, stichtag);
  const tWoche = await termineJePerson(woche, stichtag);
  const tMonat = await termineJePerson(monatsStart, stichtag);
  const summeArt = (t, art) => Object.values(t).reduce((s, p) => s + (p[art]?.gelegt || 0), 0);

  // AE je Rolle und Zeitraum
  const aeJe = {};
  for (const [k, von] of [['heute', stichtag], ['woche', woche], ['monat', monatsStart]]) {
    aeJe[k] = {
      closer: await aeSumme(von, stichtag, 'closer_id'),
      setter: await aeSumme(von, stichtag, 'setter_id'),
      opener: await aeSumme(von, stichtag, 'opener_id'),
    };
  }

  // Rollen-Duelle: Opener = Settings gelegt, Setter = Sales Calls gelegt, Closer = AE.
  const showrate = (z) => { if (!z) return null; const b = bewerte(z); return { rate: b.rate, basis: b.basis, belastbar: b.belastbar }; };
  const rollen = {};
  for (const [k, t] of [['heute', tHeute], ['woche', tWoche], ['monat', tMonat]]) {
    const kette = (rolle) => Object.fromEntries(aeJe[k][rolle].map(x => [x.employee_id, x.ae]));
    const kO = kette('opener'), kS = kette('setter');
    rollen[k] = {
      opener: Object.entries(t).filter(([, p]) => p.setting?.gelegt).map(([id, p]) => ({
        employee_id: Number(id), gelegt: p.setting.gelegt, showrate: showrate(tMonat[id]?.setting), ae_kette: kO[id] || 0 }))
        .sort((a, b) => b.gelegt - a.gelegt || b.ae_kette - a.ae_kette),
      setter: Object.entries(t).filter(([, p]) => p.closing?.gelegt).map(([id, p]) => ({
        employee_id: Number(id), gelegt: p.closing.gelegt, showrate: showrate(tMonat[id]?.closing), ae_kette: kS[id] || 0 }))
        .sort((a, b) => b.gelegt - a.gelegt || b.ae_kette - a.ae_kette),
      closer: aeJe[k].closer.map(x => ({ employee_id: x.employee_id, ae: x.ae, gewonnen: x.n }))
        .sort((a, b) => b.ae - a.ae),
    };
  }

  // Calls des Monats (Closer Bonn) — fuer rollenStats() im Frontend (Closing-Rate) und "Hot".
  const calls = await db.all(
    `SELECT d.id, d.datum, d.monat, d.status, d.angebot_erstellt, d.closer_id, d.setter_id, d.opener_id,
            d.gewonnen_datum, ${AE_EUR} AS ae_wert_eur
       FROM deals_nk d JOIN employees e ON e.id = d.closer_id LEFT JOIN companies c ON c.id = d.company_id
      WHERE e.standort=${P(1)} AND d.monat=${P(2)}`, [STANDORT, monat]);

  // Letzter Gewinn je Closer + "Hot" (die letzten drei entschiedenen Calls alle gewonnen).
  const entschieden = await db.all(
    `SELECT d.closer_id, d.status, d.gewonnen_datum, d.datum, d.id
       FROM deals_nk d JOIN employees e ON e.id = d.closer_id
      WHERE e.standort=${P(1)} AND d.status IN ('Gewonnen','Verloren') AND d.datum >= ${P(2)} AND d.datum <= ${P(3)}
      ORDER BY d.closer_id, d.datum DESC, d.id DESC`, [STANDORT, addTage(stichtag, -120), stichtag]);
  const closerInfo = {};
  for (const r of entschieden) {
    const c = (closerInfo[r.closer_id] = closerInfo[r.closer_id] || { letzte: [], letzter_gewinn: null });
    if (c.letzte.length < 3) c.letzte.push(r.status);
    const g = ymd(r.gewonnen_datum);
    if (r.status === 'Gewonnen' && g && g <= stichtag && (!c.letzter_gewinn || g > c.letzter_gewinn)) c.letzter_gewinn = g;
  }
  const hot = Object.entries(closerInfo).filter(([, c]) => c.letzte.length === 3 && c.letzte.every(s => s === 'Gewonnen')).map(([id]) => Number(id));
  const letzterGewinn = Object.fromEntries(Object.entries(closerInfo).map(([id, c]) => [id, c.letzter_gewinn]));

  // Heute gewonnen (neueste zuerst)
  const gewonnenHeute = (await db.all(
    `SELECT d.id, d.kunde, d.closer_id, d.setter_id, d.opener_id, ${AE_EUR} AS ae_eur, d.updated_at
       FROM deals_nk d JOIN employees e ON e.id = d.closer_id LEFT JOIN companies c ON c.id = d.company_id
      WHERE d.status='Gewonnen' AND e.standort=${P(1)} AND d.gewonnen_datum=${P(2)}
      ORDER BY d.updated_at DESC, d.id DESC`, [STANDORT, stichtag]))
    .map(r => ({ id: r.id, kunde: r.kunde, closer_id: r.closer_id, setter_id: r.setter_id, opener_id: r.opener_id, ae_eur: r2(r.ae_eur) }));

  // Top 10 offene Angebote: Calls der letzten 30 Tage, mit Angebot, ohne Gewonnen/Verloren.
  const offenWhere = `e.standort=${P(1)} AND d.status NOT IN ('Gewonnen','Verloren') AND ${HAT_ANGEBOT}
      AND COALESCE(d.angebotswert,0) > 0 AND d.datum >= ${P(2)} AND d.datum <= ${P(3)}`;
  const offenParams = [STANDORT, addTage(stichtag, -30), stichtag];
  const offenAlle = await db.get(
    `SELECT COUNT(*) n, COALESCE(SUM(${ANGEBOT_EUR}),0) wert
       FROM deals_nk d JOIN employees e ON e.id = d.closer_id LEFT JOIN companies c ON c.id = d.company_id
      WHERE ${offenWhere}`, offenParams);
  const offen = (await db.all(
    `SELECT d.id, d.kunde, d.datum, d.status, d.closer_id, d.setter_id, ${ANGEBOT_EUR} AS angebotswert_eur
       FROM deals_nk d JOIN employees e ON e.id = d.closer_id LEFT JOIN companies c ON c.id = d.company_id
      WHERE ${offenWhere}
      ORDER BY angebotswert_eur DESC, d.datum ASC, d.id ASC LIMIT 10`, offenParams))
    .map(r => {
      const datum = ymd(r.datum);
      return { id: r.id, kunde: r.kunde, datum, status: r.status, closer_id: r.closer_id, setter_id: r.setter_id,
        angebotswert_eur: r2(r.angebotswert_eur),
        alter_tage: Math.round((Date.parse(stichtag) - Date.parse(datum)) / 86400000) };
    });

  // Ausgaenge nachtragen: Termine dieses Monats, vor mindestens 3 Tagen gelegt, Ausgang noch offen.
  const offeneAusgaenge = Number((await db.get(
    `SELECT COUNT(*) n FROM termine t JOIN employees e ON e.id = t.employee_id
      WHERE e.standort=${P(1)} AND t.status='offen' AND t.gelegt_am >= ${P(2)} AND t.gelegt_am <= ${P(3)}`,
    [STANDORT, monatsStart, addTage(stichtag, -3)]))?.n || 0);

  // Tagesziele je Person
  const zielRows = await db.all(
    `SELECT z.employee_id, z.kennzahl, z.ziel_tag, z.ziel_monat FROM board_ziele z JOIN employees e ON e.id = z.employee_id
      WHERE e.standort=${P(1)} AND e.aktiv=${pg() ? 'TRUE' : '1'}`, [STANDORT]);
  const aeHeuteCloser = Object.fromEntries(aeJe.heute.closer.map(x => [x.employee_id, x.ae]));
  const aeMonatCloser = Object.fromEntries(aeJe.monat.closer.map(x => [x.employee_id, x.ae]));
  const ist = {
    settings:    { tag: (id) => tHeute[id]?.setting?.gelegt || 0, monat: (id) => tMonat[id]?.setting?.gelegt || 0 },
    sales_calls: { tag: (id) => tHeute[id]?.closing?.gelegt || 0, monat: (id) => tMonat[id]?.closing?.gelegt || 0 },
    ae:          { tag: (id) => aeHeuteCloser[id] || 0,             monat: (id) => aeMonatCloser[id] || 0 },
  };
  const zielePerson = {};
  for (const z of zielRows) {
    const p = (zielePerson[z.employee_id] = zielePerson[z.employee_id] || { employee_id: Number(z.employee_id), kennzahlen: {} });
    const zt = z.ziel_tag == null ? null : Number(z.ziel_tag);
    const zm = z.ziel_monat == null ? null : Number(z.ziel_monat);
    const sollStand = zm != null && at.gesamt ? zm * at.bisHeute / at.gesamt : null;
    p.kennzahlen[z.kennzahl] = {
      ist_tag: r2(ist[z.kennzahl].tag(z.employee_id)), ziel_tag: zt,
      ist_monat: r2(ist[z.kennzahl].monat(z.employee_id)), ziel_monat: zm, soll_stand: sollStand == null ? null : r2(sollStand),
    };
  }
  const quoteVon = (ist, ziel) => (ziel && ziel > 0 ? ist / ziel * 100 : null);
  const tagesziele = Object.values(zielePerson).map(p => {
    const tag = Object.values(p.kennzahlen).map(k => quoteVon(k.ist_tag, k.ziel_tag)).filter(v => v != null);
    const mon = Object.values(p.kennzahlen).map(k => quoteVon(k.ist_monat, k.soll_stand)).filter(v => v != null);
    const mittel = (a) => (a.length ? Math.round(a.reduce((s, v) => s + v, 0) / a.length) : null);
    return { ...p, erreichung_tag: mittel(tag), pacing_monat: mittel(mon) };
  }).sort((a, b) => (b.erreichung_tag ?? -1) - (a.erreichung_tag ?? -1));

  const provision = await provisionsSichten(stichtag);
  const verlaufAkt = await verlauf(monat);
  const verlaufVor = await verlauf(vm);

  // Personen (Namen + Foto-Version) fuer alle IDs, die irgendwo vorkommen.
  const ids = new Set();
  const add = (v) => { if (v != null) ids.add(Number(v)); };
  Object.values(provision.sichten).forEach(l => l.forEach(x => add(x.employee_id)));
  Object.values(rollen).forEach(r => Object.values(r).forEach(l => l.forEach(x => add(x.employee_id))));
  tagesziele.forEach(x => add(x.employee_id));
  gewonnenHeute.forEach(x => { add(x.closer_id); add(x.setter_id); add(x.opener_id); });
  offen.forEach(x => { add(x.closer_id); add(x.setter_id); });
  calls.forEach(x => { add(x.closer_id); add(x.setter_id); add(x.opener_id); });
  const idList = [...ids];
  const personen = idList.length ? await db.all(
    `SELECT e.id, e.name, e.standort, f.updated_at foto_stand FROM employees e LEFT JOIN employee_fotos f ON f.employee_id = e.id
      WHERE e.id IN (${idList.map((_, i) => P(i + 1)).join(',')})`, idList) : [];

  return {
    stand: { stichtag, monat, woche_ab: woche, arbeitstag: at.bisHeute, arbeitstage_monat: at.gesamt, generiert: new Date().toISOString() },
    personen: personen.map(p => ({ id: p.id, name: p.name, vorname: String(p.name || '').split(' ')[0],
      foto: p.foto_stand ? String(p.foto_stand instanceof Date ? p.foto_stand.getTime() : Date.parse(String(p.foto_stand).replace(' ', 'T') + (String(p.foto_stand).includes('T') ? '' : 'Z'))) : null })),
    team: {
      ae_monat: aeMonat.ae, deals_monat: aeMonat.n, ae_heute: aeHeute.ae, deals_heute: aeHeute.n,
      ziel_monat: ziel.ziel, ziel_quelle: ziel.quelle, soll_heute: sollHeute, teamgate: TEAMZIEL,
      ae_soll_tag: at.gesamt ? r2(ziel.ziel / at.gesamt) : null,
      settings_heute: summeArt(tHeute, 'setting'), sales_calls_heute: summeArt(tHeute, 'closing'),
      tagesziel_settings: K.tagesziele.settings, tagesziel_sales_calls: K.tagesziele.sales_calls,
      verlauf: verlaufAkt, verlauf_vormonat: verlaufVor, vormonat: vm,
    },
    provision,
    tagesziele,
    rollen, min_basis: MIN_BASIS, offene_ausgaenge: offeneAusgaenge,
    calls_monat: calls.map(c => ({ ...c, datum: ymd(c.datum), gewonnen_datum: ymd(c.gewonnen_datum), ae_wert_eur: r2(c.ae_wert_eur) })),
    closer_hot: hot, letzter_gewinn: letzterGewinn,
    gewonnen_heute: gewonnenHeute,
    top_offen: { gesamt_n: Number(offenAlle?.n || 0), gesamt_wert: r2(offenAlle?.wert), zeilen: offen },
  };
}

// Kurzer Server-Cache: mehrere Bildschirme + Browser teilen sich EINE Berechnung je 20 s.
const CACHE_MS = 20_000;
const cache = new Map();   // stichtag -> { t, daten }

router.get('/', boardZugang, wrap(async (req, res) => {
  // Stichtag nur fuer den Superadmin (Pruefung/Harness) — ein Display zeigt immer heute.
  const st = String(req.query.stichtag || '');
  const stichtag = req.user?.role === 'superadmin' && /^\d{4}-\d{2}-\d{2}$/.test(st) ? st : heuteBerlin();
  const c = cache.get(stichtag);
  let daten;
  if (c && Date.now() - c.t < CACHE_MS && !req.query.frisch) daten = c.daten;
  else { daten = await boardDaten(stichtag); cache.set(stichtag, { t: Date.now(), daten }); }
  const delta = require('../utils/closeSyncJob').deltaStand();
  res.set('Cache-Control', 'no-store');
  res.json({ ...daten, close: delta ? { am: delta.am, ok: delta.ok } : null, display: !!req.display });
}));

// Foto (Board-Zugang): Bild als Binaerantwort, per Version im URL-Query lange cachebar.
router.get('/foto/:id', boardZugang, wrap(async (req, res) => {
  const f = await db.get(`SELECT mime, daten FROM employee_fotos WHERE employee_id=${P(1)}`, [Number(req.params.id)]);
  if (!f) return res.status(404).json({ error: 'Kein Foto' });
  res.set('Content-Type', f.mime);
  res.set('Cache-Control', 'private, max-age=86400');
  res.send(Buffer.from(f.daten, 'base64'));
}));

// ── Display-Sitzungen (Knopf "Jetzt Dashboard öffnen") ──────────────────────────────────────
// Unbegrenzt gueltig bis zum Widerruf (Vorgabe 04.11.2026). Jeder sieht und widerruft seine
// eigenen; der Superadmin alle (zusaetzlich unter Einstellungen → API-Tokens).
const ohneHash = (r) => { const x = { ...r }; delete x.token_hash; return x; };

router.get('/sessions', boardZugang, nurSession, wrap(async (req, res) => {
  const alle = req.user.role === 'superadmin';
  const rows = await db.all(
    `SELECT t.id, t.name, t.praefix, t.aktiv, t.erstellt_am, t.widerrufen_am, t.zuletzt_benutzt, t.erstellt_von, u.name erstellt_von_name
       FROM api_tokens t LEFT JOIN users u ON u.id = t.erstellt_von
      WHERE t.scopes=${P(1)} ${alle ? '' : `AND t.erstellt_von=${P(2)}`}
      ORDER BY t.id DESC`, alle ? [SCOPE] : [SCOPE, req.user.id]);
  res.json(rows);
}));

router.post('/sessions', boardZugang, nurSession, wrap(async (req, res) => {
  const bezeichnung = String(req.body?.name || '').trim().slice(0, 60) || 'Bildschirm';
  const name = `Live-Board: ${bezeichnung}`;
  const { token, praefix, hash } = neuesToken();
  const werte = [name, praefix, hash, SCOPE, STANDORT, req.user.id];
  let row;
  if (pg()) {
    row = await db.get(`INSERT INTO api_tokens (name, praefix, token_hash, scopes, standorte, erstellt_von) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, werte);
  } else {
    const r = db.run(`INSERT INTO api_tokens (name, praefix, token_hash, scopes, standorte, erstellt_von) VALUES (?,?,?,?,?,?)`, werte);
    row = await db.get(`SELECT * FROM api_tokens WHERE id=?`, [r.lastInsertRowid]);
  }
  await logAudit({ user: req.user, action: 'create', entityType: 'api_token', entityId: row.id, newData: ohneHash(row) });
  res.status(201).json({ ...ohneHash(row), token });   // Token nur in DIESER Antwort
}));

router.post('/sessions/:id/widerrufen', boardZugang, nurSession, wrap(async (req, res) => {
  const alt = await db.get(`SELECT * FROM api_tokens WHERE id=${P(1)} AND scopes=${P(2)}`, [Number(req.params.id), SCOPE]);
  if (!alt || (req.user.role !== 'superadmin' && Number(alt.erstellt_von) !== Number(req.user.id))) {
    return res.status(404).json({ error: 'Display-Sitzung nicht gefunden' });
  }
  await db.run(`UPDATE api_tokens SET aktiv=${pg() ? 'FALSE' : '0'}, widerrufen_am=COALESCE(widerrufen_am, ${pg() ? 'NOW()' : "datetime('now')"}) WHERE id=${P(1)}`, [alt.id]);
  const neu = await db.get(`SELECT * FROM api_tokens WHERE id=${P(1)}`, [alt.id]);
  await logAudit({ user: req.user, action: 'update', entityType: 'api_token', entityId: alt.id, oldData: ohneHash(alt), newData: ohneHash(neu) });
  res.json(ohneHash(neu));
}));

// ── Tagesziele je Person ───────────────────────────────────────────────────────────────────────
// Pflegen: Superadmin oder Einzel-/Rollenfreigabe 'live_board_ziele' (Vertriebsleitung).
const KENNZAHLEN = ['settings', 'sales_calls', 'ae'];
async function zielRecht(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Nicht angemeldet' });
    if (await hatFeature(req.user, 'live_board_ziele')) return next();
    return res.status(403).json({ error: 'Kein Zugriff auf die Tagesziele' });
  } catch (e) { next(e); }
}
// Eigene Session-Pruefung (die Ziele brauchen 'live_board' NICHT — wer Ziele pflegt, muss das Board nicht sehen).
function session(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token || token.startsWith('kpt_')) return res.status(401).json({ error: 'Nicht angemeldet' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Token ungültig oder abgelaufen' }); }
}

router.get('/ziele', session, zielRecht, wrap(async (_req, res) => {
  const personen = await db.all(
    `SELECT e.id, e.name, e.rolle FROM employees e
      WHERE e.standort=${P(1)} AND e.aktiv=${pg() ? 'TRUE' : '1'} AND e.rolle <> 'KAM' ORDER BY e.name`, [STANDORT]);
  const ziele = await db.all(`SELECT employee_id, kennzahl, ziel_tag, ziel_monat, updated_at FROM board_ziele`);
  res.json({ personen, ziele, kennzahlen: KENNZAHLEN });
}));

// PUT /ziele/:employeeId  { settings: {ziel_tag, ziel_monat}, sales_calls: {...}, ae: {...} }
// Leere Felder ("" / null) = kein Ziel. Beide leer -> Zeile entfernt.
router.put('/ziele/:employeeId', session, zielRecht, wrap(async (req, res) => {
  const id = Number(req.params.employeeId);
  const emp = await db.get(`SELECT id, name, standort FROM employees WHERE id=${P(1)}`, [id]);
  if (!emp || emp.standort !== STANDORT) return res.status(404).json({ error: 'Mitarbeiter nicht gefunden (nur Bonn)' });
  const zahl = (v) => {
    if (v === '' || v == null) return null;
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : NaN;
  };
  const alt = await db.all(`SELECT * FROM board_ziele WHERE employee_id=${P(1)}`, [id]);
  for (const k of KENNZAHLEN) {
    if (!req.body || !(k in req.body)) continue;
    const zt = zahl(req.body[k]?.ziel_tag), zm = zahl(req.body[k]?.ziel_monat);
    if (Number.isNaN(zt) || Number.isNaN(zm)) return res.status(400).json({ error: `Ungültige Zahl bei ${k}` });
    if (zt == null && zm == null) {
      await db.run(`DELETE FROM board_ziele WHERE employee_id=${P(1)} AND kennzahl=${P(2)}`, [id, k]);
    } else if (pg()) {
      await db.run(`INSERT INTO board_ziele (employee_id, kennzahl, ziel_tag, ziel_monat, updated_at, updated_by) VALUES ($1,$2,$3,$4,NOW(),$5)
        ON CONFLICT (employee_id, kennzahl) DO UPDATE SET ziel_tag=EXCLUDED.ziel_tag, ziel_monat=EXCLUDED.ziel_monat, updated_at=NOW(), updated_by=EXCLUDED.updated_by`,
        [id, k, zt, zm, req.user.id ?? null]);
    } else {
      await db.run(`INSERT INTO board_ziele (employee_id, kennzahl, ziel_tag, ziel_monat, updated_at, updated_by) VALUES (?,?,?,?,datetime('now'),?)
        ON CONFLICT (employee_id, kennzahl) DO UPDATE SET ziel_tag=excluded.ziel_tag, ziel_monat=excluded.ziel_monat, updated_at=datetime('now'), updated_by=excluded.updated_by`,
        [id, k, zt, zm, req.user.id ?? null]);
    }
  }
  const neu = await db.all(`SELECT * FROM board_ziele WHERE employee_id=${P(1)}`, [id]);
  await logAudit({ user: req.user, action: 'update', entityType: 'board_ziele', entityId: id, oldData: alt, newData: neu });
  cache.clear();
  res.json(neu);
}));

module.exports = router;
module.exports._intern = { arbeitstage, berlinMitternachtUtc, wochenStart };
