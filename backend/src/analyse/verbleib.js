// Verbleib-Liste: Opportunities der acht mit Setting/Closing, die ohne Ergebnis stehen.
//
// Bedingungen (Vorgabe 04.11.2026):
//  a) kein naechster Schritt: Status QC Follow-Up, SC/ Statt. FU, QC Terminiert oder SC Terminiert seit mehr
//     als 5 Werktagen ohne Statuswechsel und ohne offene datierte Aufgabe in Close
//  b) Closing stattgefunden ohne Ergebnis: Aufnahme vorhanden oder Kalendertermin vergangen, Status weiter SC Terminiert
//  c) Setting stattgefunden ohne Ergebnis: Aufnahme ab 60 s am Termintag, Status weiter QC Terminiert
//  d) Wiedervorlage zu weit weg bei qualifiziertem Lead: Entscheider + Bedarf laut Codierung, naechster Schritt
//     > 14 Tage nach dem Gespraech oder gar nicht datiert, Grund B2-13/B2-14 (Setting) bzw. B5-13/B5-15 (Closing)
//     -> gesondert markiert als "Follow-Up akzeptiert statt Termin".
const { db, TEAM, P, PH, B, NOW, ymd, heute, addTage, werktageZwischen, upsert, istWahr } = require('./basis');
const { ladeTeam } = require('./team');
const { spiegleTasksInkrementell, kalenderTermine } = require('./closeSpiegel');
const Z = require('./zeitlinie');
const { grundName } = require('./kennzahlen');
const { S } = Z;

const OFFEN_A = new Set([S.QC_FOLLOWUP, S.SC_STATT_FU, S.QC_TERMINIERT, S.SC_TERMINIERT]);
const OFFEN_D = new Set([S.QC_FOLLOWUP, S.SC_STATT_FU, S.QC_SC_AUSSTEH, S.QC_TERMINIERT, S.SC_TERMINIERT, S.QC_VERSCHOBEN,
  S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_FOLLOWUP, S.ALT_HIGHPOT, S.ALT_CC2, S.ALT_SOFTCLOSE]);
const STUFE_VON = (sid) => ([S.SC_TERMINIERT, S.SC_STATT_FU].includes(sid) ? 'Closing' : 'Setting');
const D_GRUENDE = { Setting: ['B2-13', 'B2-14'], Closing: ['B5-13', 'B5-15'] };
const closeLink = (leadId) => `https://app.close.com/lead/${leadId}/`;

/**
 * Berechnet die Liste zum Stichtag und schreibt sie als Snapshot. Rueckgabe: { zeilen, kennzahlen }.
 * Liest Close nur (Aufgaben, Kalendertermine) und nutzt Spiegel + call_codings.
 */
async function berechne({ stichtag = heute(), speichern = true, log = () => {} } = {}) {
  const team = await ladeTeam();
  const acht = new Set(team.personen.flatMap(p => p.closeUserIds));
  const personVonUser = (uid) => (uid ? team.nachUser.get(uid) || null : null);
  const nameVonUser = (uid) => { const p = personVonUser(uid); return p ? p.vorname : (uid ? team.userName[uid] || '' : ''); };

  // Kandidaten: Opportunities mit Setting/Closing-Termin, an denen einer der acht beteiligt ist, Status offen
  const opps = await db.all(
    `SELECT DISTINCT o.* FROM close_opportunities o JOIN termine t ON t.close_opportunity_id = o.id
      WHERE o.status_id IN (${PH(OFFEN_D.size)})`, [...OFFEN_D]);
  const kand = opps.filter(o => [o.user_id, o.setter_user_id, o.closer_user_id].some(u => acht.has(u)));
  const leadIds = [...new Set(kand.map(o => o.lead_id).filter(Boolean))];
  log(`  Verbleib: ${kand.length} offene Opportunities der acht mit Termin (${leadIds.length} Leads)`);

  await spiegleTasksInkrementell({ log });
  const zl = await Z.ladeOpps({ leadIds });
  const scLeads = kand.filter(o => o.status_id === S.SC_TERMINIERT || o.status_id === S.QC_TERMINIERT).map(o => o.lead_id);
  const kalender = await kalenderTermine(scLeads);

  const tasks = leadIds.length ? await db.all(`SELECT * FROM close_tasks WHERE lead_id IN (${PH(leadIds.length)})`, leadIds) : [];
  const tasksJe = {};
  for (const t of tasks) (tasksJe[t.lead_id] = tasksJe[t.lead_id] || []).push({ ...t, faellig_datum: ymd(t.faellig_datum), erledigt: istWahr(t.erledigt) });
  const calls = leadIds.length ? await db.all(`SELECT lead_id, datum, dauer_sek, beginn, hat_aufnahme FROM close_calls WHERE lead_id IN (${PH(leadIds.length)}) AND dauer_sek >= ${P(leadIds.length + 1)}`,
    [...leadIds, TEAM.regeln.min_dauer_sek]) : [];
  const callsJe = {};
  for (const c of calls) (callsJe[c.lead_id] = callsJe[c.lead_id] || []).push({ ...c, datum: ymd(c.datum) });
  const ffm = leadIds.length ? await db.all(`SELECT close_lead_id, datum FROM ff_meetings WHERE close_lead_id IN (${PH(leadIds.length)}) AND zuordnung IN ('sicher','wahrscheinlich')`, leadIds) : [];
  const ffJe = {};
  for (const m of ffm) (ffJe[m.close_lead_id] = ffJe[m.close_lead_id] || []).push(ymd(m.datum));
  const cods = leadIds.length ? await db.all(
    `SELECT * FROM call_codings WHERE (close_lead_id IN (${PH(leadIds.length)}) OR close_opportunity_id IN (${PH(kand.length, leadIds.length + 1)}))
       AND stufe IN ('Setting','Closing','Nachfassung') ORDER BY call_datum, id`, [...leadIds, ...kand.map(o => o.id)]) : [];
  const codJe = {};
  for (const c of cods) {
    const k = c.close_opportunity_id || c.close_lead_id;
    (codJe[k] = codJe[k] || []).push({ ...c, call_datum: ymd(c.call_datum), naechster_schritt_datum: ymd(c.naechster_schritt_datum) });
    if (c.close_lead_id && c.close_lead_id !== k) (codJe[c.close_lead_id] = codJe[c.close_lead_id] || []).push({ ...c, call_datum: ymd(c.call_datum), naechster_schritt_datum: ymd(c.naechster_schritt_datum) });
  }

  const zeilen = [];
  for (const o of kand) {
    const rec = zl.nachId[o.id];
    if (!rec) continue;
    const letzterWechsel = rec.hist.length ? rec.hist[rec.hist.length - 1] : null;
    const statusSeit = ymd(letzterWechsel ? letzterWechsel.date_created : o.date_created);
    const tage = werktageZwischen(statusSeit, stichtag);
    const stufe = STUFE_VON(o.status_id);
    const termine = rec.termine.filter(t => t.art === (stufe === 'Closing' ? 'closing' : 'setting'));
    const letzterTermin = termine[termine.length - 1] || null;
    const lt = tasksJe[o.lead_id] || [];
    const offeneDatiert = lt.filter(t => !t.erledigt && t.faellig_datum).sort((a, b) => (a.faellig_datum < b.faellig_datum ? -1 : 1));
    const naechsteAufgabe = offeneDatiert.find(t => t.faellig_datum >= stichtag) || offeneDatiert[offeneDatiert.length - 1] || null;
    const aufgabeTag = (re) => lt.filter(t => re.test(t.text || '') && t.faellig_datum && (!letzterTermin || t.faellig_datum >= letzterTermin.am))
      .map(t => t.faellig_datum).sort()[0] || null;
    const kal = (kalender[o.lead_id] || []).filter(m => !letzterTermin || m.datum >= letzterTermin.am).map(m => m.datum).sort();
    const cs = (codJe[o.id] || codJe[o.lead_id] || []);
    const letzteCod = cs.filter(c => c.stufe === stufe || (stufe === 'Setting' && c.stufe === 'Nachfassung')).slice(-1)[0]
      || cs.slice(-1)[0] || null;

    // Follow-Up-Status: der Termin hat am Tag des Ausgangs stattgefunden.
    let terminDatum = letzterTermin ? (letzterTermin.ausgang === 'stattgefunden' && letzterTermin.ausgangAm ? letzterTermin.ausgangAm : letzterTermin.am) : null;
    const treffer = [];
    // b) Closing stattgefunden ohne Ergebnis
    if (o.status_id === S.SC_TERMINIERT) {
      const scTag = aufgabeTag(/^\s*sc\b/i) || kal[0] || null;
      const aufnahme = (ffJe[o.lead_id] || []).some(d => !letzterTermin || d >= letzterTermin.am)
        || cs.some(c => c.stufe === 'Closing' && (!letzterTermin || c.call_datum >= letzterTermin.am));
      terminDatum = scTag || (letzterTermin ? letzterTermin.am : null);
      if (aufnahme || (scTag && scTag < stichtag)) treffer.push('b');
    }
    // c) Setting stattgefunden ohne Ergebnis: Aufnahme ab 60 s am Termintag
    if (o.status_id === S.QC_TERMINIERT) {
      const qcTag = aufgabeTag(/^\s*qc\b/i) || kal[0] || null;
      terminDatum = qcTag || (letzterTermin ? letzterTermin.am : null);
      const gelegtTs = letzterTermin ? (letzterTermin.herkunft === 'Anlage' ? Z.zeit(o.date_created) : Z.zeit(rec.hist[letzterTermin.idx].date_created)) : 0;
      const am = (callsJe[o.lead_id] || []).filter(c => (qcTag ? (c.datum === qcTag || c.datum === addTage(qcTag, 1)) : Z.zeit(c.beginn) > gelegtTs) && c.datum <= stichtag);
      if (am.length && (!qcTag || qcTag <= stichtag)) { treffer.push('c'); terminDatum = qcTag || am[0].datum; }
    }
    // a) kein naechster Schritt
    if (OFFEN_A.has(o.status_id) && tage > TEAM.regeln.kein_schritt_werktage && !offeneDatiert.length) treffer.push('a');
    // d) Follow-Up akzeptiert statt Termin
    let dCod = null, dGrund = null;
    for (const c of [...cs].reverse()) {
      if (!['Setting', 'Closing'].includes(c.stufe) || c.konfidenz === 'niedrig') continue;
      // Nach dem Gespraech wurde doch ein Termin gelegt -> kein "Follow-Up statt Termin" mehr.
      if (rec.termine.some(t => t.am > c.call_datum)) break;
      if (c.entscheider_im_gespraech !== 'ja' || c.bedarf_bestaetigt !== 'ja') break;
      const weit = c.naechster_schritt_mit_datum === 'nein' || !c.naechster_schritt_datum
        || (c.naechster_schritt_datum && c.naechster_schritt_datum > addTage(c.call_datum, TEAM.regeln.wiedervorlage_max_tage));
      const g = [c.grund1_id, c.grund2_id].filter(Boolean).find(x => D_GRUENDE[c.stufe].includes(x));
      if (weit && g) { dCod = c; dGrund = g; }
      break;            // nur das juengste qualifizierte Setting/Closing zaehlt
    }
    if (dCod) treffer.push('d');
    if (!treffer.length) continue;

    const opener = personVonUser(o.user_id), setter = personVonUser(o.setter_user_id), closer = personVonUser(o.closer_user_id);
    const gCod = dCod || letzteCod;
    const grundId = dGrund || (gCod ? (gCod.grund1_id || gCod.grund2_id || null) : null);
    const basisZeile = {
      stand_datum: stichtag, close_opportunity_id: o.id, close_lead_id: o.lead_id, firma: o.lead_name || null, stufe,
      termin_datum: terminDatum || (letzterTermin ? letzterTermin.am : null),
      opener_id: opener ? opener.employeeId : null, setter_id: setter ? setter.employeeId : null, closer_id: closer ? closer.employeeId : null,
      opener: nameVonUser(o.user_id), setter: nameVonUser(o.setter_user_id), closer: nameVonUser(o.closer_user_id),
      status_id: o.status_id, status_label: o.status_label, status_seit: statusSeit, tage_im_status: tage,
      follow_up_statt_termin: !!dCod,
      naechster_schritt_close: naechsteAufgabe ? (naechsteAufgabe.text || '').slice(0, 120) + (naechsteAufgabe.faellig_datum < stichtag ? ' (überfällig)' : '') : null,
      naechster_schritt_close_datum: naechsteAufgabe ? naechsteAufgabe.faellig_datum : null,
      naechster_schritt_transkript: gCod ? (gCod.naechster_schritt_text || (gCod.naechster_schritt_mit_datum === 'nein' ? 'kein datierter Schritt' : null)) : null,
      naechster_schritt_transkript_datum: gCod ? gCod.naechster_schritt_datum : null,
      grund_id: grundId, grund: grundId ? grundName(grundId) : null,
      opportunity_wert: o.value != null ? Number(o.value) : null, waehrung: o.value_currency || null, close_link: closeLink(o.lead_id),
      // nur fuer Kennzahlen, nicht gespeichert:
      _setterName: setter ? setter.vorname : null, _closerName: closer ? closer.vorname : null,
    };
    for (const b of treffer) zeilen.push({ ...basisZeile, bedingung: b });
  }

  if (speichern) {
    const wochenstand = new Date(stichtag + 'T12:00:00Z').getUTCDay() === 5;
    await db.run(`DELETE FROM verbleib_snapshot WHERE stand_datum=${P(1)}`, [stichtag]);
    const cols = ['stand_datum', 'ist_wochenstand', 'close_opportunity_id', 'close_lead_id', 'firma', 'stufe', 'termin_datum', 'opener_id', 'setter_id', 'closer_id',
      'opener', 'setter', 'closer', 'status_id', 'status_label', 'status_seit', 'tage_im_status', 'bedingung', 'follow_up_statt_termin',
      'naechster_schritt_close', 'naechster_schritt_close_datum', 'naechster_schritt_transkript', 'naechster_schritt_transkript_datum',
      'grund_id', 'grund', 'opportunity_wert', 'waehrung', 'close_link'];
    for (const z of zeilen) {
      const v = { ...z, ist_wochenstand: B(wochenstand), follow_up_statt_termin: B(z.follow_up_statt_termin) };
      await upsert('verbleib_snapshot', cols, cols.map(c => v[c] ?? null), ['stand_datum', 'close_opportunity_id', 'bedingung']);
    }
  }
  log(`  Verbleib: ${zeilen.length} Zeilen (${new Set(zeilen.map(z => z.close_opportunity_id)).size} Opportunities), Bedingungen ${JSON.stringify(zeilen.reduce((m, z) => (m[z.bedingung] = (m[z.bedingung] || 0) + 1, m), {}))}`);
  return { zeilen, stichtag };
}

/** Eine Zeile je Opportunity (Bedingungen zusammengefasst) — fuer Ansicht und Excel. */
function jeOpportunity(zeilen) {
  const m = new Map();
  for (const z of zeilen) {
    const k = z.close_opportunity_id;
    if (!m.has(k)) m.set(k, { ...z, bedingungen: [z.bedingung] });
    else { const x = m.get(k); if (!x.bedingungen.includes(z.bedingung)) x.bedingungen.push(z.bedingung); x.follow_up_statt_termin = x.follow_up_statt_termin || z.follow_up_statt_termin; }
  }
  return [...m.values()].map(x => ({ ...x, bedingungen: x.bedingungen.sort().join(', ') }))
    .sort((a, b) => (b.follow_up_statt_termin - a.follow_up_statt_termin) || ((b.opportunity_wert || 0) - (a.opportunity_wert || 0)));
}

/**
 * Kennzahlen je Zeitraum: gefuehrte Settings/Closings ohne Ergebnis (Termin im Zeitraum, Opportunity in der Liste),
 * Summe Opportunity-Wert in Follow-Ups, Anteil "Follow-Up akzeptiert statt Termin", je Setter und Closer.
 */
function kennzahlen(zeilen, { von, bis }) {
  const ops = jeOpportunity(zeilen);
  const imZeitraum = ops.filter(z => z.termin_datum && z.termin_datum >= von && z.termin_datum <= bis);
  const gefuehrt = (z) => /[bc]/.test(z.bedingungen) || [S.QC_FOLLOWUP, S.SC_STATT_FU].includes(z.status_id);
  const fu = ops.filter(z => [S.QC_FOLLOWUP, S.SC_STATT_FU].includes(z.status_id));
  const fuZeitraum = fu.filter(z => z.termin_datum && z.termin_datum >= von && z.termin_datum <= bis);
  const summe = (a) => Math.round(a.reduce((s, z) => s + (Number(z.opportunity_wert) || 0), 0));
  const block = (liste) => ({
    settingsOhneErgebnis: liste.filter(z => z.stufe === 'Setting' && gefuehrt(z)).length,
    closingsOhneErgebnis: liste.filter(z => z.stufe === 'Closing' && gefuehrt(z)).length,
  });
  const je = (feld) => {
    const out = {};
    for (const z of imZeitraum) {
      const n = z[feld]; if (!n) continue;
      const o = (out[n] = out[n] || { settingsOhneErgebnis: 0, closingsOhneErgebnis: 0, fuWert: 0, fuAnzahl: 0, fuStattTermin: 0 });
      if (gefuehrt(z)) o[z.stufe === 'Setting' ? 'settingsOhneErgebnis' : 'closingsOhneErgebnis']++;
      if ([S.QC_FOLLOWUP, S.SC_STATT_FU].includes(z.status_id)) { o.fuAnzahl++; o.fuWert += Number(z.opportunity_wert) || 0; if (z.follow_up_statt_termin) o.fuStattTermin++; }
    }
    for (const o of Object.values(out)) o.fuWert = Math.round(o.fuWert);
    return out;
  };
  return {
    zeitraum: { von, bis },
    ...block(imZeitraum),
    fuAnzahl: fuZeitraum.length, fuWert: summe(fuZeitraum),
    fuStattTermin: fuZeitraum.filter(z => z.follow_up_statt_termin).length,
    fuStattTerminAnteil: fuZeitraum.length ? Math.round(1000 * fuZeitraum.filter(z => z.follow_up_statt_termin).length / fuZeitraum.length) / 10 : null,
    jeSetter: je('_setterName'), jeCloser: je('_closerName'),
    gesamtListe: { opportunities: ops.length, wert: summe(ops), followUpStattTermin: ops.filter(z => z.follow_up_statt_termin).length,
      jeBedingung: zeilen.reduce((m, z) => (m[z.bedingung] = (m[z.bedingung] || 0) + 1, m), {}) },
  };
}

/** Gespeicherten Snapshot laden (Dashboard). Ohne Datum: juengster Stand. */
async function ladeSnapshot(stand = null) {
  const s = stand || (await db.get(`SELECT MAX(stand_datum) m FROM verbleib_snapshot`))?.m;
  if (!s) return { stand: null, zeilen: [] };
  const zeilen = (await db.all(`SELECT * FROM verbleib_snapshot WHERE stand_datum=${P(1)}`, [ymd(s)]))
    .map(z => ({ ...z, termin_datum: ymd(z.termin_datum), status_seit: ymd(z.status_seit), naechster_schritt_close_datum: ymd(z.naechster_schritt_close_datum),
      naechster_schritt_transkript_datum: ymd(z.naechster_schritt_transkript_datum), follow_up_statt_termin: istWahr(z.follow_up_statt_termin),
      opportunity_wert: z.opportunity_wert != null ? Number(z.opportunity_wert) : null, _setterName: z.setter, _closerName: z.closer }));
  return { stand: ymd(s), zeilen };
}

module.exports = { berechne, jeOpportunity, kennzahlen, ladeSnapshot };
