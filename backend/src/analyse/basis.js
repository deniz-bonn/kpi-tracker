// Gemeinsame Helfer der Wochenanalyse: Konfiguration, Datenbank-Dialekt, Berliner Kalender.
//
// Kalender-Regeln (Festlegung 04.11.2026):
//   - Werktage = Mo–Fr, Feiertage NRW zaehlen NICHT als Werktag-Ausnahme (wie Oktober und Board).
//   - Berichtswoche = Samstag bis Freitag; KW = ISO-Kalenderwoche des Freitags.
//   - Berichtsmonat = 1. des Monats bis Stichtag.
const path = require('path');
const db = require('../db');

const CONFIG_DIR = path.join(__dirname, '../../config/analyse');
const TEAM = require(path.join(CONFIG_DIR, 'team.json'));
const MODELS = require(path.join(CONFIG_DIR, 'models.json'));
const TAXONOMIE = require(path.join(CONFIG_DIR, 'taxonomie.v1.json'));

const pg = () => db.dialect === 'postgres';
const P = (i) => (pg() ? `$${i}` : '?');
const PH = (n, start = 1) => Array.from({ length: n }, (_, i) => P(start + i)).join(',');
const NOW = () => (pg() ? 'NOW()' : `datetime('now')`);
const B = (v) => (v == null ? null : pg() ? !!v : (v ? 1 : 0));          // Boolean-Parameter
const istWahr = (v) => v === true || v === 1 || v === '1' || v === 't' || v === 'true';

// Datum/Zeitstempel -> 'YYYY-MM-DD' in Europe/Berlin (DST-sicher, wie closeSync.js).
const BERLIN = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });
const ymd = (v) => {
  if (!v) return null;
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = v instanceof Date ? v : new Date(typeof v === 'string' && v.includes(' ') && !v.includes('T') ? v.replace(' ', 'T') + 'Z' : v);
  return isNaN(d.getTime()) ? String(v).slice(0, 10) : BERLIN.format(d);
};
const heute = () => ymd(new Date());
const addTage = (d, n) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const wochentag = (d) => new Date(d + 'T12:00:00Z').getUTCDay();        // 0 = So
const istWerktag = (d) => { const w = wochentag(d); return w >= 1 && w <= 5; };
/** Werktage NACH `von` bis einschliesslich `bis` (wie engine.js der Oktober-Analyse). */
function werktageZwischen(von, bis) {
  if (!von || !bis || bis <= von) return 0;
  let n = 0;
  for (let d = addTage(von, 1); d <= bis; d = addTage(d, 1)) if (istWerktag(d)) n++;
  return n;
}
/** Werktage im Intervall [von, bis] inklusive beider Enden. */
function werktageIm(von, bis) {
  let n = 0;
  for (let d = von; d <= bis; d = addTage(d, 1)) if (istWerktag(d)) n++;
  return n;
}
const kalendertage = (von, bis) => Math.round((Date.parse(bis + 'T12:00:00Z') - Date.parse(von + 'T12:00:00Z')) / 864e5);

function isoKw(d) {
  const dt = new Date(d + 'T12:00:00Z');
  const tag = (dt.getUTCDay() + 6) % 7;                  // Mo = 0
  dt.setUTCDate(dt.getUTCDate() - tag + 3);              // Donnerstag derselben Woche
  const jahr = dt.getUTCFullYear();
  const kw = Math.ceil(((dt - Date.UTC(jahr, 0, 1)) / 864e5 + 1) / 7);
  return { jahr, kw };
}
/** Berichtswoche (Sa–Fr), die den Stichtag enthaelt. */
function berichtswoche(stichtag) {
  const w = wochentag(stichtag);                         // Sa = 6
  const bisFreitag = (5 - w + 7) % 7;                    // Tage bis zum Freitag
  const bis = addTage(stichtag, bisFreitag);
  const von = addTage(bis, -6);
  return { von, bis, ...isoKw(bis) };
}

/** Postgres liefert TIMESTAMPTZ als Date, SQLite als Text — fuer Parameter immer ISO. */
const tsParam = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return pg() ? d.toISOString() : d.toISOString().replace('T', ' ').slice(0, 19);
};

/** Upsert ueber Primaer- oder Unique-Schluessel. cols: Spaltennamen, key: Konfliktspalten. */
async function upsert(tabelle, cols, werte, key, { update = null } = {}) {
  const upd = (update || cols.filter(c => !key.includes(c))).map(c => `${c}=EXCLUDED.${c}`).join(', ');
  const sql = `INSERT INTO ${tabelle} (${cols.join(',')}) VALUES (${PH(cols.length)})
               ON CONFLICT (${key.join(',')}) DO ${upd ? 'UPDATE SET ' + upd : 'NOTHING'}`;
  return db.run(sql, werte);
}

async function insertId(tabelle, obj) {
  const cols = Object.keys(obj);
  const vals = cols.map(c => obj[c]);
  if (pg()) {
    const r = await db.get(`INSERT INTO ${tabelle} (${cols.join(',')}) VALUES (${PH(cols.length)}) RETURNING id`, vals);
    return r.id;
  }
  const r = db.run(`INSERT INTO ${tabelle} (${cols.join(',')}) VALUES (${PH(cols.length)})`, vals);
  return Number(r.lastInsertRowid);
}

async function setting(schluessel, standard = null) {
  try {
    const r = await db.get(`SELECT wert FROM analyse_settings WHERE schluessel=${P(1)}`, [schluessel]);
    return r ? r.wert : standard;
  } catch { return standard; }
}
async function setzeSetting(schluessel, wert, von = null) {
  await upsert('analyse_settings', ['schluessel', 'wert', 'updated_by'], [schluessel, wert, von], ['schluessel']);
  await db.run(`UPDATE analyse_settings SET updated_at=${NOW()} WHERE schluessel=${P(1)}`, [schluessel]);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const pct = (a, b) => (b ? Math.round(1000 * a / b) / 10 : null);
const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10);
const r2 = (x) => (x == null ? null : Math.round(x * 100) / 100);

module.exports = {
  db, TEAM, MODELS, TAXONOMIE, CONFIG_DIR, pg, P, PH, NOW, B, istWahr, ymd, heute, addTage, wochentag,
  istWerktag, werktageZwischen, werktageIm, kalendertage, isoKw, berichtswoche, tsParam, upsert, insertId,
  setting, setzeSetting, sleep, pct, r1, r2,
};
