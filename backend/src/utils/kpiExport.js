/**
 * Vollexport der KPI-Mitarbeiter-Beta-Auswertung (Sektionen S0–S8).
 *
 * Long-Format: eine Zeile = eine Metrik in einem Kontext. Feste Spalten (siehe COLUMNS).
 * Ziele/Soll-Quoten/Rollen kommen ausschliesslich aus shared/kpiConstants.json,
 * damit Export und UI nie auseinanderlaufen.
 *
 * Konventionen:
 *  - Quoten immer mit zaehler_n / nenner_d, einheit = prozent
 *  - Division durch Null -> wert leer, kommentar "keine Basis" (niemals 0 als Platzhalter)
 *  - Nicht anwendbare Felder bleiben leer
 */
const db = require('../db');
const K = require('../../../shared/kpiConstants.json');

const COLUMNS = [
  'sektion', 'zeitraum_von', 'zeitraum_bis', 'granularitaet', 'datum', 'kw',
  'mitarbeiter', 'rolle', 'standort', 'metrik', 'wert', 'soll', 'abweichung',
  'zaehler_n', 'nenner_d', 'einheit', 'kommentar',
];

// activity_logs-Metrikfelder, gruppiert wie die Eingabemaske. Vollstaendig (27 Felder).
const LOG_FIELDS = {
  'entscheider_terminierung': [
    'entscheider_erreicht', 'entscheider_terminiert', 'terminiert_cold_calls', 'terminiert_inbound',
    'settings_direkt', 'beratung_vereinbart_direkt', 'unqualifiziert_direkt', 'follow_up_direkt',
  ],
  'settings': [
    'settings_geplant', 'settings_stattgefunden', 'setting_abgesagt', 'setting_verschoben',
    'nicht_erreicht', 'unqualifiziert', 'follow_up', 'beratung_vereinbart',
  ],
  'beratungsgespraeche': [
    'beratungen_geplant', 'beratungen_stattgefunden', 'beratungen_verschoben', 'beratungen_no_show',
    'beratungen_direkter_close', 'beratungen_follow_up_cc2', 'beratungen_kein_close', 'beratungen_unqualifiziert',
  ],
  'inbound_mitarbeiter': ['inbound_mail', 'inbound_fax', 'inbound_ad'],
};
const ALL_LOG_FIELDS = Object.values(LOG_FIELDS).flat();

// ── Helper ────────────────────────────────────────────────────────────────────
// Postgres liefert DATE als JS-Date, SQLite als TEXT -> beides auf YYYY-MM-DD normalisieren.
const dstr = (d) => {
  if (!d) return '';
  if (d instanceof Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return String(d).slice(0, 10);
};
const num = (v) => Number(v) || 0;
const sum = (arr, key) => arr.reduce((s, r) => s + num(r[key]), 0);

const IS_OPENER = (r) => K.rollen.opener.includes(r);
const IS_CLOSER = (r) => K.rollen.closer.includes(r);
const IS_MULTI  = (r) => IS_OPENER(r) && IS_CLOSER(r);

const isoWeek = (isoDate) => {
  const dt = new Date(isoDate + 'T12:00:00');
  dt.setDate(dt.getDate() + 4 - (dt.getDay() || 7));
  const y0 = new Date(dt.getFullYear(), 0, 1);
  return Math.ceil((((dt - y0) / 86400000) + 1) / 7);
};

const eachDay = (von, bis) => {
  const out = [];
  const cur = new Date(von + 'T12:00:00');
  const end = new Date(bis + 'T12:00:00');
  while (cur <= end) { out.push(dstr(cur)); cur.setDate(cur.getDate() + 1); }
  return out;
};

const isWorkday = (isoDate) => {
  const wd = new Date(isoDate + 'T12:00:00').getDay();
  return wd !== 0 && wd !== 6;
};
const countWorkdays = (von, bis) => eachDay(von, bis).filter(isWorkday).length;

const shiftDays = (isoDate, delta) => {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  return dstr(d);
};

// ── Zeilenbau ─────────────────────────────────────────────────────────────────
function makeRowFactory(ctx) {
  const { von, bis } = ctx;
  return function row(sektion, granularitaet, fields = {}) {
    return {
      sektion, zeitraum_von: von, zeitraum_bis: bis, granularitaet,
      datum: '', kw: '', mitarbeiter: '', rolle: '', standort: '',
      metrik: '', wert: '', soll: '', abweichung: '',
      zaehler_n: '', nenner_d: '', einheit: '', kommentar: '',
      ...fields,
    };
  };
}

/**
 * Quotenzeile. Bei nenner_d <= 0: wert leer + Kommentar "keine Basis".
 * soll optional -> dann auch abweichung (in pp).
 */
function quoteRow(row, sektion, granularitaet, base, metrik, n, d, soll = null, kommentar = '') {
  const hasBase = num(d) > 0;
  const wert = hasBase ? +(num(n) / num(d) * 100).toFixed(1) : '';
  const abweichung = (hasBase && soll !== null && soll !== undefined)
    ? +(wert - soll).toFixed(1) : '';
  const notes = [];
  if (!hasBase) notes.push('keine Basis');
  else if (num(d) < K.low_base) notes.push(`geringe Datenbasis (<${K.low_base})`);
  if (kommentar) notes.push(kommentar);
  return row(sektion, granularitaet, {
    ...base, metrik, wert,
    soll: soll ?? '', abweichung,
    zaehler_n: num(n), nenner_d: num(d),
    einheit: 'prozent',
    kommentar: notes.join(' · '),
  });
}

// Alle Quoten eines Log-Sets (Mitarbeiterebene, rollenabhaengig).
function employeeQuotes(logs, rolle) {
  const err     = sum(logs, 'entscheider_erreicht');
  const term    = sum(logs, 'entscheider_terminiert');
  const setGepl = sum(logs, 'settings_geplant');
  const setStat = sum(logs, 'settings_stattgefunden');
  const berVer  = sum(logs, 'beratung_vereinbart');
  const berVerD = sum(logs, 'beratung_vereinbart_direkt');
  const berGepl = sum(logs, 'beratungen_geplant');
  const berStat = sum(logs, 'beratungen_stattgefunden');
  const scGelegt = berVer + berVerD;
  const opener = IS_OPENER(rolle), closer = IS_CLOSER(rolle), multi = IS_MULTI(rolle);
  return {
    absolut: {
      entscheider_erreicht: err, settings_terminiert: term,
      settings_geplant: setGepl, settings_stattgefunden: setStat,
      sales_calls_gelegt: scGelegt, beratung_vereinbart: berVer,
      beratung_vereinbart_direkt: berVerD,
      beratungen_geplant: berGepl, beratungen_stattgefunden: berStat,
      beratungen_direkter_close: sum(logs, 'beratungen_direkter_close'),
      beratungen_kein_close: sum(logs, 'beratungen_kein_close'),
      beratungen_follow_up_cc2: sum(logs, 'beratungen_follow_up_cc2'),
    },
    quoten: [
      { metrik: 'terminierungsquote', n: term,     d: err,     soll: null,                     gilt: opener },
      { metrik: 'show_rate_setting',  n: setStat,  d: setGepl, soll: K.soll_quoten.show_rate_setting, gilt: opener },
      { metrik: 'durchstellung',      n: berVer,   d: setStat, soll: K.soll_quoten.durchstellung,     gilt: opener },
      { metrik: 'show_rate_closing',  n: berStat,  d: berGepl, soll: K.soll_quoten.show_rate_closing, gilt: closer },
      { metrik: 'set_to_sc_gelegt',   n: scGelegt, d: term,    soll: K.soll_quoten.set_to_sc_gelegt,  gilt: opener },
      { metrik: 'set_to_sc_statt',    n: berStat,  d: term,    soll: K.soll_quoten.set_to_sc_statt,   gilt: multi },
    ],
  };
}

// ── Datenbeschaffung (aggregiert, kein N+1) ───────────────────────────────────
async function fetchData({ von, bis, prevVon, prevBis, company_id }) {
  const pg = db.dialect === 'postgres';
  let i = 1;
  const p = () => (pg ? `$${i++}` : '?');

  // Mitarbeiter komplett laden (klein) und in JS filtern -> keine BOOLEAN/INTEGER-Dialektfallen.
  const employees = await db.all(
    'SELECT id, name, rolle, standort, aktiv, show_in_kpi, company_id FROM employees', []
  );

  const logConds = [`a.datum >= ${p()}`, `a.datum <= ${p()}`];
  const logParams = [prevVon || von, bis];
  if (company_id) { logConds.push(`a.company_id = ${p()}`); logParams.push(company_id); }
  const logs = await db.all(
    `SELECT a.*, e.name AS employee_name, e.rolle AS employee_rolle, e.standort AS employee_standort
       FROM activity_logs a LEFT JOIN employees e ON e.id = a.employee_id
      WHERE ${logConds.join(' AND ')}`, logParams);

  i = 1;
  const inbConds = [`datum >= ${p()}`, `datum <= ${p()}`];
  const inbParams = [prevVon || von, bis];
  if (company_id) { inbConds.push(`company_id = ${p()}`); inbParams.push(company_id); }
  const inbound = await db.all(
    `SELECT * FROM inbound_daily WHERE ${inbConds.join(' AND ')}`, inbParams);

  // NK-Deals fuer die Closing-Rate (Monatsbezug wie in der UI)
  const monate = [...new Set([von.slice(0, 7), bis.slice(0, 7)])];
  i = 1;
  const ph = monate.map(() => p()).join(',');
  const dealParams = [...monate];
  let dealCond = `d.monat IN (${ph})`;
  if (company_id) { dealCond += ` AND d.company_id = ${p()}`; dealParams.push(company_id); }
  const deals = await db.all(
    `SELECT d.id, d.monat, d.status,
            closer.standort AS closer_standort, setter.standort AS setter_standort
       FROM deals_nk d
       LEFT JOIN employees closer ON closer.id = d.closer_id
       LEFT JOIN employees setter ON setter.id = d.setter_id
      WHERE ${dealCond}`, dealParams);

  return { employees, logs, inbound, deals };
}

// ── Hauptfunktion ─────────────────────────────────────────────────────────────
/**
 * @returns {{ columns: string[], rows: object[], meta: object }}
 */
async function buildKpiExport(opts) {
  const granularitaet = opts.granularitaet || 'monat';
  const standort = opts.standort || '';
  const company_id = opts.company_id || null;
  const von = dstr(opts.von);
  // Kumulierte Werte zaehlen nur bis zum Stichtag -> Zeitraumende darauf begrenzen.
  const stichtag = dstr(opts.stichtag || opts.bis);
  const rawBis = dstr(opts.bis);
  const bis = stichtag && stichtag < rawBis ? stichtag : rawBis;

  // Vorzeitraum: bei Monat der volle Vormonat, sonst gleich langes Fenster davor.
  let prevVon, prevBis, prevLabel;
  if (granularitaet === 'monat') {
    const [y, m] = von.slice(0, 7).split('-').map(Number);
    const pm = new Date(y, m - 2, 1);
    const mm = `${pm.getFullYear()}-${String(pm.getMonth() + 1).padStart(2, '0')}`;
    const last = new Date(pm.getFullYear(), pm.getMonth() + 1, 0).getDate();
    prevVon = `${mm}-01`; prevBis = `${mm}-${String(last).padStart(2, '0')}`; prevLabel = 'Vormonat';
  } else {
    const len = eachDay(von, bis).length;
    prevBis = shiftDays(von, -1); prevVon = shiftDays(prevBis, -(len - 1));
    prevLabel = granularitaet === 'woche' ? 'Vorwoche' : 'Vortag';
  }

  const { employees, logs, inbound, deals } = await fetchData({ von, bis, prevVon, prevBis, company_id });

  // Relevante Mitarbeiter: aktiv + show_in_kpi + getrackte Rolle + Standortfilter.
  const emps = employees
    .filter(e => !!e.aktiv && !!e.show_in_kpi)
    .filter(e => K.rollen.tracked.includes(e.rolle))
    .filter(e => !standort || e.standort === standort)
    .filter(e => !company_id || String(e.company_id) === String(company_id))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const empIds = new Set(emps.map(e => e.id));

  const inRange = (d, a, b) => { const x = dstr(d); return x >= a && x <= b; };
  const scoped   = logs.filter(l => empIds.has(l.employee_id) && inRange(l.datum, von, bis));
  const prevScoped = logs.filter(l => empIds.has(l.employee_id) && inRange(l.datum, prevVon, prevBis));

  const ctx = { von, bis };
  const row = makeRowFactory(ctx);
  const rows = [];
  const days = eachDay(von, bis);

  // ── S0 meta ────────────────────────────────────────────────────────────────
  const arbeitstage = countWorkdays(von, bis);
  const monatsVon = `${bis.slice(0, 7)}-01`;
  const vergangeneAT = countWorkdays(monatsVon, bis);
  const meta = [
    ['exportdatum', dstr(new Date()), 'datum', ''],
    ['zeitraum_von', von, 'datum', ''],
    ['zeitraum_bis', bis, 'datum', rawBis !== bis ? `auf Stichtag ${stichtag} begrenzt` : ''],
    ['granularitaet', granularitaet, '', ''],
    ['standortfilter', standort || 'alle', '', standort ? '' : 'kein Standortfilter aktiv'],
    ['arbeitstage_im_zeitraum', arbeitstage, 'anzahl', 'Mo–Fr'],
    ['vergangene_arbeitstage_bis_stichtag', vergangeneAT, 'anzahl', `Mo–Fr ab ${monatsVon}`],
    ['monatsziel_sales_calls', K.monatsziele.sales_calls, 'anzahl', 'fix, nicht aus Arbeitstagen abgeleitet'],
    ['monatsziel_settings', K.monatsziele.settings, 'anzahl', 'fix, nicht aus Arbeitstagen abgeleitet'],
    ['tagesziel_sales_calls', K.tagesziele.sales_calls, 'anzahl', ''],
    ['tagesziel_settings', K.tagesziele.settings, 'anzahl', ''],
    ['anzahl_mitarbeiter', emps.length, 'anzahl', 'aktiv + show_in_kpi + getrackte Rolle'],
    ['luecken_marker', 'keine_erfassung', '', 'Arbeitstage ohne activity_log erscheinen in S2 als eigene Zeile mit leerem wert'],
  ];
  meta.forEach(([metrik, wert, einheit, kommentar]) =>
    rows.push(row('S0_meta', granularitaet, { metrik, wert, einheit, kommentar })));
  Object.entries(K.soll_quoten).forEach(([k, v]) =>
    rows.push(row('S0_meta', granularitaet, { metrik: `soll_${k}`, wert: v, einheit: 'prozent' })));

  // ── S1 definitionen ────────────────────────────────────────────────────────
  K.definitionen.forEach(d =>
    rows.push(row('S1_definitionen', '', {
      metrik: d.metrik, wert: d.label, einheit: d.einheit, kommentar: d.formel,
    })));

  // ── S2 rohdaten_mitarbeiter_tag ────────────────────────────────────────────
  const logByEmpDay = new Map();
  scoped.forEach(l => logByEmpDay.set(`${l.employee_id}|${dstr(l.datum)}`, l));

  for (const e of emps) {
    const base = { mitarbeiter: e.name, rolle: e.rolle || '', standort: e.standort || '' };
    for (const day of days) {
      const log = logByEmpDay.get(`${e.id}|${day}`);
      const dayBase = { ...base, datum: day, kw: isoWeek(day) };
      if (!log) {
        // Luecken nur an Arbeitstagen markieren (Wochenenden sind kein Erfassungsausfall).
        if (isWorkday(day)) {
          rows.push(row('S2_rohdaten_mitarbeiter_tag', 'tag', {
            ...dayBase, metrik: 'keine_erfassung', wert: '', einheit: '',
            kommentar: 'keine Erfassung',
          }));
        }
        continue;
      }
      for (const [gruppe, fields] of Object.entries(LOG_FIELDS)) {
        for (const f of fields) {
          rows.push(row('S2_rohdaten_mitarbeiter_tag', 'tag', {
            ...dayBase, metrik: f, wert: num(log[f]), einheit: 'anzahl', kommentar: gruppe,
          }));
        }
      }
      if (log.kommentar) {
        rows.push(row('S2_rohdaten_mitarbeiter_tag', 'tag', {
          ...dayBase, metrik: 'kommentar', wert: log.kommentar, einheit: '', kommentar: 'freitext',
        }));
      }
    }
  }

  // ── S3 quoten_mitarbeiter_zeitraum ─────────────────────────────────────────
  const emitEmployeeBlock = (sektion, gran, e, logSet, extraKommentar = '') => {
    const base = { mitarbeiter: e.name, rolle: e.rolle || '', standort: e.standort || '' };
    const { absolut, quoten } = employeeQuotes(logSet, e.rolle);
    Object.entries(absolut).forEach(([metrik, wert]) =>
      rows.push(row(sektion, gran, { ...base, metrik, wert, einheit: 'anzahl', kommentar: extraKommentar })));
    quoten.forEach(q => {
      if (!q.gilt) {
        rows.push(row(sektion, gran, {
          ...base, metrik: q.metrik, wert: '', einheit: 'prozent',
          kommentar: ['fuer Rolle nicht anwendbar', extraKommentar].filter(Boolean).join(' · '),
        }));
        return;
      }
      rows.push(quoteRow(row, sektion, gran, base, q.metrik, q.n, q.d, q.soll, extraKommentar));
    });
  };

  const logsByEmp = new Map(emps.map(e => [e.id, []]));
  scoped.forEach(l => logsByEmp.get(l.employee_id)?.push(l));
  for (const e of emps) {
    emitEmployeeBlock('S3_quoten_mitarbeiter_zeitraum', 'zeitraum', e, logsByEmp.get(e.id) || []);
  }

  // ── S4 quoten_mitarbeiter_woche ────────────────────────────────────────────
  const weeks = [...new Set(days.map(isoWeek))].sort((a, b) => a - b);
  for (const e of emps) {
    const empLogs = logsByEmp.get(e.id) || [];
    for (const kw of weeks) {
      const wLogs = empLogs.filter(l => isoWeek(dstr(l.datum)) === kw);
      const base = { mitarbeiter: e.name, rolle: e.rolle || '', standort: e.standort || '', kw };
      const { absolut, quoten } = employeeQuotes(wLogs, e.rolle);
      Object.entries(absolut).forEach(([metrik, wert]) =>
        rows.push(row('S4_quoten_mitarbeiter_woche', 'woche', { ...base, metrik, wert, einheit: 'anzahl' })));
      quoten.filter(q => q.gilt).forEach(q =>
        rows.push(quoteRow(row, 'S4_quoten_mitarbeiter_woche', 'woche', base, q.metrik, q.n, q.d, q.soll)));
    }
  }

  // ── S5 team_tag ────────────────────────────────────────────────────────────
  for (const day of days) {
    const dayLogs = scoped.filter(l => dstr(l.datum) === day);
    const base = { datum: day, kw: isoWeek(day) };
    const scGelegt = sum(dayLogs, 'beratung_vereinbart') + sum(dayLogs, 'beratung_vereinbart_direkt');
    const term = sum(dayLogs, 'entscheider_terminiert');
    const absolut = {
      sales_calls_gelegt: scGelegt,
      settings_terminiert: term,
      entscheider_erreicht: sum(dayLogs, 'entscheider_erreicht'),
      settings_geplant: sum(dayLogs, 'settings_geplant'),
      settings_stattgefunden: sum(dayLogs, 'settings_stattgefunden'),
      beratungen_geplant: sum(dayLogs, 'beratungen_geplant'),
      beratungen_stattgefunden: sum(dayLogs, 'beratungen_stattgefunden'),
      mitarbeiter_mit_erfassung: new Set(dayLogs.map(l => l.employee_id)).size,
    };
    Object.entries(absolut).forEach(([metrik, wert]) =>
      rows.push(row('S5_team_tag', 'tag', { ...base, metrik, wert, einheit: 'anzahl' })));
    // Daily Pace gegen die Tagesziele
    rows.push(row('S5_team_tag', 'tag', {
      ...base, metrik: 'pace_sales_calls_tag', wert: scGelegt, einheit: 'anzahl',
      soll: K.tagesziele.sales_calls, abweichung: scGelegt - K.tagesziele.sales_calls,
      kommentar: isWorkday(day) ? '' : 'Wochenende',
    }));
    rows.push(row('S5_team_tag', 'tag', {
      ...base, metrik: 'pace_settings_tag', wert: term, einheit: 'anzahl',
      soll: K.tagesziele.settings, abweichung: term - K.tagesziele.settings,
      kommentar: isWorkday(day) ? '' : 'Wochenende',
    }));
    rows.push(quoteRow(row, 'S5_team_tag', 'tag', base, 'show_rate_setting',
      absolut.settings_stattgefunden, absolut.settings_geplant, K.soll_quoten.show_rate_setting));
    rows.push(quoteRow(row, 'S5_team_tag', 'tag', base, 'show_rate_closing',
      absolut.beratungen_stattgefunden, absolut.beratungen_geplant, K.soll_quoten.show_rate_closing));
  }

  // ── S6 zielerreichung (Team) ───────────────────────────────────────────────
  const mtdSC = sum(scoped, 'beratung_vereinbart') + sum(scoped, 'beratung_vereinbart_direkt');
  const mtdSettings = sum(scoped, 'entscheider_terminiert');
  const paceSC = K.tagesziele.sales_calls * vergangeneAT;
  const paceSettings = K.tagesziele.settings * vergangeneAT;
  const zielBlock = [
    ['sales_calls', mtdSC, paceSC, K.monatsziele.sales_calls],
    ['settings',    mtdSettings, paceSettings, K.monatsziele.settings],
  ];
  for (const [name, ist, pace, monatsziel] of zielBlock) {
    const b = { kommentar: 'Team gesamt — der Bereich kennt keine Mitarbeiter-Solls' };
    rows.push(row('S6_zielerreichung', 'monat', { ...b, metrik: `${name}_ist_kumuliert`, wert: ist, einheit: 'anzahl' }));
    rows.push(row('S6_zielerreichung', 'monat', {
      ...b, metrik: `${name}_pace_soll_bis_stichtag`, wert: pace, einheit: 'anzahl',
      kommentar: `${b.kommentar} · Tagesziel × ${vergangeneAT} vergangene Arbeitstage`,
    }));
    rows.push(row('S6_zielerreichung', 'monat', {
      ...b, metrik: `${name}_abweichung_zu_pace`, wert: ist - pace, einheit: 'anzahl',
    }));
    rows.push(row('S6_zielerreichung', 'monat', {
      ...b, metrik: `${name}_monatsziel`, wert: monatsziel, einheit: 'anzahl',
    }));
    rows.push(quoteRow(row, 'S6_zielerreichung', 'monat', b,
      `${name}_erreicht_prozent`, ist, monatsziel, null));
  }

  // ── S7 vergleich_vorzeitraum ───────────────────────────────────────────────
  const prevByEmp = new Map(emps.map(e => [e.id, []]));
  prevScoped.forEach(l => prevByEmp.get(l.employee_id)?.push(l));
  for (const e of emps) {
    emitEmployeeBlock('S7_vergleich_vorzeitraum', 'zeitraum', e, prevByEmp.get(e.id) || [],
      `${prevLabel} ${prevVon}..${prevBis}`);
    // Deltas
    const cur = employeeQuotes(logsByEmp.get(e.id) || [], e.rolle);
    const prv = employeeQuotes(prevByEmp.get(e.id) || [], e.rolle);
    const base = { mitarbeiter: e.name, rolle: e.rolle || '', standort: e.standort || '' };
    Object.keys(cur.absolut).forEach(k =>
      rows.push(row('S7_vergleich_vorzeitraum', 'zeitraum', {
        ...base, metrik: `delta_${k}`, wert: cur.absolut[k] - prv.absolut[k], einheit: 'anzahl',
        kommentar: `aktuell ${cur.absolut[k]} vs. ${prevLabel} ${prv.absolut[k]}`,
      })));
    cur.quoten.forEach((q, idx) => {
      const pq = prv.quoten[idx];
      if (!q.gilt || num(q.d) === 0 || num(pq.d) === 0) return;
      const a = +(num(q.n) / num(q.d) * 100).toFixed(1);
      const b2 = +(num(pq.n) / num(pq.d) * 100).toFixed(1);
      rows.push(row('S7_vergleich_vorzeitraum', 'zeitraum', {
        ...base, metrik: `delta_${q.metrik}`, wert: +(a - b2).toFixed(1), einheit: 'pp',
        kommentar: `aktuell ${a}% vs. ${prevLabel} ${b2}%`,
      }));
    });
  }

  // ── S8 inbound ─────────────────────────────────────────────────────────────
  const INB_NOTE = 'inbound_daily hat keine Standort-Dimension — ungefiltert (company-weit)';
  const inbScoped = inbound.filter(r => inRange(r.datum, von, bis));
  for (const day of days) {
    const dayInb = inbScoped.filter(r => dstr(r.datum) === day);
    if (dayInb.length === 0) continue;
    const base = { datum: day, kw: isoWeek(day) };
    ['inbound_mail', 'inbound_fax', 'inbound_ad', 'terminiert_mail', 'terminiert_fax', 'terminiert_ad']
      .forEach(f => rows.push(row('S8_inbound', 'tag', {
        ...base, metrik: f, wert: sum(dayInb, f), einheit: 'anzahl', kommentar: INB_NOTE,
      })));
    const leads = sum(dayInb, 'inbound_mail') + sum(dayInb, 'inbound_fax') + sum(dayInb, 'inbound_ad');
    const termd = sum(dayInb, 'terminiert_mail') + sum(dayInb, 'terminiert_fax') + sum(dayInb, 'terminiert_ad');
    rows.push(quoteRow(row, 'S8_inbound', 'tag', base, 'lead_terminierung',
      termd, leads, K.soll_quoten.lead_terminierung, INB_NOTE));
  }
  // Kumuliert
  const leadsK = sum(inbScoped, 'inbound_mail') + sum(inbScoped, 'inbound_fax') + sum(inbScoped, 'inbound_ad');
  const termK  = sum(inbScoped, 'terminiert_mail') + sum(inbScoped, 'terminiert_fax') + sum(inbScoped, 'terminiert_ad');
  ['inbound_mail', 'inbound_fax', 'inbound_ad', 'terminiert_mail', 'terminiert_fax', 'terminiert_ad']
    .forEach(f => rows.push(row('S8_inbound', 'zeitraum', {
      metrik: f, wert: sum(inbScoped, f), einheit: 'anzahl', kommentar: INB_NOTE,
    })));
  rows.push(quoteRow(row, 'S8_inbound', 'zeitraum', {}, 'lead_terminierung',
    termK, leadsK, K.soll_quoten.lead_terminierung, INB_NOTE));

  // Team-Quoten des Zeitraums (inkl. Closing-Rate aus NK-Deals)
  const teamBase = { kommentar: 'Team gesamt' };
  const fSetGepl = sum(scoped, 'settings_geplant');
  const fSetStat = sum(scoped, 'settings_stattgefunden');
  const fBerVer  = sum(scoped, 'beratung_vereinbart');
  const fBerGepl = sum(scoped, 'beratungen_geplant');
  const fBerStat = sum(scoped, 'beratungen_stattgefunden');
  const scopedDeals = deals.filter(d =>
    !standort || d.closer_standort === standort || d.setter_standort === standort);
  const nkGesamt = scopedDeals.length;
  const nkGewonnen = scopedDeals.filter(d => d.status === 'Gewonnen').length;
  rows.push(quoteRow(row, 'S3_quoten_mitarbeiter_zeitraum', 'zeitraum', teamBase, 'show_rate_setting', fSetStat, fSetGepl, K.soll_quoten.show_rate_setting));
  rows.push(quoteRow(row, 'S3_quoten_mitarbeiter_zeitraum', 'zeitraum', teamBase, 'durchstellung', fBerVer, fSetStat, K.soll_quoten.durchstellung));
  rows.push(quoteRow(row, 'S3_quoten_mitarbeiter_zeitraum', 'zeitraum', teamBase, 'show_rate_closing', fBerStat, fBerGepl, K.soll_quoten.show_rate_closing));
  rows.push(quoteRow(row, 'S3_quoten_mitarbeiter_zeitraum', 'zeitraum', teamBase, 'set_to_sc_gelegt', mtdSC, mtdSettings, K.soll_quoten.set_to_sc_gelegt));
  rows.push(quoteRow(row, 'S3_quoten_mitarbeiter_zeitraum', 'zeitraum', teamBase, 'set_to_sc_statt', fBerStat, mtdSettings, K.soll_quoten.set_to_sc_statt));
  rows.push(quoteRow(row, 'S3_quoten_mitarbeiter_zeitraum', 'zeitraum', teamBase, 'closing_rate', nkGewonnen, nkGesamt, K.soll_quoten.closing_rate,
    'NK-Deals des Monats, Standort ueber Closer oder Setter'));
  rows.push(quoteRow(row, 'S3_quoten_mitarbeiter_zeitraum', 'zeitraum', teamBase, 'lead_terminierung', termK, leadsK, K.soll_quoten.lead_terminierung, INB_NOTE));

  return {
    columns: COLUMNS,
    rows,
    meta: { von, bis, rawBis, stichtag, granularitaet, standort, prevVon, prevBis, prevLabel,
            arbeitstage, vergangeneAT, mitarbeiter: emps.length },
  };
}

// CSV: UTF-8 BOM + Semikolon, alle Felder gequotet (wie der bisherige Beta-Export).
function toCsv(columns, rows) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [columns.map(esc).join(';')];
  for (const r of rows) lines.push(columns.map(c => esc(r[c])).join(';'));
  return '﻿' + lines.join('\r\n');
}

module.exports = { buildKpiExport, toCsv, COLUMNS, LOG_FIELDS, ALL_LOG_FIELDS };
