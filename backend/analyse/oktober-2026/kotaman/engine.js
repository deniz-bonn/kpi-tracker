// Gemeinsame Ableitung (Regeln wie utils/closeSync.js) auf der vollen Lead-Historie.
const { users } = require('./raw.json');
const { out, geholt } = require('./leads.json');
const S = {
  QC_TERMINIERT:'stat_cYlePQlUq6XJptmG3z8xL1sNEbNW9EyA4kY9GsLVbbl', QC_FOLLOWUP:'stat_MyJ8Ynlb4PomnOSBaEqCiE2C0SKqJDK6jQhkTpbcDvs',
  SC_TERMINIERT:'stat_LSBKj1hMfk8GZ2aQSBky9DN9Al3ka34nTlwU593Yjtc', QC_SC_AUSSTEH:'stat_2MRRrC6kCkqIbsBWhbjLrmxwYbkWTNMsBlD4bG2mje2',
  QC_ABGESAGT:'stat_gcSOz9BCxExghxbLTBKddlE1zIzxIm3VffdzMIFvyzF', QC_NOSHOW:'stat_WvaplVFvURd2dodrvGDyCCcK7KQm8ejbz3FbCl7AE2P',
  QC_VERSCHOBEN:'stat_SWO5jUdXrjy6SODw2Mh6I75hFKhgf4VeksJizpK66xo', SC_STATT_FU:'stat_Db2TQE72ssnCMQjTRWNgqvWhlJeII1OGvFcVNO7v4mo',
  SC_STATT_KEINA:'stat_tFfUQm9SqBlhsDUKXgZh8uF4f0nD011sBrlllLSFih6', SC_ABGESAGT:'stat_NsGWOzt6zmoYnn0qoY6EnsFU2PdOcRjjfMf1UNcx6hK',
  SC_NOSHOW:'stat_xQx98coO1LRHvv2zuPNk80ucRD9MBxMsXltUCFxq9pz', WON:'stat_QlI71Ac72FHKEIim2ZakEkdn4hRm1ouPNtlZCjE02kO',
  LOST:'stat_LtXdeBi13jQKLzSqCpaUaKA5ACWNYj7AT2aKPuNnziP', BLACKLIST:'stat_BYmqz7dEWULTFVLmycFDlNst38TyCXkYmkpsTs46bx8',
  ALT_CLOSING_NOSHOW:'stat_D0adTVACBCCJeadQxSszDuHr4sItzpNtnUVV9B7Ieat', ALT_HIGHPOT:'stat_GSwscC9bevmcBcSjyBJ5ARxSUs5s5QiYLQZXsYVlZyw',
  ALT_CC2:'stat_L6trSYPIfU7exj2fiMohWXHEcevoWW9abeMXkADnZ8W', ALT_SOFTCLOSE:'stat_5DkKmUIYtFQywWmviWREi8m5CHkRXFN9n1Y3tg7gybC',
  ALT_FU_KURZ:'stat_QRgXnhI0dHCPo9ZE1oCYhLIJhvxgkinAqTV8TbDkjxl', ALT_FU_LANG:'stat_dglO5Vv2dr0AviE3w1GCj4bx62Gk4BQVZ6t6tJuKsrb',
  ALT_FOLLOWUP:'stat_7ThvPTpIGfBdZc4AmRqWKV9vqnf6xRMO3MZNOzBHx2J', ALT_UNQUAL:'stat_Hha8EV0m7dKMCYTt7Zlxu6eyHUE0gxjMUYiJ0Gqe1Ku',
};
const GELEGT = { [S.QC_TERMINIERT]: 'setting', [S.SC_TERMINIERT]: 'closing' };
const NEG = { setting: new Set([S.QC_ABGESAGT, S.QC_NOSHOW]), closing: new Set([S.SC_ABGESAGT, S.SC_NOSHOW, S.ALT_CLOSING_NOSHOW]) };
const POS = { setting: new Set([S.QC_FOLLOWUP, S.QC_SC_AUSSTEH, S.SC_TERMINIERT, S.SC_STATT_FU, S.SC_STATT_KEINA, S.SC_ABGESAGT, S.SC_NOSHOW, S.WON, S.ALT_CLOSING_NOSHOW, S.ALT_HIGHPOT, S.ALT_CC2, S.ALT_SOFTCLOSE, S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_FOLLOWUP, S.ALT_UNQUAL]),
  closing: new Set([S.SC_STATT_FU, S.SC_STATT_KEINA, S.WON, S.ALT_HIGHPOT, S.ALT_CC2, S.ALT_SOFTCLOSE, S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_UNQUAL]) };
const UNKLAR = new Set([S.LOST, S.BLACKLIST]);
const LABEL = { stattgefunden: 'stattgefunden', nicht_stattgefunden: 'nicht stattgefunden', verschoben: 'verschoben', unklar: 'unklar', offen: 'offen' };
const ausgangVon = (art, rest) => { let v = null;
  for (const e of rest) { if (e.new_status_id === S.QC_VERSCHOBEN) { v = e; continue; }
    if (v && GELEGT[e.new_status_id] === art) return { status: 'verschoben', e: v };
    if (NEG[art].has(e.new_status_id)) return { status: 'nicht stattgefunden', e };
    if (POS[art].has(e.new_status_id)) return { status: 'stattgefunden', e };
    if (UNKLAR.has(e.new_status_id)) return { status: 'unklar', e }; }
  return v ? { status: 'verschoben', e: v } : { status: 'offen', e: null }; };
const BER = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });
const ymd = v => v ? BER.format(new Date(v)) : '';
const HEUTE = ymd(geholt);
const AB = '2026-06-01';
const un = Object.fromEntries(users.map(u => [u.id, u.name || u.email]));
const CF_SETTER = 'custom.cf_vfla9UhCxsjL5LQO4BAdqTN86LKBHqBaAKxXmmG4qVp', CF_CLOSER = 'custom.cf_QiksFSC1OxIQUYhxfHNnKipDAS8XU46KRzuPiwfzZyF';
// Arbeitstage (Mo–Fr) nach `von` bis einschliesslich `bis`. Im Zeitraum faellt kein NRW-Feiertag auf einen Werktag.
function arbeitstage(von, bis) { let n = 0; const d = new Date(von + 'T12:00:00Z'), e = new Date(bis + 'T12:00:00Z');
  for (d.setUTCDate(d.getUTCDate() + 1); d <= e; d.setUTCDate(d.getUTCDate() + 1)) { const w = d.getUTCDay(); if (w && w !== 6) n++; } return n; }
const kalendertage = (von, bis) => Math.round((new Date(bis + 'T12:00:00Z') - new Date(von + 'T12:00:00Z')) / 864e5);
const sortEv = (a, b) => a.date_created < b.date_created ? -1 : a.date_created > b.date_created ? 1 : (a.id < b.id ? -1 : 1);

const OPPS = [];       // { o, lead, hist, termine[] }
const TERMINE = [];    // alle QC-/SC-Terminierungen ab AB
for (const [leadId, l] of Object.entries(out)) {
  for (const o of l.opps) {
    const hist = l.acts.filter(a => a._type === 'OpportunityStatusChange' && a.opportunity_id === o.id).sort(sortEv);
    const initial = hist.length ? hist[0].old_status_id : o.status_id;
    const rec = { o, lead: l, hist, termine: [] };
    const mk = (art, am, von, rest, idx, herkunft) => {
      const a = ausgangVon(art, rest);
      const t = { art, am, von, vonName: un[von] || '', ausgang: a.status, ausgangEv: a.e, ausgangStatus: a.e ? a.e.new_status_label : '', ausgangAm: a.e ? ymd(a.e.date_created) : '',
        ausgangVon: a.e ? (un[a.e.user_id] || a.e.user_name || '') : '', rest, idx, herkunft, opp: rec };
      rec.termine.push(t); TERMINE.push(t);
    };
    if (GELEGT[initial] && ymd(o.date_created) >= AB) mk(GELEGT[initial], ymd(o.date_created), o.user_id || o.created_by, hist, -1, 'Anlage');
    hist.forEach((e, i) => { if (GELEGT[e.new_status_id] && ymd(e.date_created) >= AB) mk(GELEGT[e.new_status_id], ymd(e.date_created), e.user_id, hist.slice(i + 1), i, 'Statuswechsel'); });
    OPPS.push(rec);
  }
}
// Nachfolgendes SC zu einem Setting (erstes SC Terminiert nach dem Setting) + dessen Ausgang
function closingNach(t) {
  const i = t.rest.findIndex(e => e.new_status_id === S.SC_TERMINIERT);
  if (i < 0) return null;
  return t.opp.termine.find(x => x.art === 'closing' && x.idx === t.idx + 1 + i + (t.idx === -1 ? 0 : 0) ) || t.opp.termine.find(x => x.art === 'closing' && x.am >= t.am);
}
const wonNach = (rest) => rest.find(e => e.new_status_id === S.WON) || null;
const lostNach = (rest) => rest.find(e => e.new_status_id === S.LOST) || null;
const wert = (o) => o.value != null ? o.value / 100 : null;
const setterVon = (t) => { const f = t.opp.o[CF_SETTER]; if (f) return { name: un[f] || f, quelle: 'Feld Setter' };
  if (t.ausgang === 'stattgefunden' || t.ausgang === 'nicht stattgefunden') return { name: t.ausgangVon, quelle: 'hat Setting-Ausgang gesetzt' }; return { name: '', quelle: '' }; };
const closerVon = (t) => { const f = t.opp.o[CF_CLOSER]; if (f) return { name: un[f] || f, quelle: 'Feld Closer' };
  if (t.ausgang === 'stattgefunden' || t.ausgang === 'nicht stattgefunden') return { name: t.ausgangVon, quelle: 'hat SC-Ausgang gesetzt' }; return { name: '', quelle: '' }; };
const offeneAufgaben = (lead) => lead.tasks.filter(t => !t.is_complete).sort((a, b) => (a.date || '') < (b.date || '') ? -1 : 1);
const AKT_TYPEN = new Set(['Call', 'Email', 'SMS', 'Meeting', 'Note', 'TaskCompleted', 'OpportunityStatusChange', 'LeadStatusChange', 'CustomActivity']);
const letzteAktivitaet = (lead) => lead.acts.filter(a => AKT_TYPEN.has(a._type)).map(a => ymd(a.activity_at || a.date_created)).sort().pop() || '';
module.exports = { S, TERMINE, OPPS, un, ymd, HEUTE, geholt, arbeitstage, kalendertage, closingNach, wonNach, lostNach, wert, setterVon, closerVon, offeneAufgaben, letzteAktivitaet, CF_SETTER, CF_CLOSER };
