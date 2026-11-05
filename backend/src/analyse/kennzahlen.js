// Kennzahlen aus call_codings — portiert aus backend/analyse/oktober-2026/transkript/stats.js.
// Regeln wie Oktober:
//   - Hauptquote = Konfidenz hoch/mittel; niedrig-konfidente Calls und Gruende zaehlen nicht.
//   - Closing erfolgreich = Abschluss im Call ODER Opportunity laut Close gewonnen (bis zum Stichtag);
//     Gruende B5 nur fuer nicht gewonnene.
//   - Gruende sind Mehrfachnennungen (bis zu zwei je Call).
const { db, P, PH, TEAM, pct, r1, ymd } = require('./basis');
const { gruende: GRUENDE } = require('./prompt');
const { S } = require('./zeitlinie');

const STUFEN = ['Opening', 'Setting', 'Closing', 'Nachfassung'];
const BS = { Opening: 'B1', Setting: 'B2', Closing: 'B5', Nachfassung: 'B6' };
const INFO = Object.fromEntries(GRUENDE.map(g => [g.id, g]));
const MERKMALE = [
  ['entscheider_im_gespraech', 'Entscheider im Gespräch'],
  ['ma_fragte_aktiv_nach_termin', 'aktiv nach Termin gefragt'],
  ['naechster_schritt_mit_datum', 'nächster Schritt mit Datum'],
  ['abschlussfrage_gestellt', 'Abschlussfrage gestellt'],
  ['closing_aktiv_angeboten', 'Closing aktiv angeboten'],
  ['termin_verbindlich_fixiert', 'Termin verbindlich fixiert'],
  ['abschluss_aktiv_versucht', 'Abschluss aktiv versucht'],
];
// Qualifizierung (Vorgabe Deniz 05.11.2026). Felder ab Prompt v3; bei aelteren Codierungen fehlen
// Teilnahme-Zusage, Deckbarkeit und Zeitnaehe (null) und zaehlen nicht als Ausschluss.
const entscheiderDa = (c) => c.entscheider_im_gespraech === 'ja' || c.entscheider_nimmt_teil === 'ja';
const qualSetting = (c) => entscheiderDa(c) && c.bedarf_bestaetigt === 'ja' && c.bedarf_deckbar !== 'nein' && c.zeitnah !== 'nein';
const grundName = (id) => (id === 'SONSTIG' ? 'Sonstiger Grund (Freitext)' : (INFO[id] || {}).name || id);

/** Codierungen laden (Berlin-Datum, inklusive). basis: 'laufend' | 'oktober' | null (beide). */
async function ladeCodings({ von, bis, basis = null, employeeIds = null }) {
  const w = [`call_datum >= ${P(1)}`, `call_datum <= ${P(2)}`];
  const par = [von, bis];
  if (basis) { w.push(`basis = ${P(par.length + 1)}`); par.push(basis); }
  if (employeeIds) { w.push(`employee_id IN (${PH(employeeIds.length, par.length + 1)})`); par.push(...employeeIds); }
  const rows = await db.all(`SELECT * FROM call_codings WHERE ${w.join(' AND ')} ORDER BY call_datum, id`, par);
  return rows.map(r => ({
    ...r,
    call_datum: ymd(r.call_datum),
    gruende: [[r.grund1_id, r.grund1_konfidenz], [r.grund2_id, r.grund2_konfidenz]].filter(([id]) => id)
      .map(([id, k]) => ({ id, konfidenz: k, freitext: id === 'SONSTIG' ? r.grund_freitext : '' })),
  }));
}

/** Opportunities, die bis zum Stichtag (inklusive, Berlin) gewonnen wurden — aus dem Close-Spiegel. */
async function gewonneneOpps(oppIds, stichtag) {
  const ids = [...new Set(oppIds.filter(Boolean))];
  const out = new Set();
  for (let i = 0; i < ids.length; i += 500) {
    const t = ids.slice(i, i + 500);
    const ev = await db.all(`SELECT opportunity_id, date_created FROM close_status_events WHERE typ='opportunity' AND new_status_id=${P(1)}
                              AND opportunity_id IN (${PH(t.length, 2)})`, [S.WON, ...t]);
    for (const e of ev) if (ymd(e.date_created) <= stichtag) out.add(e.opportunity_id);
    // Mit WON angelegt (kein Statuswechsel-Event): Anlagedatum zaehlt
    const an = await db.all(`SELECT id, date_created FROM close_opportunities WHERE status_id=${P(1)} AND id IN (${PH(t.length, 2)})`, [S.WON, ...t]);
    for (const o of an) {
      const hatEv = await db.get(`SELECT 1 x FROM close_status_events WHERE typ='opportunity' AND opportunity_id=${P(1)} LIMIT 1`, [o.id]);
      if (!hatEv && ymd(o.date_created) <= stichtag) out.add(o.id);
    }
  }
  return out;
}

const base = (c) => c.konfidenz !== 'niedrig';
const avg = (a) => (a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length * 10) / 10 : null);
const zaehle = (a, f) => a.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});

/** Kennzahlen einer Stufe (stat() aus stats.js). gewonnen: Set der gewonnenen Opportunities. */
function stat(list, stufe, gewonnen = new Set()) {
  const b = list.filter(base);
  const won = (c) => gewonnen.has(c.close_opportunity_id);
  const f = stufe === 'Closing' ? b.filter(c => c.erfolg === 'nein' && !won(c)) : b.filter(c => c.erfolg === 'nein');
  const s = stufe === 'Closing' ? b.filter(c => c.erfolg === 'ja' || won(c)) : b.filter(c => c.erfolg === 'ja');
  const jn = (k) => { const ja = b.filter(c => c[k] === 'ja').length, nein = b.filter(c => c[k] === 'nein').length; return { ja, nein, basis: ja + nein, quote: pct(ja, ja + nein) }; };
  const anteil = (k) => { const ja = b.filter(c => c[k] === 'ja').length; return { ja, basis: b.length, quote: pct(ja, b.length) }; };
  const jnAuf = (liste, k) => { const ja = liste.filter(c => c[k] === 'ja').length, nein = liste.filter(c => c[k] === 'nein').length; return { ja, nein, basis: ja + nein, quote: pct(ja, ja + nein) }; };
  const zahlAuf = (n, basis) => ({ ja: n, basis, quote: pct(n, basis) });
  const mitEntscheider = b.filter(c => c.entscheider_im_gespraech === 'ja');
  let qualitaet = null;
  if (stufe === 'Opening') {
    const termine = b.filter(c => c.erfolg === 'ja');
    qualitaet = { terminOhneEntscheider: zahlAuf(termine.filter(c => c.entscheider_im_gespraech !== 'ja').length, termine.length),
      bedarfFestgestellt: zahlAuf(mitEntscheider.filter(c => c.bedarf_bestaetigt === 'ja').length, mitEntscheider.length) };
  } else if (stufe === 'Setting') {
    const q = b.filter(qualSetting), nq = b.filter(c => !qualSetting(c));
    qualitaet = { qualifiziert: zahlAuf(q.length, b.length),
      ohneEntscheider: zahlAuf(b.filter(c => !entscheiderDa(c)).length, b.length),
      ohneBedarf: zahlAuf(b.filter(c => c.bedarf_bestaetigt !== 'ja' || c.bedarf_deckbar === 'nein').length, b.length),
      nichtZeitnah: zahlAuf(b.filter(c => c.zeitnah === 'nein').length, b.length),
      angebotenUnqualifiziert: zahlAuf(nq.filter(c => c.closing_aktiv_angeboten === 'ja').length, nq.length) };
  } else if (stufe === 'Closing') {
    qualitaet = { einwaendeBehandelt: jnAuf(b, 'einwaende_behandelt'), folgeterminTrotzEinwaenden: jnAuf(b, 'folgetermin_trotz_einwaenden') };
  }
  const r = {};
  for (const c of f) for (const g of c.gruende.slice(0, 2)) {
    if (g.konfidenz === 'niedrig') continue;
    (r[g.id] = r[g.id] || { id: g.id, n: 0, bsp: [] }).n++;
    if (g.konfidenz === 'hoch' && c.konfidenz === 'hoch' && c.einzeiler && r[g.id].bsp.length < 3) r[g.id].bsp.push(c.einzeiler);
  }
  const top = Object.values(r).sort((a, x) => x.n - a.n || (a.id < x.id ? -1 : 1))
    .map(x => ({ ...x, name: grundName(x.id), kat: x.id === 'SONSTIG' ? '-' : (INFO[x.id] || {}).kategorie, anteil: pct(x.n, f.length) }));
  return {
    stufe, n: list.length, nBase: b.length, nNiedrig: list.length - b.length,
    abschlussImCall: stufe === 'Closing' ? b.filter(c => c.erfolg === 'ja').length : undefined,
    oppGewonnen: stufe === 'Closing' ? b.filter(won).length : undefined,
    ergebnis: zaehle(b, c => c.ergebnis), erfolgJa: s.length, erfolgNein: f.length, erfolgsquote: pct(s.length, s.length + f.length),
    merkmale: {
      entscheider_im_gespraech: anteil('entscheider_im_gespraech'),
      ma_fragte_aktiv_nach_termin: anteil('ma_fragte_aktiv_nach_termin'),
      naechster_schritt_mit_datum: anteil('naechster_schritt_mit_datum'),
      abschlussfrage_gestellt: jn('abschlussfrage_gestellt'),
      closing_aktiv_angeboten: jn('closing_aktiv_angeboten'),
      termin_verbindlich_fixiert: jn('termin_verbindlich_fixiert'),
      abschluss_aktiv_versucht: jn('abschluss_aktiv_versucht'),
      // Quoten nur dort, wo das Verhalten sinnvoll ist: Terminfrage nur mit Entscheider, Closing-Angebot nur bei
      // qualifiziertem Setting, Abschlussversuch nur mit Entscheider im Sales Call.
      abschlussfrage_gestellt_qual: jnAuf(mitEntscheider, 'abschlussfrage_gestellt'),
      closing_aktiv_angeboten_qual: jnAuf(b.filter(qualSetting), 'closing_aktiv_angeboten'),
      abschluss_aktiv_versucht_qual: jnAuf(mitEntscheider, 'abschluss_aktiv_versucht'),
    },
    qualitaet,
    redeanteil: avg(b.map(c => Number(c.redeanteil_ma)).filter(x => !isNaN(x) && x > 0)),
    dauerMin: avg(b.map(c => (Number(c.dauer_sek) || 0) / 60)),
    topGruende: top,
    niedrigGruende: f.reduce((m, c) => m + c.gruende.filter(g => g.konfidenz === 'niedrig').length, 0),
  };
}

/** Kennzahlen je Person (Vorname) und Team. */
async function auswerten(rows, stichtag) {
  const gewonnen = await gewonneneOpps(rows.filter(c => c.stufe === 'Closing').map(c => c.close_opportunity_id), stichtag);
  const sonst = (cs) => zaehle(cs.filter(c => /^Sonstiges/.test(c.stufe)), c => c.stufe.replace('Sonstiges_', ''));
  const personen = {};
  for (const p of TEAM.personen) {
    const cs = rows.filter(c => c.mitarbeiter === p.name || c.mitarbeiter === p.vorname);
    const o = { name: p.name, vorname: p.vorname, rolle: p.rolle, nCalls: cs.length, sonstiges: sonst(cs), nNiedrig: cs.filter(c => !base(c)).length, stufen: {} };
    for (const st of STUFEN) { const l = cs.filter(c => c.stufe === st); if (l.length) o.stufen[st] = stat(l, st, gewonnen); }
    personen[p.vorname] = o;
  }
  const team = { nCalls: rows.length, sonstiges: sonst(rows), nNiedrig: rows.filter(c => !base(c)).length, stufen: {} };
  for (const st of STUFEN) team.stufen[st] = stat(rows.filter(c => c.stufe === st), st, gewonnen);
  // Kategorien ueber alle Grund-Nennungen (Prozess / Gespraechsfuehrung / Lead-Qualitaet). Wie Oktober
  // (stats.js, kostenTermine): alle Calls mit erfolg=nein, auch spaeter gewonnene Closings.
  const kat = {};
  for (const c of rows) {
    if (!STUFEN.includes(c.stufe) || !base(c) || c.erfolg !== 'nein') continue;
    for (const g of c.gruende.slice(0, 2)) {
      if (g.konfidenz === 'niedrig') continue;
      const k = (INFO[g.id] || {}).kategorie || 'Sonstiger Grund';
      kat[k] = (kat[k] || 0) + 1;
    }
  }
  team.kategorien = kat;
  return { personen, team, gewonnen: [...gewonnen] };
}

module.exports = { ladeCodings, gewonneneOpps, stat, auswerten, STUFEN, BS, MERKMALE, grundName, INFO, base, qualSetting, entscheiderDa };
