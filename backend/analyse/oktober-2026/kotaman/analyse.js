const fs = require('fs');
const { users, evs, opps } = JSON.parse(fs.readFileSync(__dirname + '/raw.json'));
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
const ausgangVon = (art, rest) => { let v = null;
  for (const e of rest) { if (e.new_status_id === S.QC_VERSCHOBEN) { v = e; continue; }
    if (v && GELEGT[e.new_status_id] === art) return { status: 'verschoben', e: v };
    if (NEG[art].has(e.new_status_id)) return { status: 'nicht stattgefunden', e };
    if (POS[art].has(e.new_status_id)) return { status: 'stattgefunden', e };
    if (UNKLAR.has(e.new_status_id)) return { status: 'unklar', e }; }
  return v ? { status: 'verschoben', e: v } : { status: 'offen', e: null }; };
const BER = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });
const ymd = v => BER.format(new Date(v));
const MIK = new Set(users.filter(u => new RegExp(process.env.WER || 'kotaman', 'i').test(u.name + ' ' + u.email)).map(u => u.id));
console.error('Mikail-User:', users.filter(u => MIK.has(u.id)).map(u => `${u.id.slice(0,10)}… ${u.name} <${u.email}>`));
const uname = Object.fromEntries(users.map(u => [u.id, u.name]));
const byOpp = {}; for (const e of evs.sort((a, b) => a.date_created < b.date_created ? -1 : a.date_created > b.date_created ? 1 : (a.id < b.id ? -1 : 1))) (byOpp[e.opportunity_id] ||= []).push(e);
const oppBy = Object.fromEntries(opps.map(o => [o.id, o]));
const rows = [];
const auswerten = (o, oppId, startIdx, gelegtAm, herkunft, list) => {
  const rest = list.slice(startIdx);
  const a = ausgangVon('setting', rest);
  const scIdx = rest.findIndex(e => e.new_status_id === S.SC_TERMINIERT);
  const sc = scIdx >= 0 ? rest[scIdx] : null;
  const scA = sc ? ausgangVon('closing', rest.slice(scIdx + 1)) : null;
  const won = rest.find(e => e.new_status_id === S.WON);
  o = o || {};
  rows.push({ gelegt_am: gelegtAm, firma: o.lead_name || '(Opportunity ' + oppId + ')', herkunft,
    setting_ausgang: a.status, setting_ausgang_status: a.e ? a.e.new_status_label : '', setting_ausgang_am: a.e ? ymd(a.e.date_created) : '',
    closing_gelegt: sc ? 'ja' : 'nein', closing_gelegt_am: sc ? ymd(sc.date_created) : '', closing_gelegt_von: sc ? sc.user_name || uname[sc.user_id] || '' : '',
    closing_ausgang: scA ? scA.status : '', closing_ausgang_status: scA && scA.e ? scA.e.new_status_label : '',
    gewonnen: won ? 'ja' : 'nein', gewonnen_am: won ? ymd(won.date_created) : '',
    wert_eur: o.value != null ? o.value / 100 : '', status_heute: o.status_label || '', opp_id: oppId });
};
for (const o of opps) {
  const list = byOpp[o.id] || [];
  const initial = list.length ? list[0].old_status_id : o.status_id;
  const owner = o.user_id || o.created_by;
  if (initial === S.QC_TERMINIERT && ymd(o.date_created).startsWith('2026-10') && MIK.has(owner)) auswerten(o, o.id, 0, ymd(o.date_created), 'Anlage', list);
}
for (const [oppId, list] of Object.entries(byOpp)) list.forEach((e, i) => {
  if (e.new_status_id === S.QC_TERMINIERT && ymd(e.date_created).startsWith('2026-10') && MIK.has(e.user_id)) auswerten(oppBy[oppId], oppId, i + 1, ymd(e.date_created), 'Statuswechsel', list);
});
rows.sort((a, b) => a.gelegt_am < b.gelegt_am ? -1 : a.gelegt_am > b.gelegt_am ? 1 : a.firma.localeCompare(b.firma));
fs.writeFileSync(__dirname + '/rows-' + (process.env.WER || 'kotaman') + '.json', JSON.stringify(rows, null, 1));
const c = (f) => rows.filter(f).length;
console.log('Settings gelegt Okt:', rows.length, '| aus Anlage', c(r => r.herkunft === 'Anlage'), '| aus Wechsel', c(r => r.herkunft === 'Statuswechsel'));
for (const s of ['stattgefunden', 'nicht stattgefunden', 'verschoben', 'unklar', 'offen']) console.log('  Setting', s, c(r => r.setting_ausgang === s));
console.log('Closing entstanden:', c(r => r.closing_gelegt === 'ja'));
for (const s of ['stattgefunden', 'nicht stattgefunden', 'verschoben', 'unklar', 'offen']) console.log('  Closing', s, c(r => r.closing_ausgang === s));
console.log('Gewonnen:', c(r => r.gewonnen === 'ja'), 'Wert', rows.filter(r => r.gewonnen === 'ja').reduce((s, r) => s + (r.wert_eur || 0), 0));
console.log('Opps mehrfach:', Object.entries(rows.reduce((m, r) => (m[r.opp_id] = (m[r.opp_id] || 0) + 1, m), {})).filter(([, n]) => n > 1).length);
console.log('Status heute (Setting ohne Closing, offen):', JSON.stringify(rows.filter(r => r.closing_gelegt === 'nein').reduce((m, r) => (m[r.status_heute] = (m[r.status_heute] || 0) + 1, m), {})));
console.log('Ohne Opp-Stammdaten:', c(r => r.firma.startsWith('(Opp')));
