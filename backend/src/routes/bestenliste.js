const router = require('express').Router();
const db = require('../db');
const wrap = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { requireFeature } = require('../middleware/requireFeature');
const { aeEurSql } = require('../utils/currency');

// ─────────────────────────────────────────────────────────────────────────────
// Bestenliste (Beta) — Motivations-Leaderboard fuer den Vertrieb. READ-ONLY.
// Datenbasis ausschliesslich deals_nk (activity_logs ist Bonn-only -> waere unfair).
// Drei Disziplinen (Opener/Setter/Closer) x zwei Wertungen (Anzahl/Volumen) x
// drei Zeitraeume (Monat/Quartal/Jahr). Ein gewonnener Deal schreibt ALLEN drei
// Rollen (opener/setter/closer) je in ihrer Disziplin gut.
//
// AE-Startmonat-Gate (Vorgabe): Ein Deal zaehlt fuer Anzahl UND Volumen nur, wenn
// gewonnen_monat >= company.ae_ab_monat (NULL = kein Filter). Risems echte
// August-Wins zaehlen voll; Juni/Juli-Importe fallen komplett raus.
// Gewinn-Zeitpunkt ist gewonnen_monat (nicht der Angebotsmonat).
//
// Ausbaustufen (bewusst NICHT gebaut, nur als Notiz):
//  - Team-Wettbewerb nach Standort (Summe je Standort).
//  - Weitere Disziplinen aus activity_logs, sobald ALLE Standorte tracken.
//  - BK/VL-Disziplinen fuer KAMs.
//  - Badges/Achievements, Wochen-Sprints.
// ─────────────────────────────────────────────────────────────────────────────

router.use(requireAuth);
router.use(requireFeature('bestenliste'));

const ROLE_COL = { opener: 'opener_id', setter: 'setter_id', closer: 'closer_id' };
const MONATE_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const pg = db.dialect === 'postgres';

// Lokales YYYY-MM-DD (keine UTC-Verschiebung).
function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function ymOf(y, mZero) { return `${y}-${String(mZero + 1).padStart(2, '0')}`; }

// Zeitraum -> Bedingung auf gewonnen_monat + Anzeige-Label, relativ zum Stichtag `heute`.
function monthCond(zeitraum, heute) {
  const y = heute.getFullYear();
  const m = heute.getMonth(); // 0..11
  if (zeitraum === 'jahr') {
    return { type: 'like', value: `${y}-%`, label: String(y) };
  }
  if (zeitraum === 'quartal') {
    const q = Math.floor(m / 3);         // 0..3
    const start = q * 3;                 // erster Monat des Quartals (0-basiert)
    const months = [0, 1, 2].map(k => ymOf(y, start + k));
    return { type: 'in', value: months, label: `Q${q + 1} ${y}` };
  }
  return { type: 'eq', value: ymOf(y, m), label: `${MONATE_DE[m]} ${y}` };
}

// Aggregierte Rangliste (eine Zeile je Mitarbeiter). `cutoff` (YYYY-MM-DD) optional:
// nur Deals, die bis dahin schon gewonnen waren (fuer den Wochen-Trend-Snapshot).
async function rankingQuery(col, mc, cutoff) {
  const params = [];
  const add = (v) => { params.push(v); return pg ? `$${params.length}` : '?'; };
  const cond = [`d.status = 'Gewonnen'`];

  if (mc.type === 'eq')        cond.push(`d.gewonnen_monat = ${add(mc.value)}`);
  else if (mc.type === 'in')   cond.push(`d.gewonnen_monat IN (${mc.value.map(add).join(', ')})`);
  else /* like */              cond.push(`d.gewonnen_monat LIKE ${add(mc.value)}`);

  // AE-Startmonat-Gate: greift fuer Anzahl UND Volumen (Deal faellt komplett raus).
  cond.push(`(c.ae_ab_monat IS NULL OR d.gewonnen_monat >= c.ae_ab_monat)`);
  // Nur aktive, KPI-sichtbare Mitarbeiter. e.aktiv: pg BOOLEAN / sqlite INTEGER
  // (bare truthy funktioniert in beiden); show_in_kpi ist INTEGER in beiden.
  cond.push(`e.aktiv AND e.show_in_kpi != 0`);
  if (cutoff) cond.push(`(d.gewonnen_datum IS NOT NULL AND d.gewonnen_datum <= ${add(cutoff)})`);

  const sql = `
    SELECT e.id AS employee_id, e.name, e.standort,
           COUNT(*) AS anzahl,
           SUM(${aeEurSql('d', 'c')}) AS volumen
      FROM deals_nk d
      JOIN employees e ON e.id = d.${col}
      JOIN companies c ON c.id = d.company_id
     WHERE ${cond.join(' AND ')}
     GROUP BY e.id, e.name, e.standort`;

  const rows = await db.all(sql, params);
  // pg liefert COUNT/SUM als String -> Number(). volumen kann NULL sein -> 0.
  return rows.map(r => ({
    employee_id: r.employee_id,
    name: r.name,
    standort: r.standort || null,
    anzahl: Number(r.anzahl) || 0,
    volumen: Number(r.volumen) || 0,
  }));
}

// Standard-Wettkampf-Platzierung: gleicher Wert = gleicher Platz, danach wird
// uebersprungen (1,1,3). Sortierung absteigend nach Wert, Tiebreak Name.
function assignPlaces(rows, wertKey) {
  const sorted = [...rows]
    .map(r => ({ ...r, wert: r[wertKey] }))
    .sort((a, b) => b.wert - a.wert || a.name.localeCompare(b.name, 'de'));
  let platz = 0, prev = null, seen = 0;
  for (const r of sorted) {
    seen++;
    if (prev === null || r.wert < prev) { platz = seen; prev = r.wert; }
    r.platz = platz;
  }
  return sorted;
}

// Kern-Logik, testbar ohne HTTP. heute = Stichtag (Default: jetzt).
async function buildBestenliste({ rolle, wertung, zeitraum, heute, employeeId }) {
  const col = ROLE_COL[rolle] || ROLE_COL.closer;
  const wertKey = wertung === 'volumen' ? 'volumen' : 'anzahl';
  const mc = monthCond(zeitraum, heute);

  // Rangliste jetzt + Snapshot vor 7 Tagen (fuer den Platz-Trend), gleiche Basis.
  const cutoff = fmtDate(new Date(heute.getTime() - 7 * 86400000));
  const [nowRows, prevRows] = await Promise.all([
    rankingQuery(col, mc, null),
    rankingQuery(col, mc, cutoff),
  ]);
  const now = assignPlaces(nowRows, wertKey);
  const prevPlace = new Map(assignPlaces(prevRows, wertKey).map(r => [r.employee_id, r.platz]));

  const decorate = (r) => {
    const pp = prevPlace.get(r.employee_id);
    return {
      platz: r.platz,
      employee_id: r.employee_id,
      name: r.name,
      standort: r.standort,
      wert: r.wert,
      // trend > 0 = Plaetze gutgemacht (Zahl kleiner geworden); null = neu in dieser Woche.
      trend: pp == null ? null : pp - r.platz,
      neu: pp == null,
    };
  };

  const podium = now.slice(0, 3).map(decorate);
  const top10 = now.slice(3, 10).map(decorate); // Plaetze 4..10, nichts darunter (kein Leak)

  // "Deine Position" — auch bei Platz > 10 immer sichtbar. Ohne employee-Link (Admins) null.
  let meine_position = null;
  if (employeeId != null) {
    const meIdx = now.findIndex(r => String(r.employee_id) === String(employeeId));
    if (meIdx === -1) {
      // Hat (fuer diese Disziplin/Zeitraum) noch keinen gewonnenen Deal.
      const last = now.length ? now[now.length - 1] : null;
      meine_position = {
        platziert: false,
        platz: null,
        wert: 0,
        fuehrt: false,
        ziel_platz: last ? last.platz : null,
        abstand: last ? last.wert : null,
        progress: 0,
      };
    } else {
      const me = now[meIdx];
      // Naechster besserer Platz: erster Eintrag oberhalb mit strikt groesserem Wert.
      let target = null;
      for (let i = meIdx - 1; i >= 0; i--) { if (now[i].wert > me.wert) { target = now[i]; break; } }
      meine_position = {
        platziert: true,
        platz: me.platz,
        wert: me.wert,
        name: me.name,
        standort: me.standort,
        fuehrt: target == null,                              // niemand ueber mir = Fuehrung
        ziel_platz: target ? target.platz : null,
        abstand: target ? target.wert - me.wert : 0,
        progress: target && target.wert > 0 ? Math.max(0, Math.min(1, me.wert / target.wert)) : 1,
      };
    }
  }

  // Vormonatssieger (🏆), immer bezogen auf den vorigen Kalendermonat + aktuelle Disziplin/Wertung.
  const pm = new Date(heute.getFullYear(), heute.getMonth() - 1, 1);
  const pmCond = { type: 'eq', value: ymOf(pm.getFullYear(), pm.getMonth()), label: `${MONATE_DE[pm.getMonth()]} ${pm.getFullYear()}` };
  const pmRanked = assignPlaces(await rankingQuery(col, pmCond, null), wertKey);
  const sieger = pmRanked.filter(r => r.platz === 1);
  const monatssieger_vormonat = sieger.length
    ? { name: sieger.map(s => s.name).join(' & '), monat_label: pmCond.label, wert: sieger[0].wert }
    : null;

  return {
    meta: { rolle: rolle in ROLE_COL ? rolle : 'closer', wertung: wertKey, zeitraum, zeitraum_label: mc.label },
    monatssieger_vormonat,
    podium,
    top10,
    meine_position,
  };
}

// GET /api/bestenliste?rolle=closer|setter|opener&wertung=anzahl|volumen&zeitraum=monat|quartal|jahr
// Optional &ref=YYYY-MM-DD (interner Stichtag-Override fuer Tests/historische Ansicht).
router.get('/', wrap(async (req, res) => {
  const rolle = ROLE_COL[req.query.rolle] ? req.query.rolle : 'closer';
  const wertung = ['anzahl', 'volumen'].includes(req.query.wertung) ? req.query.wertung : 'volumen';
  const zeitraum = ['monat', 'quartal', 'jahr'].includes(req.query.zeitraum) ? req.query.zeitraum : 'monat';
  const heute = /^\d{4}-\d{2}-\d{2}$/.test(req.query.ref || '') ? new Date(req.query.ref + 'T12:00:00') : new Date();

  const data = await buildBestenliste({ rolle, wertung, zeitraum, heute, employeeId: req.user.employee_id });
  res.json(data);
}));

module.exports = router;
module.exports._buildBestenliste = buildBestenliste;
module.exports._monthCond = monthCond;
module.exports._rankingQuery = rankingQuery;
