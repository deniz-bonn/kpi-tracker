// Termin-Zeitlinie je Opportunity und Stufe eines Calls laut Zeitlinie.
// Portiert aus backend/analyse/oktober-2026/kotaman/engine.js und transkript/stages.js,
// arbeitet aber auf dem Close-Spiegel der Datenbank (close_opportunities + close_status_events)
// statt auf einem Komplettabzug.
const { S } = require('../utils/closeSync');
const { db, PH, ymd } = require('./basis');

const GELEGT = { [S.QC_TERMINIERT]: 'setting', [S.SC_TERMINIERT]: 'closing' };
const NEG = { setting: new Set([S.QC_ABGESAGT, S.QC_NOSHOW]), closing: new Set([S.SC_ABGESAGT, S.SC_NOSHOW, S.ALT_CLOSING_NOSHOW]) };
const POS = {
  setting: new Set([S.QC_FOLLOWUP, S.QC_SC_AUSSTEH, S.SC_TERMINIERT, S.SC_STATT_FU, S.SC_STATT_KEINA, S.SC_ABGESAGT, S.SC_NOSHOW, S.WON,
    S.ALT_CLOSING_NOSHOW, S.ALT_HIGHPOT, S.ALT_CC2, S.ALT_SOFTCLOSE, S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_FOLLOWUP, S.ALT_UNQUAL]),
  closing: new Set([S.SC_STATT_FU, S.SC_STATT_KEINA, S.WON, S.ALT_HIGHPOT, S.ALT_CC2, S.ALT_SOFTCLOSE, S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_UNQUAL]),
};
const UNKLAR = new Set([S.LOST, S.BLACKLIST]);
const LAB = Object.fromEntries(Object.entries(S).map(([k, v]) => [v, k]));

function ausgangVon(art, rest) {
  let v = null;
  for (const e of rest) {
    if (e.new_status_id === S.QC_VERSCHOBEN) { v = e; continue; }
    if (v && GELEGT[e.new_status_id] === art) return { status: 'verschoben', e: v };
    if (NEG[art].has(e.new_status_id)) return { status: 'nicht stattgefunden', e };
    if (POS[art].has(e.new_status_id)) return { status: 'stattgefunden', e };
    if (UNKLAR.has(e.new_status_id)) return { status: 'unklar', e };
  }
  return v ? { status: 'verschoben', e: v } : { status: 'offen', e: null };
}

const zeit = (v) => (v instanceof Date ? v.getTime() : Date.parse(String(v).includes('T') || String(v).includes('+') ? v : String(v).replace(' ', 'T') + 'Z'));

/**
 * Laedt Opportunities samt Historie und abgeleiteten Terminen fuer die angegebenen Leads
 * (oder alle Opportunities mit Aktivitaet ab `seit`). Rueckgabe: { opps: [rec], nachLead: {leadId: [rec]} }
 * rec = { o, hist, termine: [{ art, am, von, ausgang, ausgangEv, ausgangAm, rest, idx, herkunft }] }
 */
async function ladeOpps({ leadIds = null, seit = null } = {}) {
  let opps;
  if (leadIds) {
    const ids = [...new Set(leadIds.filter(Boolean))];
    if (!ids.length) return { opps: [], nachLead: {}, nachId: {} };
    opps = [];
    for (let i = 0; i < ids.length; i += 500) {
      const t = ids.slice(i, i + 500);
      opps.push(...await db.all(`SELECT * FROM close_opportunities WHERE lead_id IN (${PH(t.length)})`, t));
    }
  } else {
    opps = await db.all(`SELECT * FROM close_opportunities WHERE date_updated >= ${db.dialect === 'postgres' ? '$1' : '?'}`, [seit]);
  }
  const oppIds = opps.map(o => o.id);
  const evs = [];
  for (let i = 0; i < oppIds.length; i += 500) {
    const t = oppIds.slice(i, i + 500);
    evs.push(...await db.all(
      `SELECT id, opportunity_id, lead_id, old_status_id, new_status_id, new_status_label, close_user_id, close_user_name, date_created
         FROM close_status_events WHERE typ='opportunity' AND opportunity_id IN (${PH(t.length)})`, t));
  }
  const evNachOpp = {};
  for (const e of evs) (evNachOpp[e.opportunity_id] = evNachOpp[e.opportunity_id] || []).push(e);
  const recs = [];
  for (const o of opps) {
    const hist = (evNachOpp[o.id] || []).sort((a, b) => zeit(a.date_created) - zeit(b.date_created) || (a.id < b.id ? -1 : 1));
    const initial = hist.length ? hist[0].old_status_id : o.status_id;
    const rec = { o, hist, termine: [] };
    const mk = (art, am, von, rest, idx, herkunft) => {
      const a = ausgangVon(art, rest);
      rec.termine.push({ art, am, von, ausgang: a.status, ausgangEv: a.e, ausgangAm: a.e ? ymd(a.e.date_created) : null,
        ausgangVon: a.e ? a.e.close_user_id : null, rest, idx, herkunft });
    };
    if (GELEGT[initial]) mk(GELEGT[initial], ymd(o.date_created), o.user_id || o.created_by, hist, -1, 'Anlage');
    hist.forEach((e, i) => { if (GELEGT[e.new_status_id]) mk(GELEGT[e.new_status_id], ymd(e.date_created), e.close_user_id, hist.slice(i + 1), i, 'Statuswechsel'); });
    recs.push(rec);
  }
  const nachLead = {}, nachId = {};
  for (const r of recs) { (nachLead[r.o.lead_id] = nachLead[r.o.lead_id] || []).push(r); nachId[r.o.id] = r; }
  for (const l of Object.values(nachLead)) l.sort((a, b) => zeit(a.o.date_created) - zeit(b.o.date_created));
  return { opps: recs, nachLead, nachId };
}

const gewonnen = (rec) => rec && (rec.o.status_id === S.WON || rec.hist.some(e => e.new_status_id === S.WON));

/** Opportunity eines Leads, die zum Zeitpunkt t (ms) galt: die juengste davor angelegte, sonst die erste. */
function oppZumZeitpunkt(recs, t) {
  if (!recs || !recs.length) return null;
  return [...recs].reverse().find(r => zeit(r.o.date_created) <= t) || recs[0];
}

// ── Stufe laut Zeitlinie (stages.js) ─────────────────────────────────────────────────────
const QC_OUT = new Set([S.QC_FOLLOWUP, S.QC_NOSHOW, S.QC_ABGESAGT, S.QC_VERSCHOBEN, S.QC_SC_AUSSTEH, S.SC_TERMINIERT]);
const SC_OUT = new Set([S.SC_STATT_FU, S.SC_STATT_KEINA, S.WON, S.LOST, S.SC_ABGESAGT, S.SC_NOSHOW, S.ALT_CLOSING_NOSHOW, S.ALT_HIGHPOT,
  S.ALT_CC2, S.ALT_SOFTCLOSE, S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_UNQUAL]);
const FU = new Set([S.QC_FOLLOWUP, S.SC_STATT_FU, S.QC_SC_AUSSTEH, S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_FOLLOWUP]);
const GRACE = 25 * 60 * 1000;

function leadZeitleiste(recs) {
  const arr = [];
  for (const rec of recs || []) {
    const initial = rec.hist.length ? rec.hist[0].old_status_id : rec.o.status_id;
    arr.push({ t: zeit(rec.o.date_created), to: initial, opp: rec.o.id, anlage: true });
    for (const e of rec.hist) arr.push({ t: zeit(e.date_created), to: e.new_status_id, opp: rec.o.id });
  }
  return arr.sort((a, b) => a.t - b.t);
}

/** [Stufe, Begruendung] fuer einen Call (beginn: Zeitstempel, dauerSek) auf einem Lead. */
function stufeLautZeitlinie(recs, beginn, dauerSek) {
  const T = zeit(beginn), end = T + (dauerSek || 0) * 1000;
  const ev = leadZeitleiste(recs);
  const zustand = [...ev].reverse().find(e => e.t <= T);
  const ausloeser = ev.find(e => e.t > T && e.t <= end + GRACE && !e.anlage);
  const anlageNah = ev.find(e => e.anlage && e.t >= T - 5 * 60 * 1000 && e.t <= end + GRACE);
  const trig = ausloeser || anlageNah;
  if (trig) {
    if (trig.to === S.QC_TERMINIERT) return ['Opening', 'loest QC Terminiert aus'];
    if (trig.to === S.SC_TERMINIERT && (!zustand || zustand.to !== S.QC_TERMINIERT)) return ['Opening', 'direkter SC (ohne vorheriges QC)'];
    if (QC_OUT.has(trig.to) && zustand && [S.QC_TERMINIERT, S.QC_FOLLOWUP, S.QC_VERSCHOBEN].includes(zustand.to)) return ['Setting', 'Ausgang ' + LAB[trig.to]];
    if (SC_OUT.has(trig.to)) return ['Closing', 'Ausgang ' + LAB[trig.to]];
    if (trig.to === S.LOST || trig.to === S.BLACKLIST) return ['Sonstiges', 'Lost/Blacklist'];
  }
  if (!zustand) return ['Opening', 'vor erstem Termin'];
  const z = zustand.to;
  if (z === S.QC_TERMINIERT) return ['Sonstiges', 'zwischen QC Terminiert und Ausgang (Bestaetigung/Vorbereitung?)'];
  if (z === S.SC_TERMINIERT) return ['Sonstiges', 'zwischen SC Terminiert und Ausgang (Bestaetigung/Vorbereitung?)'];
  if (FU.has(z)) return ['Nachfassung', 'nach ' + LAB[z]];
  if ([S.QC_NOSHOW, S.QC_ABGESAGT, S.SC_NOSHOW, S.SC_ABGESAGT].includes(z)) return ['Nachfassung', 'nach ' + LAB[z] + ' (Reterminierung)'];
  return ['Sonstiges', 'Status ' + (LAB[z] || 'anderer')];
}

/** Kontextsatz fuer den Codier-Prompt (wie kontext() in code_lib.js). */
function kontextSatz({ stufeH, warum, richtung, rec }) {
  const st = rec ? rec.termine.filter(t => t.art === 'setting') : [];
  const sc = rec ? rec.termine.filter(t => t.art === 'closing') : [];
  const lastSt = st[st.length - 1], lastSc = sc[sc.length - 1];
  const ausg = (t) => (t ? t.ausgang + (t.ausgangEv ? ' (' + (t.ausgangEv.new_status_label || '') + ')' : '') : '-');
  const b4 = lastSt && lastSc && lastSc.ausgang === 'nicht stattgefunden'
    ? ' Der auf das Setting folgende Sales Call ist GEPLATZT (No-Show/abgesagt) — falls dies ein Setting-Gespraech ist, pruefe die Warnsignale B4.' : '';
  return `Stufe laut Zeitlinie: ${stufeH} (${warum}). Richtung: ${richtung === 'inbound' ? 'eingehend' : 'ausgehend'}. Status der Opportunity heute: ${rec ? rec.o.status_label : '?'}. Setting-Ausgang: ${ausg(lastSt)}; Sales-Call-Ausgang: ${ausg(lastSc)}; gewonnen: ${gewonnen(rec) ? 'ja' : 'nein'}.${b4}`;
}

module.exports = { ladeOpps, stufeLautZeitlinie, oppZumZeitpunkt, kontextSatz, gewonnen, ausgangVon, zeit, S, LAB, GELEGT };
