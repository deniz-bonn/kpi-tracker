// ── Externe API v1 (/api/ext/v1) — Verlaengerungen lesen und dublettensicher anlegen ──────────
//
// Zweite Tuer mit Token statt Session: geschrieben wird AUSSCHLIESSLICH ueber die geteilten
// Funktionen erstelleVlDeal / aendereVlDeal aus routes/deals_vl.js — dieselbe Validierung,
// dieselben Hooks (AE-Snapshot, BK-Provision 2 %, Audit) wie die UI. Hier liegt nur, was eine
// Maschinenschnittstelle zusaetzlich braucht: Token + Scope + Standort-Scope, Dublettenpruefung,
// Idempotenz, dry_run und maschinenlesbare Fehler.
//
// Standort-Scope: Der Standort einer Verlaengerung ist der ihres KAM (utils/standorte.js). Deals
// ausserhalb des Scopes sind unsichtbar (404, nie 403), auch fuer /match.
// Fehlerformat: { error: { code, message, felder?: [{ feld, grund }] } }
//   code: validation | duplicate | not_found | scope | rate_limit | unauthorized | idempotency_conflict
//
// Doku fuer Aufrufer: docs/api-ext.md
const crypto = require('crypto');
const router = require('express').Router();
const db     = require('../db');
const { requireApiToken, requireScope, imStandortScope } = require('../middleware/apiToken');
const { erstelleVlDeal, aendereVlDeal, pruefePflichtfelderVl, BASE_SELECT, VL_EUR_MAP } = require('./deals_vl');
const { enrichDealsEur } = require('../utils/currency');
const { resolveGewonnenFelder } = require('../utils/gewonnen');
const { kamRollenSql } = require('../utils/rollen');
const { findeTreffer, normName } = require('../utils/vlMatch');
const { logAudit } = require('../utils/audit');

const pg = () => db.dialect === 'postgres';
const P  = (i) => (pg() ? `$${i}` : '?');

// Felder, die Skripte setzen duerfen — der Formular-Feldsatz ohne Umstellung (Mensch-Schritt).
const SCHREIBFELDER = ['datum', 'monat', 'company_id', 'kam_id', 'kunde', 'kundennummer', 'vertragsnummer',
  'vertragsbeginn', 'ende_laufzeit', 'ende_kuendigungsfrist', 'dienstleistung', 'angebotswert', 'ae_wert',
  'laufzeit_monate', 'wie_vielt_verlaengerung', 'status', 'gewonnen_datum', 'weitergeben_an_vertrieb',
  'gekuendigt_am', 'auslaufend_am', 'ansprechpartner', 'telefon', 'email_kontakt', 'abgerechnet', 'kommentar'];
const API_STATUS = ['Offen', 'Gewonnen', 'Verloren'];   // 'Umgestellt' bleibt ein Schritt im Formular

class ApiFehler extends Error {
  constructor(status, code, message, extra = {}) { super(message); this.status = status; this.code = code; this.extra = extra; }
}
const validierung = (felder, message = 'Eingabe ungültig') => new ApiFehler(400, 'validation', message, { felder });
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const jaWert = (v) => v === true || v === 'true' || v === '1' || v === 1;

router.use(requireApiToken);

// ── Lese-Helfer ──────────────────────────────────────────────────────────────
async function alleVl(where = '', params = []) {
  return db.all(BASE_SELECT + where + ' ORDER BY d.datum DESC, d.id DESC', params);
}
const imScope = (req, deal) => imStandortScope(req.apiToken, deal.kam_standort) && (!req.apiToken.standorte || !!deal.kam_id);
async function ladeImScope(req, id) {
  if (!/^\d+$/.test(String(id))) throw new ApiFehler(404, 'not_found', 'Verlängerung nicht gefunden.');
  const row = await db.get(BASE_SELECT + ` WHERE d.id=${P(1)}`, [Number(id)]);
  if (!row || !imScope(req, row)) throw new ApiFehler(404, 'not_found', 'Verlängerung nicht gefunden.');
  return row;
}
const ausgabe = async (rows) => (await enrichDealsEur(rows, VL_EUR_MAP)).map(r => ({ ...r, erstellt_am: r.created_at }));

// KAM pruefen: existiert, hat eine KAM-Rolle, Standort im Scope. Unbekannt und ausserhalb sind
// fuer den Aufrufer dasselbe — sonst verriete die Antwort fremde Mitarbeiter.
async function pruefeKam(req, kamId) {
  const e = /^\d+$/.test(String(kamId))
    ? await db.get(`SELECT id, standort FROM employees WHERE id=${P(1)} AND rolle IN (${kamRollenSql()})`, [Number(kamId)])
    : null;
  if (!e || !imStandortScope(req.apiToken, e.standort)) throw validierung([{ feld: 'kam_id', grund: 'unbekannt' }]);
}
async function pruefeCompany(companyId) {
  const c = /^\d+$/.test(String(companyId)) ? await db.get(`SELECT id FROM companies WHERE id=${P(1)}`, [Number(companyId)]) : null;
  if (!c) throw validierung([{ feld: 'company_id', grund: 'unbekannt' }]);
}

// Body auf erlaubte Felder pruefen; dry_run/force/toleranz_tage duerfen auch im Body stehen.
function schreibBody(req) {
  const roh = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : null;
  if (!roh) throw validierung([{ feld: null, grund: 'body_kein_objekt' }], 'Body muss ein JSON-Objekt sein.');
  const steuer = ['dry_run', 'force', 'toleranz_tage'];
  const unbekannt = Object.keys(roh).filter(k => !SCHREIBFELDER.includes(k) && !steuer.includes(k));
  if (unbekannt.length) throw validierung(unbekannt.map(feld => ({ feld, grund: 'unbekanntes_feld' })));
  const body = Object.fromEntries(Object.entries(roh).filter(([k]) => SCHREIBFELDER.includes(k)));
  return {
    body,
    dryRun: jaWert(req.query.dry_run) || jaWert(roh.dry_run),
    force:  jaWert(req.query.force)   || jaWert(roh.force),
    toleranz: Number(req.query.toleranz_tage ?? roh.toleranz_tage) || 14,
  };
}

// VL-Monat: fehlt er, gilt die Regel vom 10.08. (Monat der spaetesten Kuendigung). Weicht ein
// mitgeschickter Monat davon ab, gibt es einen Hinweis, keinen Fehler — die Frist im Tracker war
// historisch nicht immer richtig.
function monatAbleiten(body, hinweise) {
  const frist = String(body.ende_kuendigungsfrist || '').slice(0, 10);
  if (!body.monat && /^\d{4}-\d{2}-\d{2}$/.test(frist)) {
    body.monat = frist.slice(0, 7);
    hinweise.push(`monat aus ende_kuendigungsfrist abgeleitet: ${body.monat}`);
  } else if (body.monat && /^\d{4}-\d{2}-\d{2}$/.test(frist) && frist.slice(0, 7) !== String(body.monat).slice(0, 7)) {
    hinweise.push(`monat ${body.monat} weicht vom Monat der Kündigungsfrist (${frist.slice(0, 7)}) ab`);
  }
  if (body.monat && !/^\d{4}-\d{2}$/.test(String(body.monat))) throw validierung([{ feld: 'monat', grund: 'format_yyyy_mm' }]);
}

async function treffer(req, eingabe, toleranz) {
  const kandidaten = (await alleVl()).filter(d => imScope(req, d));
  return findeTreffer(eingabe, kandidaten, toleranz);
}
const kandidatenAusgabe = async (liste) => {
  const deals = await ausgabe(liste.map(t => t.deal));
  return deals.map((deal, i) => ({ gruende: liste[i].gruende, deal }));
};

// ── GET /vl — suchen ─────────────────────────────────────────────────────────
router.get('/vl', requireScope('vl:read'), wrap(async (req, res) => {
  const q = req.query, cond = [], params = [];
  const add = (sql, v) => { params.push(v); cond.push(sql.replace('?', P(params.length))); };
  if (q.kundennummer)   add('TRIM(d.kundennummer) = ?', String(q.kundennummer).trim());
  if (q.vertragsnummer) add('TRIM(d.vertragsnummer) = ?', String(q.vertragsnummer).trim());
  if (q.monat)          add('d.monat = ?', String(q.monat));
  if (q.status)         add('d.status = ?', String(q.status));
  if (q.kam_id)         add('d.kam_id = ?', Number(q.kam_id));
  if (q.von)            add('d.datum >= ?', String(q.von));
  if (q.bis)            add('d.datum <= ?', String(q.bis));
  let rows = (await alleVl(cond.length ? ' WHERE ' + cond.join(' AND ') : '', params)).filter(d => imScope(req, d));
  if (q.kunde) { const n = normName(q.kunde); rows = rows.filter(d => n && normName(d.kunde) === n); }
  const limit = Math.min(Math.max(Number(q.limit) || 50, 1), 200), offset = Math.max(Number(q.offset) || 0, 0);
  res.json({ gesamt: rows.length, limit, offset, daten: await ausgabe(rows.slice(offset, offset + limit)) });
}));

// ── GET /vl/match — die Dublettenfrage, bevor geschrieben wird ───────────────
router.get('/vl/match', requireScope('vl:read'), wrap(async (req, res) => {
  const q = { ...req.query }, hinweise = [];
  if (!q.kundennummer && !q.kunde) throw validierung([{ feld: 'kundennummer', grund: 'kundennummer_oder_kunde_noetig' }]);
  monatAbleiten(q, hinweise);
  if (!q.monat) throw validierung([{ feld: 'monat', grund: 'fehlt' }]);
  const t = await treffer(req, q, Number(q.toleranz_tage) || 14);
  res.json({ ergebnis: t.ergebnis, exact: await kandidatenAusgabe(t.exact), nahe: await kandidatenAusgabe(t.nahe), hinweise });
}));

router.get('/vl/:id', requireScope('vl:read'), wrap(async (req, res) => {
  res.json((await ausgabe([await ladeImScope(req, req.params.id)]))[0]);
}));

// ── POST /vl — anlegen (dublettensicher, idempotent, dry_run) ────────────────
const stabil = (o) => JSON.stringify(Object.keys(o).sort().reduce((a, k) => (a[k] = o[k], a), {}));
router.post('/vl', requireScope('vl:write'), wrap(async (req, res) => {
  const idemKey = (req.headers['idempotency-key'] || '').trim() || null;
  const anfrageHash = crypto.createHash('sha256').update(stabil(req.body || {}) + '|' + stabil(req.query || {})).digest('hex');
  if (idemKey) {
    const alt = await db.get(`SELECT * FROM api_idempotency WHERE token_id=${P(1)} AND schluessel=${P(2)}`, [req.apiToken.id, idemKey]);
    if (alt) {
      if (alt.anfrage_hash !== anfrageHash) throw new ApiFehler(422, 'idempotency_conflict', 'Idempotency-Key wurde schon mit anderem Inhalt benutzt.');
      return res.status(alt.status).set('Idempotent-Replay', 'true').json(JSON.parse(alt.antwort));
    }
  }

  const { body, dryRun, force, toleranz } = schreibBody(req);
  const hinweise = [];
  monatAbleiten(body, hinweise);
  body.status = body.status || 'Offen';
  const felder = [];
  if (!API_STATUS.includes(body.status)) felder.push({ feld: 'status', grund: 'nicht_erlaubt', erlaubt: API_STATUS });
  if (!body.kam_id) felder.push({ feld: 'kam_id', grund: 'fehlt' });
  if (!body.kundennummer) hinweise.push('ohne kundennummer (HubSpot ID) ist der Abgleich nur über den Namen möglich');
  if (felder.length) throw validierung(felder);
  await pruefeKam(req, body.kam_id);
  if (body.company_id) await pruefeCompany(body.company_id);
  // Zukunftssperre/Gewonnen-Datum schon vor der Dublettenpruefung, damit dry_run sie meldet.
  try { resolveGewonnenFelder(body); }
  catch (e) { throw validierung([{ feld: 'gewonnen_datum', grund: /Zukunft/.test(e.message) ? 'zukunft' : 'fehlt' }], e.message); }

  const t = await treffer(req, body, toleranz);
  if (t.ergebnis === 'exact') {
    throw new ApiFehler(409, 'duplicate', 'Diese Verlängerung existiert bereits.', { ergebnis: 'exact', deals: await kandidatenAusgabe(t.exact) });
  }
  if (t.ergebnis === 'nahe' && !force) {
    throw new ApiFehler(409, 'duplicate', 'Ähnliche Verlängerung vorhanden — mit force=true trotzdem anlegen.', { ergebnis: 'nahe', deals: await kandidatenAusgabe(t.nahe) });
  }

  if (dryRun) {
    // Pflichtfelder wie beim echten Anlegen pruefen (dieselbe Regel, ohne zu schreiben).
    pruefePflichtfelderVl(body);
    return res.json({ dry_run: true, wuerde_anlegen: true, match: t.ergebnis, hinweise });
  }

  const row = await erstelleVlDeal(body, req.user, { herkunft: 'api', api_token_id: req.apiToken.id });
  if (t.ergebnis === 'nahe') {
    await logAudit({ user: req.user, action: 'api_force', entityType: 'deal_vl', entityId: row.id,
      newData: { hinweis: 'trotz Nähe-Treffer angelegt', kandidaten: t.nahe.map(x => x.deal.id) } });
    hinweise.push(`trotz Nähe-Treffer angelegt (Kandidaten: ${t.nahe.map(x => x.deal.id).join(', ')})`);
  }
  const antwort = { deal: (await ausgabe([await db.get(BASE_SELECT + ` WHERE d.id=${P(1)}`, [row.id])]))[0], hinweise };
  if (idemKey) {
    try {
      await db.run(`INSERT INTO api_idempotency (token_id, schluessel, anfrage_hash, status, antwort) VALUES (${P(1)},${P(2)},${P(3)},${P(4)},${P(5)})`,
        [req.apiToken.id, idemKey, anfrageHash, 201, JSON.stringify(antwort)]);
    } catch (e) { console.error('[ext] idempotency speichern:', e.message); }
  }
  res.status(201).json(antwort);
}));

// ── PATCH /vl/:id — Teilaenderung (z. B. Gewonnen setzen) ────────────────────
router.patch('/vl/:id', requireScope('vl:write'), wrap(async (req, res) => {
  const bestand = await ladeImScope(req, req.params.id);
  const { body } = schreibBody(req);
  const felder = [];
  if (bestand.status === 'Umgestellt') felder.push({ feld: 'status', grund: 'umgestellt_nur_im_formular' });
  if (body.status !== undefined && !API_STATUS.includes(body.status)) felder.push({ feld: 'status', grund: 'nicht_erlaubt', erlaubt: API_STATUS });
  if (body.kam_id === null || body.kam_id === '') felder.push({ feld: 'kam_id', grund: 'fehlt' });
  if (felder.length) throw validierung(felder);
  if (body.kam_id !== undefined) await pruefeKam(req, body.kam_id);
  if (body.company_id !== undefined) await pruefeCompany(body.company_id);
  const hinweise = [];
  if (body.monat !== undefined || body.ende_kuendigungsfrist !== undefined) monatAbleiten({ ...body, monat: body.monat ?? bestand.monat }, hinweise);
  await aendereVlDeal(bestand.id, body, req.user);
  res.json({ deal: (await ausgabe([await db.get(BASE_SELECT + ` WHERE d.id=${P(1)}`, [bestand.id])]))[0], hinweise });
}));

// ── Stammdaten fuer Skripte: KAMs und Companies im Scope ─────────────────────
router.get('/kams', requireScope('vl:read'), wrap(async (req, res) => {
  const rows = await db.all(
    `SELECT e.id, e.name, e.standort, e.rolle, e.aktiv, e.company_id, c.name AS company_name,
            (SELECT u.email FROM users u WHERE u.employee_id = e.id ORDER BY u.id LIMIT 1) AS email
       FROM employees e LEFT JOIN companies c ON c.id = e.company_id
      WHERE e.rolle IN (${kamRollenSql()}) ORDER BY e.name`);
  const aktiv = (v) => v === true || v === 1 || v === '1' || v === 't';
  res.json(rows.filter(r => imStandortScope(req.apiToken, r.standort) && (req.query.alle === 'true' || aktiv(r.aktiv)))
    .map(r => ({ id: r.id, name: String(r.name || '').trim(), standort: r.standort, rolle: r.rolle, aktiv: aktiv(r.aktiv),
      company_id: r.company_id, company_name: r.company_name, email: r.email || null })));
}));

router.get('/companies', requireScope('vl:read'), wrap(async (req, res) => {
  const rows = await db.all(`SELECT c.id, c.name, c.currency, c.aktiv FROM companies c ORDER BY c.id`);
  let erlaubt = null;
  if (req.apiToken.standorte) {
    const emp = await db.all(`SELECT DISTINCT company_id, standort FROM employees WHERE standort IS NOT NULL`);
    erlaubt = new Set(emp.filter(e => imStandortScope(req.apiToken, e.standort)).map(e => Number(e.company_id)));
  }
  res.json(rows.filter(c => !erlaubt || erlaubt.has(Number(c.id))).map(c => ({ id: c.id, name: c.name, currency: c.currency })));
}));

// ── Unbekannte Pfade und Fehler im API-Format ────────────────────────────────
router.use((req, res) => res.status(404).json({ error: { code: 'not_found', message: 'Unbekannter Endpoint.' } }));
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, _next) => {
  if (err instanceof ApiFehler) return res.status(err.status).json({ error: { code: err.code, message: err.message, ...err.extra } });
  const status = err.status || err.statusCode || 500;
  if (status === 400) {
    const felder = err.felder ? err.felder.map(({ feld, grund }) => ({ feld, grund })) : [{ feld: null, grund: err.message }];
    return res.status(400).json({ error: { code: 'validation', message: err.message, felder } });
  }
  if (status === 403) return res.status(403).json({ error: { code: 'forbidden', message: err.message } });
  if (status === 404) return res.status(404).json({ error: { code: 'not_found', message: 'Verlängerung nicht gefunden.' } });
  console.error('[ext] Fehler:', err);
  res.status(500).json({ error: { code: 'internal', message: 'Interner Fehler' } });
});

module.exports = router;
