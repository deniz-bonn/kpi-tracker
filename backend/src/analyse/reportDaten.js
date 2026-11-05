// Alle Zahlen des Wochenreports — deterministisch, ohne Sprachmodell. Die Texte (texte.js) bekommen
// nur diese Zahlen; was im Mailtext als Zahl steht, kommt von hier.
const { db, TEAM, P, PH, addTage, berichtswoche, pct, r1, r2, ymd } = require('./basis');
const K = require('./kennzahlen');
const T = require('./trackerKpis');
const V = require('./verbleib');
const Z = require('./zeitlinie');
const { nochOffen } = require('./codierung');

const OKTOBER = { von: '2026-10-01', bis: '2026-11-03', stichtag: '2026-11-03' };
const OPENING_VOLL_AB = '2026-10-31';

/** Zeitraeume: Woche Sa–Fr mit dem Stichtag, Vorwoche, Monat 1. bis Stichtag. Frei waehlbar ueber von/bis. */
function zeitraeume({ stichtag, von = null, bis = null }) {
  const w = berichtswoche(stichtag);
  const woche = von && bis ? { von, bis, kw: berichtswoche(bis).kw, jahr: berichtswoche(bis).jahr } : { von: w.von, bis: w.bis, kw: w.kw, jahr: w.jahr };
  const vorwoche = { von: addTage(woche.von, -7), bis: addTage(woche.bis, -7) };
  const monatEnde = woche.bis < stichtag ? woche.bis : stichtag;
  const monat = { von: monatEnde.slice(0, 7) + '-01', bis: monatEnde };
  return { woche, vorwoche, monat, stichtag };
}

/** Kompakte Sicht einer Stufe fuer Report und Texte. */
function stufeKompakt(s) {
  if (!s || !s.n) return null;
  const m = s.merkmale;
  return {
    n: s.n, nBase: s.nBase, erfolgsquote: s.erfolgsquote, erfolgJa: s.erfolgJa, erfolgBasis: s.erfolgJa + s.erfolgNein,
    merkmale: Object.fromEntries(Object.keys(m).map(k => [k, m[k].quote == null ? null : { quote: m[k].quote, ja: m[k].ja, basis: m[k].basis }])),
    top3: s.topGruende.slice(0, 3).map(g => ({ id: g.id, name: g.name, n: g.n, anteil: g.anteil })),
    nichtErfolgreich: s.erfolgNein,
    qualitaet: s.qualitaet,
  };
}
const auswahl = (a) => ({
  personen: Object.fromEntries(Object.entries(a.personen).map(([v, o]) => [v, {
    nCalls: o.nCalls, sonstiges: o.sonstiges, nNiedrig: o.nNiedrig,
    stufen: Object.fromEntries(K.STUFEN.map(st => [st, stufeKompakt(o.stufen[st])]).filter(([, x]) => x)),
  }])),
  team: { nCalls: a.team.nCalls, nNiedrig: a.team.nNiedrig, sonstiges: a.team.sonstiges, kategorien: a.team.kategorien,
    stufen: Object.fromEntries(K.STUFEN.map(st => [st, stufeKompakt(a.team.stufen[st])]).filter(([, x]) => x)) },
});

// ── Potenzial: Pool x Vergleichsquote x Ø Deal (Hypothesen wie Oktober, stats.js) ────────────
const qual = (c) => K.qualSetting(c);   // Entscheider dabei/zugesagt + deckbarer Bedarf + zeitnah
const rate = (a, f) => (a.length ? a.filter(f).length / a.length : null);

/**
 * rows: Codierungen der Person im Zeitraum; teamRef: Team-Codierungen (Monat + Oktober) fuer stabile Vergleichsquoten.
 * Rueckgabe: Liste von Hebeln mit Rechnung, sortiert nach Umsatz.
 */
function potenziale(rows, teamRef, { dealWert, scZuWon, settingZuSc, gewonnen }) {
  const base = (c) => c.konfidenz !== 'niedrig';
  const st = (stufe, l) => l.filter(c => c.stufe === stufe && base(c));
  const out = [];
  // Setting: Closing nicht aktiv angeboten (B2-13)
  {
    const pool = st('Setting', rows).filter(c => qual(c) && c.closing_aktiv_angeboten === 'nein' && c.erfolg === 'nein');
    const ref = st('Setting', teamRef).filter(c => qual(c) && c.closing_aktiv_angeboten === 'ja');
    const q = rate(ref, c => c.erfolg === 'ja');
    if (pool.length && q != null && dealWert && scZuWon != null) out.push({ key: 'setting_closing_anbieten', stufe: 'Setting', merkmal: 'closing_aktiv_angeboten',
      titel: 'Im Setting den Sales-Call-Termin aktiv anbieten',
      text: 'Qualifizierte Settings (Entscheider dabei oder zugesagt, deckbarer Bedarf, zeitnah), in denen kein Sales-Call-Termin vorgeschlagen wurde. Sie endeten ohne Sales Call.',
      pool: pool.length, vergleichsquote: r1(q * 100), vergleichsBasis: ref.length, zusatzSc: r1(pool.length * q), scZuWon: r1(scZuWon * 100),
      zusatzDeals: r1(pool.length * q * scZuWon), dealWert, umsatz: Math.round(pool.length * q * scZuWon * dealWert), umsatzKonservativ: Math.round(pool.length * q * scZuWon * dealWert / 2) });
  }
  // Opening: keine Terminfrage (B1-09)
  {
    // Termin nur anbieten, wenn der Entscheider erreicht ist -> Pool nur Openings mit Entscheider.
    const pool = st('Opening', rows).filter(c => c.abschlussfrage_gestellt === 'nein' && c.erfolg === 'nein' && c.entscheider_im_gespraech === 'ja');
    const ref = st('Opening', teamRef).filter(c => c.abschlussfrage_gestellt === 'ja' && c.entscheider_im_gespraech === 'ja');
    const q = rate(ref, c => c.erfolg === 'ja');
    if (pool.length && q != null && dealWert && scZuWon != null && settingZuSc != null) out.push({ key: 'opening_terminfrage', stufe: 'Opening', merkmal: 'abschlussfrage_gestellt',
      titel: 'Im Opening konkret nach dem Termin fragen',
      text: 'Erstgespräche mit Entscheider, in denen nicht konkret nach einem Termin gefragt wurde. Sie endeten ohne Termin.',
      pool: pool.length, vergleichsquote: r1(q * 100), vergleichsBasis: ref.length, zusatzTermine: r1(pool.length * q), settingZuSc: r1(settingZuSc * 100), scZuWon: r1(scZuWon * 100),
      zusatzDeals: r1(pool.length * q * settingZuSc * scZuWon), dealWert, umsatz: Math.round(pool.length * q * settingZuSc * scZuWon * dealWert), umsatzKonservativ: Math.round(pool.length * q * settingZuSc * scZuWon * dealWert / 2) });
  }
  // Closing: Abschluss nicht aktiv versucht (B5-13)
  {
    const pool = st('Closing', rows).filter(c => c.abschluss_aktiv_versucht === 'nein' && c.entscheider_im_gespraech === 'ja' && !gewonnen.has(c.close_opportunity_id));
    const ref = st('Closing', teamRef).filter(c => c.abschluss_aktiv_versucht === 'ja');
    const q = rate(ref, c => c.erfolg === 'ja' || gewonnen.has(c.close_opportunity_id));
    if (pool.length && q != null && dealWert) out.push({ key: 'closing_abschluss_versuchen', stufe: 'Closing', merkmal: 'abschluss_aktiv_versucht',
      titel: 'Im Sales Call aktiv um die Entscheidung bitten',
      text: 'Sales Calls mit Entscheider, in denen der Closer nicht um die Entscheidung gebeten hat. Sie sind bisher nicht gewonnen.',
      pool: pool.length, vergleichsquote: r1(q * 100), vergleichsBasis: ref.length, zusatzDeals: r1(pool.length * q), dealWert, umsatz: Math.round(pool.length * q * dealWert), umsatzKonservativ: Math.round(pool.length * q * dealWert / 2) });
  }
  return out.sort((a, b) => b.umsatz - a.umsatz);
}

/**
 * Settings je Opener, gezaehlt pro gelegtem Setting-Termin (Close, gelegt im Zeitraum), von links nach rechts:
 *   gelegt = stattgefunden + geplatzt + offen
 *     stattgefunden: Ausgang in Close stattgefunden ODER ein aufgenommenes Setting-Gespraech ab dem Legen
 *     geplatzt:      No-Show oder abgesagt laut Close (und keine Aufnahme)
 *     offen:         Ausgang in Close noch nicht gepflegt oder verschoben (und keine Aufnahme)
 *   ausgewertet (<= stattgefunden) = Settings mit aufgenommenem Gespraech -> qualifiziert / nicht qualifiziert.
 * Nicht qualifiziert bekommt GENAU EINEN Hauptgrund in dieser Reihenfolge: Entscheider fehlt, Bedarf fehlt, nicht zeitnah.
 */
async function settingsJeOpener(_rows, zeitraum) {
  const { ladeTeam } = require('./team');
  const team = await ladeTeam();
  const nachEmp = new Map(team.personen.filter(p => p.employeeId).map(p => [Number(p.employeeId), p.vorname]));
  const leer = () => ({ gelegt: 0, stattgefunden: 0, geplatzt: 0, offen: 0, showRate: null,
    ausgewertet: 0, qualifiziert: 0, nichtQualifiziert: 0, entscheiderFehlt: 0, bedarfFehlt: 0, nichtZeitnah: 0 });
  const termine = await db.all(`SELECT close_opportunity_id, employee_id, status, gelegt_am FROM termine
                                 WHERE art='setting' AND gelegt_am >= ${P(1)} AND gelegt_am <= ${P(2)}`, [zeitraum.von, zeitraum.bis]);
  const ids = [...new Set(termine.map(t => t.close_opportunity_id).filter(Boolean))];
  const cods = {};
  for (let i = 0; i < ids.length; i += 500) {
    const tt = ids.slice(i, i + 500);
    const rows = await db.all(`SELECT * FROM call_codings WHERE stufe='Setting' AND konfidenz <> 'niedrig' AND close_opportunity_id IN (${PH(tt.length)})
                                ORDER BY call_datum, id`, tt);
    for (const c of rows) (cods[c.close_opportunity_id] = cods[c.close_opportunity_id] || []).push({ ...c, call_datum: ymd(c.call_datum) });
  }
  const out = {};
  for (const t of termine) {
    const n = nachEmp.get(Number(t.employee_id)) || 'andere';
    const o = (out[n] = out[n] || leer());
    o.gelegt++;
    const c = (cods[t.close_opportunity_id] || []).find(x => x.call_datum >= ymd(t.gelegt_am));
    if (c || t.status === 'stattgefunden') o.stattgefunden++;
    else if (t.status === 'nicht_stattgefunden') o.geplatzt++;
    else o.offen++;
    if (!c) continue;
    o.ausgewertet++;
    if (K.qualSetting(c)) { o.qualifiziert++; continue; }
    o.nichtQualifiziert++;
    if (!K.entscheiderDa(c)) o.entscheiderFehlt++;
    else if (c.bedarf_bestaetigt !== 'ja' || c.bedarf_deckbar === 'nein') o.bedarfFehlt++;
    else o.nichtZeitnah++;
  }
  for (const o of Object.values(out)) o.showRate = pct(o.stattgefunden, o.stattgefunden + o.geplatzt);
  return out;
}

// ── Verpasste Chancen (Vorgabe Deniz 05.11.2026) ─────────────────────────────────────────
// Setting: qualifiziert (Entscheider dabei/zugesagt, Bedarf da und deckbar, zeitnah), trotzdem kein Sales Call und
//   auch spaeter keiner gelegt, keine Absage — und der Grund liegt beim Setter (Termin nicht angeboten, nicht fixiert
//   oder Einwand nicht behandelt -> Wiedervorlage akzeptiert).
// Closing: closebar (Entscheider im Call, Bedarf da und deckbar, zeitnah), nicht gewonnen — und der Grund liegt beim
//   Closer (kein Abschlussversuch, Einwaende nicht behandelt, Folgetermin trotz offener Einwaende, Angebot nur
//   nachgesendet, kein Schritt mit Datum, Bedenkzeit trotz Entscheider).
const SETTER_GRUENDE = new Set(['B2-12', 'B2-13', 'B2-14']);
const CLOSER_GRUENDE = new Set(['B5-02', 'B5-13', 'B5-14', 'B5-15']);
const gruendeVon = (c) => [c.grund1_id, c.grund2_id].filter(Boolean);
const closebar = (c) => c.entscheider_im_gespraech === 'ja' && c.bedarf_bestaetigt === 'ja' && c.bedarf_deckbar !== 'nein' && c.zeitnah !== 'nein';
const setterFehler = (c) => c.closing_aktiv_angeboten === 'nein' || c.termin_verbindlich_fixiert === 'nein' || gruendeVon(c).some(g => SETTER_GRUENDE.has(g));
const closerFehler = (c) => c.abschluss_aktiv_versucht === 'nein' || c.einwaende_behandelt === 'nein' || c.folgetermin_trotz_einwaenden === 'ja'
  || gruendeVon(c).some(g => CLOSER_GRUENDE.has(g));
const linkVon = (c) => (c.quelle === 'fireflies' ? `https://app.fireflies.ai/view/${c.quell_id}` : (c.close_lead_id ? `https://app.close.com/lead/${c.close_lead_id}/` : null));

async function verpassteChancen(rows, gewonnen, { beispiele = 3 } = {}) {
  const { ladeTeam } = require('./team');
  const team = await ladeTeam();
  const vorname = (c) => (team.nachName(c.mitarbeiter) || {}).vorname || c.mitarbeiter;
  const b = rows.filter(c => c.konfidenz !== 'niedrig');
  // Nach dem Setting doch noch ein Sales Call gelegt? Dann nicht verpasst.
  const settings = b.filter(c => c.stufe === 'Setting' && K.qualSetting(c));
  const oppIds = [...new Set([...settings, ...b.filter(c => c.stufe === 'Closing')].map(c => c.close_opportunity_id).filter(Boolean))];
  const scSpaeter = {}, opp = {};
  for (let i = 0; i < oppIds.length; i += 500) {
    const t = oppIds.slice(i, i + 500);
    for (const r of await db.all(`SELECT close_opportunity_id, gelegt_am FROM termine WHERE art='closing' AND close_opportunity_id IN (${PH(t.length)})`, t))
      (scSpaeter[r.close_opportunity_id] = scSpaeter[r.close_opportunity_id] || []).push(ymd(r.gelegt_am));
    for (const o of await db.all(`SELECT id, lead_id, lead_name, value, value_currency FROM close_opportunities WHERE id IN (${PH(t.length)})`, t)) opp[o.id] = o;
  }
  const beispiel = (c, warum) => {
    const o = opp[c.close_opportunity_id] || {};
    return { datum: c.call_datum, mitarbeiter: vorname(c), firma: o.lead_name || '(ohne Opportunity)', wert: o.value != null ? Number(o.value) : null,
      waehrung: o.value_currency || 'EUR', link: linkVon({ ...c, close_lead_id: c.close_lead_id || o.lead_id }), was: c.einzeiler || '', warum };
  };
  const jePerson = (liste, verpasst) => {
    const out = {};
    for (const c of liste) { const n = vorname(c); const x = (out[n] = out[n] || { basis: 0, verpasst: 0 }); x.basis++; }
    for (const c of verpasst) out[vorname(c)].verpasst++;
    for (const x of Object.values(out)) x.quote = pct(x.verpasst, x.basis);
    return out;
  };
  // Je Lead nur ein Beispiel (der juengste Call), dann nach Opportunity-Wert und Datum.
  const sortiere = (a) => {
    const jeLead = new Map();
    for (const x of [...a].sort((p1, p2) => (p2.datum < p1.datum ? -1 : 1))) { const k = x.firma + '|' + x.link; if (!jeLead.has(k)) jeLead.set(k, x); }
    return [...jeLead.values()].sort((x, y) => (y.wert || 0) - (x.wert || 0) || (y.datum < x.datum ? -1 : 1));
  };

  const setVerpasst = settings.filter(c => c.erfolg === 'nein' && !['Absage', 'Nicht durchgeführt'].includes(c.ergebnis) && setterFehler(c)
    && !(scSpaeter[c.close_opportunity_id] || []).some(d => d >= c.call_datum));
  const setGrund = (c) => [c.closing_aktiv_angeboten === 'nein' ? 'Termin nicht angeboten' : null, c.termin_verbindlich_fixiert === 'nein' ? 'nicht fixiert' : null,
    gruendeVon(c).includes('B2-12') ? 'Einwand nicht behandelt' : null].filter(Boolean).join(', ') || 'Wiedervorlage statt Termin';
  const closings = b.filter(c => c.stufe === 'Closing' && closebar(c));
  const clVerpasst = closings.filter(c => c.erfolg !== 'ja' && !gewonnen.has(c.close_opportunity_id) && closerFehler(c));
  const clGrund = (c) => [c.abschluss_aktiv_versucht === 'nein' ? 'kein Abschlussversuch' : null, c.einwaende_behandelt === 'nein' ? 'Einwände nicht behandelt' : null,
    c.folgetermin_trotz_einwaenden === 'ja' ? 'Folgetermin trotz Einwand' : null, gruendeVon(c).includes('B5-14') ? 'Angebot nur nachgesendet' : null,
    gruendeVon(c).includes('B5-15') ? 'kein Schritt mit Datum' : null].filter(Boolean).join(', ') || 'Bedenkzeit akzeptiert';
  return {
    setting: { basis: settings.length, verpasst: setVerpasst.length, quote: pct(setVerpasst.length, settings.length), jePerson: jePerson(settings, setVerpasst),
      beispiele: sortiere(setVerpasst.map(c => beispiel(c, setGrund(c)))).slice(0, beispiele) },
    closing: { basis: closings.length, verpasst: clVerpasst.length, quote: pct(clVerpasst.length, closings.length), jePerson: jePerson(closings, clVerpasst),
      beispiele: sortiere(clVerpasst.map(c => beispiel(c, clGrund(c)))).slice(0, beispiele) },
  };
}

/** Quote SC gelegt -> gewonnen und Setting -> SC aus dem Close-Spiegel (letzte 90 Tage, Termine der acht). */
async function funnelQuoten(stichtag) {
  const von = addTage(stichtag, -90);
  const t = await db.all(`SELECT close_opportunity_id, art, status FROM termine WHERE gelegt_am >= ${P(1)} AND gelegt_am <= ${P(2)}`, [von, stichtag]);
  const settingsStatt = t.filter(x => x.art === 'setting' && x.status === 'stattgefunden');
  const scGelegt = new Set(t.filter(x => x.art === 'closing').map(x => x.close_opportunity_id));
  const settingZuSc = settingsStatt.length ? settingsStatt.filter(x => scGelegt.has(x.close_opportunity_id)).length / settingsStatt.length : null;
  const scStatt = [...new Set(t.filter(x => x.art === 'closing' && x.status === 'stattgefunden').map(x => x.close_opportunity_id))];
  const won = await K.gewonneneOpps(scStatt, stichtag);
  return { settingZuSc, scZuWon: scStatt.length ? won.size / scStatt.length : null, basisSettings: settingsStatt.length, basisSc: scStatt.length };
}

/** Abdeckung: stattgefundene Sales Calls je Closer mit/ohne Aufnahme (Fireflies oder codierter Closing-Call). */
async function abdeckung({ von, bis }) {
  const { ladeTeam } = require('./team');
  const team = await ladeTeam();
  const rows = await db.all(
    `SELECT t.close_opportunity_id, t.close_lead_id, t.ausgang_am, o.closer_user_id FROM termine t JOIN close_opportunities o ON o.id = t.close_opportunity_id
      WHERE t.art='closing' AND t.status='stattgefunden' AND t.ausgang_am >= ${P(1)} AND t.ausgang_am <= ${P(2)}`, [von, bis]);
  const out = {};
  for (const r of rows) {
    const p = team.nachUser.get(r.closer_user_id);
    const name = p ? p.vorname : 'ohne Closer der acht';
    const tag = ymd(r.ausgang_am);
    const ffT = await db.get(`SELECT 1 x FROM ff_meetings WHERE close_lead_id=${P(1)} AND datum >= ${P(2)} AND datum <= ${P(3)} LIMIT 1`, [r.close_lead_id, addTage(tag, -3), addTage(tag, 1)]);
    const cod = ffT ? null : await db.get(`SELECT 1 x FROM call_codings WHERE (close_opportunity_id=${P(1)} OR close_lead_id=${P(2)}) AND stufe='Closing' AND call_datum >= ${P(3)} AND call_datum <= ${P(4)} LIMIT 1`,
      [r.close_opportunity_id, r.close_lead_id, addTage(tag, -3), addTage(tag, 1)]);
    const o = (out[name] = out[name] || { stattgefunden: 0, mitAufnahme: 0, ohneAufnahme: 0 });
    o.stattgefunden++; if (ffT || cod) o.mitAufnahme++; else o.ohneAufnahme++;
  }
  // Close-Aufnahmen ab 60 s je Person im Zeitraum (Telefonate)
  const calls = await db.all(`SELECT user_id, COUNT(*) n, SUM(CASE WHEN hat_aufnahme THEN 1 ELSE 0 END) mit FROM close_calls
                               WHERE datum >= ${P(1)} AND datum <= ${P(2)} AND dauer_sek >= ${P(3)} GROUP BY user_id`, [von, bis, TEAM.regeln.min_dauer_sek]);
  const tel = {};
  for (const c of calls) { const p = team.nachUser.get(c.user_id); if (!p) continue; const t2 = (tel[p.vorname] = tel[p.vorname] || { abSechzig: 0, mitAufnahme: 0 }); t2.abSechzig += Number(c.n); t2.mitAufnahme += Number(c.mit); }
  return { salesCallsJeCloser: out, telefonateJePerson: tel };
}

async function baue({ stichtag, von = null, bis = null, log = () => {} }) {
  const Zr = zeitraeume({ stichtag, von, bis });
  const lade = (z) => K.ladeCodings({ von: z.von, bis: z.bis });
  // Opening ist erst ab dem 31.10. vollstaendig codiert (vorher nur Leads mit spaeterem Termin): Zeitraeume, die frueher
  // beginnen, bekommen keine Opening-Werte und gelten fuer Opening als "nicht vergleichbar".
  const openingOk = (z) => z.von >= OPENING_VOLL_AB;
  const ohneOpening = (rows, z) => (openingOk(z) ? rows : rows.filter(c => c.stufe !== 'Opening'));
  const [cW, cV, cM, cO] = [ohneOpening(await lade(Zr.woche), Zr.woche), ohneOpening(await lade(Zr.vorwoche), Zr.vorwoche),
    ohneOpening(await lade(Zr.monat), Zr.monat), await K.ladeCodings({ ...OKTOBER, basis: 'oktober' })];
  const aW = await K.auswerten(cW, stichtag), aV = await K.auswerten(cV, stichtag), aM = await K.auswerten(cM, stichtag), aO = await K.auswerten(cO, OKTOBER.stichtag);
  const gewonnen = new Set([...aW.gewonnen, ...aM.gewonnen, ...aO.gewonnen]);
  const fq = await funnelQuoten(stichtag);
  const deal = await T.durchschnittDeal(stichtag);
  const teamRef = [...cM, ...cO];

  const { ladeTeam } = require('./team');
  const team = await ladeTeam();
  const personen = [];
  for (const p of team.personen) {
    const meins = (rows) => rows.filter(c => c.mitarbeiter === p.name || c.mitarbeiter === p.vorname);
    const closer = p.funktionen.includes('closer');
    const kW = await T.personKpis(p.employeeId, { ...Zr.woche, stichtag, closer });
    const kM = await T.personKpis(p.employeeId, { ...Zr.monat, stichtag, closer });
    const potW = potenziale(meins(cW), teamRef, { dealWert: deal.wert, scZuWon: fq.scZuWon, settingZuSc: fq.settingZuSc, gewonnen });
    const potM = potenziale(meins(cM), teamRef, { dealWert: deal.wert, scZuWon: fq.scZuWon, settingZuSc: fq.settingZuSc, gewonnen });
    personen.push({ name: p.name, vorname: p.vorname, rolle: p.rolle, funktionen: p.funktionen,
      tracker: { woche: kW, monat: kM },
      woche: auswahl(aW).personen[p.vorname], vorwoche: auswahl(aV).personen[p.vorname], monat: auswahl(aM).personen[p.vorname], oktober: auswahl(aO).personen[p.vorname],
      potenzial: { woche: potW, monat: potM } });
  }
  const tW = await T.teamKpis(team.personen.map(p => p.employeeId), { ...Zr.woche, stichtag });
  const tM = await T.teamKpis(team.personen.map(p => p.employeeId), { ...Zr.monat, stichtag });
  const zielKz = (a) => TEAM.november_ziele.kennzahlen.map(z => {
    const s = a.team.stufen[z.stufe]; const m = s && s.merkmale[z.feld];
    return { ...z, quote: m ? m.quote : null, ja: m ? m.ja : 0, basis: m ? m.basis : 0 };
  });
  const potTeamM = potenziale(cM, teamRef, { dealWert: deal.wert, scZuWon: fq.scZuWon, settingZuSc: fq.settingZuSc, gewonnen });

  // Verbleib: juengster Snapshot (taeglich aktualisiert); falls keiner vom Stichtag existiert, neu berechnen.
  let snap = await V.ladeSnapshot(stichtag);
  if (!snap.zeilen.length) { const r = await V.berechne({ stichtag, log }); snap = { stand: stichtag, zeilen: r.zeilen }; }
  const vW = V.kennzahlen(snap.zeilen, Zr.woche), vM = V.kennzahlen(snap.zeilen, Zr.monat);

  const offenW = await nochOffen(Zr.woche.von, Zr.woche.bis);
  return {
    zeitraeume: Zr, oktober: OKTOBER, deal, funnel: fq,
    openingVergleichbar: { woche: openingOk(Zr.woche), vorwoche: openingOk(Zr.vorwoche), monat: openingOk(Zr.monat), oktober: false },
    team: { woche: auswahl(aW).team, vorwoche: auswahl(aV).team, monat: auswahl(aM).team, oktober: auswahl(aO).team,
      sollIst: { woche: tW, monat: tM },
      settingsJeOpener: { woche: await settingsJeOpener(cW, Zr.woche), monat: await settingsJeOpener(cM, Zr.monat) }, zielKennzahlen: { woche: zielKz(aW), monat: zielKz(aM), oktober: zielKz(aO) }, hebel: potTeamM.slice(0, 3),
      verpasst: { woche: await verpassteChancen(cW, gewonnen), monat: await verpassteChancen(cM, gewonnen, { beispiele: 0 }) } },
    personen,
    verbleib: { stand: snap.stand, woche: vW, monat: vM, zeilen: snap.zeilen },
    codierung: { woche: cW.length, monat: cM.length, nichtCodiertWoche: offenW, nichtVollstaendig: offenW > 0 },
    abdeckung: { woche: await abdeckung(Zr.woche), monat: await abdeckung(Zr.monat) },
    codierungenWoche: cW,
  };
}

module.exports = { baue, zeitraeume, potenziale, OKTOBER, OPENING_VOLL_AB, abdeckungKurz: abdeckung };
