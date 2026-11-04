// ── Anmeldung der externen API (/api/ext/v1) per Token ─────────────────────────────────────
// Skripte melden sich mit einem Token an, nicht mit Passwort/JWT. Format: kpt_<praefix>_<geheim>.
// Gespeichert ist nur der SHA-256-Hash (api_tokens.token_hash, Migration 116); das Geheimnis
// existiert nach der Anlage nur noch beim Empfaenger.
//
// Nach der Pruefung stehen bereit:
//   req.apiToken = { id, name, scopes: [...], standorte: null | [...] }   (null = alle Standorte)
//   req.user     = Pseudo-Benutzer fuer die geteilten Schreibfunktionen und das Audit-Log:
//                  { id: null, name: 'API: <Token-Name>', role: 'api', employee_id: null }
// Fehler kommen im Format der externen API: { error: { code, message } }.
const crypto = require('crypto');
const db = require('../db');

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

function neuesToken() {
  const praefix = crypto.randomBytes(4).toString('hex');
  const geheim  = crypto.randomBytes(32).toString('base64url');
  const token   = `kpt_${praefix}_${geheim}`;
  return { token, praefix, hash: hashToken(token) };
}

const liste = (v) => String(v || '').split(',').map(x => x.trim()).filter(Boolean);
const wahr  = (v) => v === true || v === 1 || v === '1' || v === 't';
const fehler = (res, status, code, message, extra = {}) =>
  res.status(status).json({ error: { code, message, ...extra } });

// ── Rate-Limit: gleitendes Fenster je Token, im Speicher ─────────────────────────────────────
// Railway laeuft mit einer Instanz; nach einem Deploy beginnt die Zaehlung neu. Fuer den Schutz
// vor einem durchdrehenden Skript reicht das — es ist keine Abrechnungsgrenze.
const LIMIT_PRO_MINUTE = Number(process.env.API_RATE_LIMIT_PER_MIN) || 60;
const fenster = new Map(); // token_id -> [Zeitstempel ms]
function rateLimitUeberschritten(tokenId, jetzt = Date.now()) {
  const ts = (fenster.get(tokenId) || []).filter(t => jetzt - t < 60_000);
  if (ts.length >= LIMIT_PRO_MINUTE) {
    fenster.set(tokenId, ts);
    return Math.max(1, Math.ceil((60_000 - (jetzt - ts[0])) / 1000));   // Sekunden bis frei
  }
  ts.push(jetzt);
  fenster.set(tokenId, ts);
  return 0;
}

// zuletzt_benutzt hoechstens einmal pro Minute schreiben — sonst kostet jeder Aufruf ein UPDATE.
const zuletztGeschrieben = new Map();
async function merkeBenutzung(tokenId) {
  const jetzt = Date.now();
  if (jetzt - (zuletztGeschrieben.get(tokenId) || 0) < 60_000) return;
  zuletztGeschrieben.set(tokenId, jetzt);
  const now = db.dialect === 'postgres' ? 'NOW()' : "datetime('now')";
  const p = db.dialect === 'postgres' ? '$1' : '?';
  try { await db.run(`UPDATE api_tokens SET zuletzt_benutzt=${now} WHERE id=${p}`, [tokenId]); }
  catch (e) { console.error('[api-token] zuletzt_benutzt:', e.message); }
}

/** Middleware: gueltiges, aktives Token + Rate-Limit. Scopes prueft requireScope. */
async function requireApiToken(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : (req.headers['x-api-key'] || '').trim();
    if (!token) return fehler(res, 401, 'unauthorized', 'Token fehlt (Header Authorization: Bearer <token>).');
    const p = db.dialect === 'postgres' ? '$1' : '?';
    const row = await db.get(`SELECT * FROM api_tokens WHERE token_hash=${p}`, [hashToken(token)]);
    if (!row || !wahr(row.aktiv) || row.widerrufen_am) return fehler(res, 401, 'unauthorized', 'Token ungültig oder widerrufen.');

    const warte = rateLimitUeberschritten(row.id);
    if (warte) {
      res.set('Retry-After', String(warte));
      return fehler(res, 429, 'rate_limit', `Höchstens ${LIMIT_PRO_MINUTE} Anfragen pro Minute — erneut in ${warte} s.`);
    }
    merkeBenutzung(row.id);

    const standorte = liste(row.standorte);
    req.apiToken = { id: row.id, name: row.name, scopes: liste(row.scopes), standorte: standorte.length ? standorte : null };
    req.user = { id: null, name: `API: ${row.name}`, role: 'api', employee_id: null, api_token_id: row.id };
    next();
  } catch (e) { next(e); }
}

/** Middleware-Fabrik: Token muss den Scope tragen. */
const requireScope = (scope) => (req, res, next) =>
  req.apiToken?.scopes.includes(scope)
    ? next()
    : fehler(res, 403, 'scope', `Token hat den Scope „${scope}" nicht.`, { fehlender_scope: scope });

/** Liegt ein Standort im Scope des Tokens? (null = alle) */
const imStandortScope = (apiToken, standort) => !apiToken.standorte || apiToken.standorte.includes(standort);

module.exports = { requireApiToken, requireScope, imStandortScope, neuesToken, hashToken, rateLimitUeberschritten, LIMIT_PRO_MINUTE };
