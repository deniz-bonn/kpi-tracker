const E = require('./engine');
const fs = require('fs');
const { S, TERMINE, OPPS, HEUTE, geholt } = E;
const okt = s => !!s && s.startsWith('2026-10');
const d = s => s ? `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)}` : '';
const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : null;
const firma = t => t.opp.o.lead_name || '';
const statusHeute = t => t.opp.o.status_label || '';
const stand = `Stand ${d(HEUTE)} (Close-Abruf ${geholt.slice(11, 16)} UTC)`;
const fruehester = rec => [...rec.termine].sort((a, b) => a.am < b.am ? -1 : a.am > b.am ? 1 : a.idx - b.idx)[0];
const letzter = (rec, art, vor) => rec.termine.filter(t => t.art === art && (vor == null || t.idx < vor)).sort((a, b) => a.idx - b.idx).pop();
const gewonnen = t => E.wonNach(t.rest);
const wertWenn = (t, w) => w ? E.wert(t.opp.o) : null;
const BASIS = [
  'Quelle: Close-API, nur lesend. Vollständige Status-Historie je Lead (Aktivitäten, Aufgaben, Opportunities) für alle 452 Leads mit Oktober-Bezug, ' + stand + '.',
  'Regeln wie der nächtliche Close-Abgleich (utils/closeSync.js): Setting = Status „QC Terminiert“, Sales Call (SC) = Status „SC Terminiert“ — jeweils bei Anlage der Opportunity oder per Statuswechsel. „Gelegt von“ = Opportunity-Owner (bei Anlage) bzw. wer den Status gesetzt hat.',
  'Ausgang = erster wertender Folgestatus auf derselben Opportunity. Setting stattgefunden: QC Follow-Up, QC=SC Ausstehend, jeder SC-Status, Won, Altstatus. Nicht stattgefunden: QC No/Show, QC Abgesagt (Closing: SC/ No-Show, SC/ Abgesagt). Verschoben: QC Verschoben (quotenneutral). Unklar: direkt Lost/Blacklist. Offen: noch kein wertender Folgestatus.',
  'Oktober = Datum, an dem der Termin gelegt wurde (Europe/Berlin), sofern nicht anders angegeben.',
  'Setter eines Settings = Opportunity-Feld „Setter“; ist es leer, die Person, die den Setting-Ausgang gesetzt hat (nur bei stattgefunden/nicht stattgefunden). Closer eines SC analog über das Feld „Closer“. Abgleich: Feld und Ausgang-Setzer stimmen bei 99 von 103 (Setter) bzw. 88 von 93 (Closer) Oktober-Terminen überein.',
  'Gewonnen = Status „Won“ irgendwann nach dem Termin auf derselben Opportunity. Opp.-Wert = Wert der Opportunity in Close (nur bei gewonnenen ausgewiesen).',
  'Personen mit mehreren Close-Benutzern: Mikail Kotaman hat einen zweiten Benutzer (mikail.kotaman@fach-digial.de) ohne Termine. Opportunities, die in Close gelöscht/ersetzt wurden, fehlen (z. B. eine Opportunity vom 30.10., Dominik Bous — heute ersetzt).',
];
const files = [];
const OUTDIR = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/exports/oktober-2026';

// ── 1) Verbleib offen ────────────────────────────────────────────────────────
{
  const OFFEN = new Set([S.QC_TERMINIERT, S.QC_FOLLOWUP, S.QC_SC_AUSSTEH, S.SC_TERMINIERT, S.SC_STATT_FU]);
  const rows = [];
  for (const rec of OPPS) {
    if (!rec.termine.some(t => okt(t.am)) || !OFFEN.has(rec.o.status_id)) continue;
    const last = rec.hist[rec.hist.length - 1];
    const seit = last ? E.ymd(last.date_created) : E.ymd(rec.o.date_created);
    const at = E.arbeitstage(seit, HEUTE);
    if (at <= 5) continue;
    const st = letzter(rec, 'setting'), sc = letzter(rec, 'closing');
    rows.push({ firma: rec.o.lead_name, status: rec.o.status_label, seit, at, opener: fruehester(rec).vonName,
      setter: st ? (E.setterVon(st).name || '(Setting noch ohne Ausgang, Feld Setter leer)') : '(kein Setting — Direkt-SC)',
      closer: sc ? (E.closerVon(sc).name || '(SC noch ohne Ausgang, Feld Closer leer)') : '(noch kein SC gelegt)', akt: E.letzteAktivitaet(rec.lead), opp: rec.o.id });
  }
  rows.sort((a, b) => b.at - a.at || a.firma.localeCompare(b.firma));
  const zaehl = k => Object.entries(rows.reduce((m, r) => (m[r[k] || '(nicht zuordenbar)'] = (m[r[k] || '(nicht zuordenbar)'] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]);
  const zus = [['Verbleib offen — Team, Oktober 2026', ''], [stand, ''], [], ['Opportunities gesamt', rows.length], [],
    ['Je Status heute', 'Anzahl'], ...zaehl('status'), [], ['Je Setter', 'Anzahl'], ...zaehl('setter'), [], ['Je Closer', 'Anzahl'], ...zaehl('closer')];
  files.push({ file: 'Verbleib_offen_Team_Oktober-2026.xlsx', sheets: [
    { name: 'Verbleib offen', header: ['Firma', 'Status heute', 'Status seit', 'Tage im Status (Arbeitstage)', 'Opener', 'Setter', 'Closer', 'letzte Aktivität am', 'Close-Opportunity'],
      rows: rows.map(r => [r.firma, r.status, d(r.seit), r.at, r.opener, r.setter, r.closer, d(r.akt), r.opp]), widths: [42, 18, 12, 12, 18, 18, 18, 14, 50] },
    { name: 'Zusammenfassung', rows: zus, widths: [40, 12], titel: true },
    { name: 'Hinweise', rows: [...BASIS, '',
      'Auswahl: Opportunities mit mindestens einem im Oktober gelegten Setting oder SC, deren Status heute „QC Terminiert“, „QC Follow-Up“, „QC=SC Ausstehend“, „SC Terminiert“ oder „SC/ Statt. FU“ ist und seit mehr als 5 Arbeitstagen nicht gewechselt hat.',
      'Status seit = Datum des letzten Statuswechsels der Opportunity (ohne Wechsel: Anlagedatum). Tage im Status = Arbeitstage Mo–Fr danach bis heute; im Zeitraum fällt kein NRW-Feiertag auf einen Werktag.',
      'Opener = wer den ersten Termin der Opportunity gelegt hat (Setting, bei Direkt-SC das SC).',
      'Setter = wer das letzte Setting geführt hat (nicht, wer es gelegt hat — das ist der Opener). Closer = wer das letzte SC geführt hat. Beide nach der Setter-/Closer-Regel oben; leer = nicht zuordenbar (Feld leer und noch kein Ausgang).',
      'Letzte Aktivität am = jüngste Aktivität am Lead (Anruf, E-Mail, SMS, Meeting, Notiz, erledigte Aufgabe, Status­wechsel); Importe und Systemeinträge zählen nicht.'].map(x => [x]), widths: [160] }] , zus });
}

// ── 2) Setter-Dateien ────────────────────────────────────────────────────────
const nachfassung = (t) => {
  const fu = t.ausgangEv; if (!fu) return null;
  const ab = fu.date_created; const fuTag = E.ymd(ab);
  const frist = E.kalendertage(fuTag, HEUTE) < 5;
  const n = t.opp.lead.acts.filter(a => (a.activity_at || a.date_created) > ab && (
    (a._type === 'Call' && a.direction === 'outbound') || (a._type === 'Email' && a.direction === 'outgoing') ||
    (a._type === 'SMS' && a.direction === 'outbound') || a._type === 'Meeting' ||
    (a._type === 'OpportunityStatusChange' && a.opportunity_id === t.opp.o.id)))
    .map(a => E.ymd(a.activity_at || a.date_created)).sort()[0];
  if (n && E.kalendertage(fuTag, n) <= 5) return 'ja';
  return frist ? 'Frist läuft' : 'nein';
};
const settingsOhneZuordnung = TERMINE.filter(t => t.art === 'setting' && okt(t.am) && !E.setterVon(t).name).length;
for (const [kurz, name] of [['Naekel', 'Clemens Näkel'], ['Bauer', 'Markus Bauer'], ['Buharin', 'Andreas Buharin'], ['Groten', 'Brian Groten']]) {
  const ts = TERMINE.filter(t => t.art === 'setting' && okt(t.am) && E.setterVon(t).name === name).sort((a, b) => a.am < b.am ? -1 : a.am > b.am ? 1 : firma(a).localeCompare(firma(b)));
  const rows = ts.map((t, i) => { const sc = E.closingNach(t); const w = gewonnen(t); const q = E.setterVon(t).quelle;
    return { t, sc, w, fu: t.ausgangEv && t.ausgangEv.new_status_id === S.QC_FOLLOWUP, nf: null, q,
      r: [i + 1, d(t.am), firma(t), t.vonName, t.ausgang, t.ausgangStatus, d(t.ausgangAm), sc ? 'ja' : 'nein', sc ? d(sc.am) : '', sc ? sc.ausgang : '',
        w ? 'ja' : 'nein', wertWenn(t, w), statusHeute(t), t.opp.o.id, q] }; });
  rows.forEach(x => { if (x.fu) x.nf = nachfassung(x.t);
    x.r.push(x.nf || '', E.offeneAufgaben(x.t.opp.lead).map(a => `${a.date ? d(E.ymd(a.date)) : 'o. D.'} ${(a.text || '').trim().slice(0, 30)}`).join(' | ')); });
  const n = rows.length, c = f => rows.filter(f).length;
  const statt = c(x => x.t.ausgang === 'stattgefunden'), scN = c(x => x.sc), fuN = c(x => x.fu), offen = c(x => x.t.ausgang === 'offen');
  const nfJa = c(x => x.nf === 'ja'), nfNein = c(x => x.nf === 'nein'), nfLauf = c(x => x.nf === 'Frist läuft');
  const scs = rows.filter(x => x.sc).map(x => x.sc);
  const wN = c(x => x.w), wSum = rows.filter(x => x.w).reduce((s, x) => s + (E.wert(x.t.opp.o) || 0), 0);
  const zus = [[`Settings geführt — ${name}, Oktober 2026`, '', ''], [stand, '', ''], [], ['Kennzahl', 'Anzahl', '%'],
    ['Settings geführt (zugeordnet)', n, ''],
    ['  davon stattgefunden', statt, pct(statt, n)], ['  davon nicht stattgefunden', c(x => x.t.ausgang === 'nicht stattgefunden'), pct(c(x => x.t.ausgang === 'nicht stattgefunden'), n)],
    ['  davon verschoben / unklar', c(x => ['verschoben', 'unklar'].includes(x.t.ausgang)), ''],
    ['  davon ohne Ausgang', offen, pct(offen, n)], [],
    ['davon SC Terminiert (Durchstellung, Basis alle)', scN, pct(scN, n)], ['Durchstellung auf stattgefundene Settings', scN, pct(scN, statt)],
    ['davon QC Follow-Up (erster Ausgang)', fuN, pct(fuN, n)],
    ['Follow-Ups mit Nachfassung innerhalb 5 Tagen', nfJa, pct(nfJa, nfJa + nfNein)], ['  ohne Nachfassung innerhalb 5 Tagen', nfNein, pct(nfNein, nfJa + nfNein)],
    ['  Frist läuft noch (Follow-Up < 5 Tage alt, nicht gewertet)', nfLauf, ''], [],
    ['Gelegte Closings', scs.length, ''], ['  stattgefunden', scs.filter(s => s.ausgang === 'stattgefunden').length, ''],
    ['  geplatzt', scs.filter(s => s.ausgang === 'nicht stattgefunden').length, ''], ['  verschoben / unklar', scs.filter(s => ['verschoben', 'unklar'].includes(s.ausgang)).length, ''],
    ['  ohne Ausgang', scs.filter(s => s.ausgang === 'offen').length, ''], [], ['Gewonnen', wN, ''], ['Wert gewonnen €', wSum, '']];
  files.push({ file: `Settings_gefuehrt_${kurz}_Oktober-2026.xlsx`, fill: { gew: 10, sc: 7 }, sheets: [
    { name: 'Settings geführt', header: ['Nr', 'Setting am', 'Firma', 'Opener', 'Setting-Ausgang', 'Ausgang-Status in Close', 'Ausgang am', 'Closing-Termin entstanden', 'Closing gelegt am', 'Closing-Ausgang', 'Gewonnen', 'Opp.-Wert €', 'Status heute', 'Close-Opportunity', 'Setter-Zuordnung über', 'Nachfassung ≤ 5 Tage (nur QC Follow-Up)', 'Offene Aufgaben in Close (Fälligkeit Text)'],
      rows: rows.map(x => x.r), widths: [5, 11, 40, 18, 18, 22, 11, 12, 11, 18, 9, 11, 22, 50, 26, 14, 40], euroCol: 12 },
    { name: 'Zusammenfassung', rows: zus, widths: [52, 10, 8], titel: true },
    { name: 'Hinweise', rows: [...BASIS, '',
      `Auswahl: im Oktober gelegte Settings, die ${name} geführt hat (Setter-Regel oben) — nicht die, die ${name} selbst gelegt/geöffnet hat. „Setting am“ = Datum, an dem das Setting gelegt wurde; den eigentlichen Termin-Tag kennt Close nicht sauber (Ausgang am ist der Tag, an dem der Ausgang gepflegt wurde).`,
      `Nicht zuordenbar: ${settingsOhneZuordnung} Oktober-Settings haben weder ein Setter-Feld noch einen Ausgang; sie fehlen in allen Setter-Dateien.`,
      'Durchstellung = auf das Setting folgte ein „SC Terminiert“ auf derselben Opportunity. QC Follow-Up = der erste wertende Ausgang des Settings war „QC Follow-Up“ (kann danach noch durchgestellt worden sein).',
      'Nachfassung = nach dem Setzen von „QC Follow-Up“ gab es am Lead einen ausgehenden Anruf, eine ausgehende E-Mail/SMS, ein Meeting oder einen weiteren Statuswechsel der Opportunity — innerhalb von 5 Kalendertagen. Follow-Ups jünger als 5 Tage (Frist läuft) zählen in der Quote nicht mit. Wer nachgefasst hat, wird nicht geprüft.',
      'Achtung beim Lesen der Nachfass-Quote: Follow-Ups werden in Close meist als Wiedervorlage-Aufgabe („#HP1“) mit späterer Fälligkeit geplant — teils bewusst nach mehr als 5 Tagen. „Nein“ heisst also nur: in 5 Tagen kein Kontakt, nicht zwingend: vergessen. Die geplanten Wiedervorlagen stehen je Zeile in „Offene Aufgaben in Close“.'].map(x => [x]), widths: [160] }], zus });
}

// ── 3) Groten direkt ─────────────────────────────────────────────────────────
const vorherQC = t => (t.idx === -1 ? false : t.opp.hist.slice(0, t.idx).some(e => e.new_status_id === S.QC_TERMINIERT) || (t.opp.hist.length && t.opp.hist[0].old_status_id === S.QC_TERMINIERT));
const scOkt = TERMINE.filter(t => t.art === 'closing' && okt(t.am));
const kennz = (ts) => { const statt = ts.filter(t => t.ausgang === 'stattgefunden').length, platzt = ts.filter(t => t.ausgang === 'nicht stattgefunden').length;
  const w = ts.filter(t => gewonnen(t)); return { n: ts.length, statt, platzt, offen: ts.filter(t => t.ausgang === 'offen').length, vu: ts.filter(t => ['verschoben', 'unklar'].includes(t.ausgang)).length,
    show: pct(statt, statt + platzt), close: pct(w.length, statt), won: w.length, wert: w.reduce((s, t) => s + (E.wert(t.opp.o) || 0), 0) }; };
{
  const direkt = scOkt.filter(t => /Groten/.test(t.vonName) && !vorherQC(t)).sort((a, b) => a.am < b.am ? -1 : 1);
  const ueberSetting = scOkt.filter(t => vorherQC(t));
  const a = kennz(direkt), b = kennz(ueberSetting);
  const zus = [['Sales Calls direkt aus dem Opening — Brian Groten, Oktober 2026', '', ''], [stand, '', ''], [],
    ['Kennzahl', 'Groten direkt', 'Alle SC über ein Setting (Team)'],
    ['Sales Calls gelegt', a.n, b.n], ['  stattgefunden', a.statt, b.statt], ['  geplatzt', a.platzt, b.platzt], ['  verschoben / unklar', a.vu, b.vu], ['  ohne Ausgang', a.offen, b.offen],
    ['Show-Rate %', a.show, b.show], ['Closing-Rate % (gewonnen / stattgefunden)', a.close, b.close], ['Gewonnen', a.won, b.won], ['Wert gewonnen €', a.wert, b.wert]];
  files.push({ file: 'SalesCalls_direkt_Groten_Oktober-2026.xlsx', fill: { gew: 7 }, sheets: [
    { name: 'SC direkt Groten', header: ['Nr', 'SC gelegt am', 'Firma', 'Closer', 'Closing-Ausgang', 'Closing-Status in Close', 'Ausgang am', 'Gewonnen', 'Gewonnen am', 'Opp.-Wert €', 'Status heute', 'Close-Opportunity'],
      rows: direkt.map((t, i) => { const w = gewonnen(t); return [i + 1, d(t.am), firma(t), E.closerVon(t).name, t.ausgang, t.ausgangStatus, d(t.ausgangAm), w ? 'ja' : 'nein', w ? d(E.ymd(w.date_created)) : '', wertWenn(t, w), statusHeute(t), t.opp.o.id]; }),
      widths: [5, 11, 40, 18, 18, 22, 11, 9, 11, 11, 22, 50], euroCol: 10 },
    { name: 'Zusammenfassung', rows: zus, widths: [44, 14, 30], titel: true },
    { name: 'Hinweise', rows: [...BASIS, '',
      'Direkt aus dem Opening = Brian Groten hat im Oktober „SC Terminiert“ gelegt, und auf der Opportunity stand vorher nie „QC Terminiert“ (volle Historie geprüft, auch vor Oktober).',
      'Vergleich = alle im Oktober gelegten SC (alle Personen), vor denen auf derselben Opportunity ein „QC Terminiert“ stand.',
      'Show-Rate = stattgefunden / (stattgefunden + geplatzt); verschobene, unklare und offene zählen nicht. Closing-Rate = gewonnen / stattgefunden. Gewonnen = „Won“ nach dem SC, Stand heute — offene SC können noch gewinnen.'].map(x => [x]), widths: [160] }], zus });
}

// ── 4) Closer ────────────────────────────────────────────────────────────────
{
  const sheets = [], zusAlle = [];
  for (const [kurz, name] of [['Kawka', 'Julius Kawka'], ['Böttcher', 'Tobias Böttcher']]) {
    const ts = TERMINE.filter(t => t.art === 'closing' && E.closerVon(t).name === name &&
      ((t.ausgang !== 'offen' && okt(t.ausgangAm)) || (t.ausgang === 'offen' && okt(t.am))))
      .sort((a, b) => (a.ausgangAm || a.am) < (b.ausgangAm || b.am) ? -1 : 1);
    const rows = ts.map((t, i) => {
      const rec = t.opp, st = letzter(rec, 'setting', t.idx === -1 ? -1 : t.idx), w = gewonnen(t), l = E.lostNach(t.rest);
      const angebot = t.rest.some(e => e.new_status_id === S.SC_STATT_FU || e.new_status_id === S.WON) ? 'ja' : t.rest.some(e => e.new_status_id === S.SC_STATT_KEINA) ? 'nein' : '';
      const scAm = t.ausgang === 'offen' ? '' : t.ausgangAm;
      const tasks = E.offeneAufgaben(rec.lead).map(x => `${x.date ? d(E.ymd(x.date)) : 'o. D.'} ${(x.text || '').trim().slice(0, 30)}`).join(' | ');
      const last = rec.hist[rec.hist.length - 1]; const seit = last ? E.ymd(last.date_created) : E.ymd(rec.o.date_created);
      const ent = [w, l].filter(Boolean).sort((a, b) => a.date_created < b.date_created ? -1 : 1)[0];
      return { t, w, l, ent, scAm, angebot, tasks, seit, offTask: E.offeneAufgaben(rec.lead).length > 0,
        r: [i + 1, d(scAm), d(t.am), firma(t), fruehester(rec).vonName, st ? E.setterVon(st).name : '', t.ausgang, statusHeute(t),
          scAm ? E.kalendertage(scAm, HEUTE) : null, '', tasks, angebot, w ? 'ja' : 'nein', w ? d(E.ymd(w.date_created)) : '', wertWenn(t, w), rec.o.id] };
    });
    const c = f => rows.filter(f).length;
    const statt = c(x => x.t.ausgang === 'stattgefunden'), platzt = c(x => x.t.ausgang === 'nicht stattgefunden');
    const fuAlt = rows.filter(x => x.t.opp.o.status_id === S.SC_STATT_FU && E.kalendertage(x.seit, HEUTE) > 5);
    const entsch = rows.filter(x => x.t.ausgang === 'stattgefunden' && x.ent);
    const won = entsch.filter(x => x.ent.new_status_id === S.WON).length;
    const dTage = entsch.map(x => E.kalendertage(x.scAm, E.ymd(x.ent.date_created)));
    const z = [[`Sales Calls geführt — ${name}, Oktober 2026`, ''], [stand, ''], [],
      ['SC zugeordnet', rows.length], ['  geführt (stattgefunden)', statt], ['  geplatzt', platzt], ['  verschoben / unklar', c(x => ['verschoben', 'unklar'].includes(x.t.ausgang))], ['  ohne Ausgang', c(x => x.t.ausgang === 'offen')],
      ['Show-Rate %', pct(statt, statt + platzt)], ['Angebot erstellt (ja)', c(x => x.angebot === 'ja')],
      ['„SC/ Statt. FU“ seit mehr als 5 Tagen', fuAlt.length], ['  davon ohne Folgetermin', '(nicht ableitbar, s. Hinweise)'], ['  davon ohne offene Aufgabe in Close (Ersatzangabe)', fuAlt.filter(x => !x.offTask).length],
      ['Entschieden (Won/Lost nach stattgefundenem SC)', entsch.length], ['  gewonnen', won], ['  verloren', entsch.length - won],
      ['Closing-Rate auf entschiedene %', pct(won, entsch.length)], ['Ø Tage bis Entscheidung (Kalendertage)', dTage.length ? Math.round(dTage.reduce((s, x) => s + x, 0) / dTage.length * 10) / 10 : null],
      ['Gewonnen gesamt (inkl. später)', c(x => x.w)], ['Wert gewonnen €', rows.filter(x => x.w).reduce((s, x) => s + (E.wert(x.t.opp.o) || 0), 0)]];
    zusAlle.push(z);
    sheets.push({ name: kurz, header: ['Nr', 'SC am', 'SC gelegt am', 'Firma', 'Opener', 'Setter', 'SC-Ausgang', 'Status heute', 'Tage seit SC', 'Folgetermin vorhanden', 'Offene Aufgaben in Close (Fälligkeit Text)', 'Angebot erstellt', 'Gewonnen', 'Gewonnen am', 'Opp.-Wert €', 'Close-Opportunity'],
      rows: rows.map(x => x.r), widths: [5, 11, 11, 38, 18, 18, 18, 20, 9, 11, 40, 9, 9, 11, 11, 50], euroCol: 15, gewCol: 13 });
  }
  const zusRows = []; zusAlle[0].forEach((r, i) => zusRows.push([r[0], r[1] ?? '', zusAlle[1][i][1] ?? '']));
  zusRows[0] = ['Sales Calls geführt — Closer, Oktober 2026', 'Julius Kawka', 'Tobias Böttcher'];
  files.push({ file: 'SalesCalls_Closer_Oktober-2026.xlsx', sheets: [...sheets,
    { name: 'Zusammenfassung', rows: zusRows, widths: [52, 26, 26], titel: true },
    { name: 'Hinweise', rows: [...BASIS, '',
      'Auswahl: SC, die die Person als Closer geführt hat (Closer-Regel oben) und deren Ausgang im Oktober gepflegt wurde — plus im Oktober gelegte SC, die noch keinen Ausgang haben.',
      'SC am = Tag, an dem der SC-Ausgang gepflegt wurde (bester Näherungswert für den Termintag; Close führt kein sauberes Termindatum). SC gelegt am = Tag des „SC Terminiert“. Tage seit SC = Kalendertage seit „SC am“.',
      'Folgetermin vorhanden: bewusst LEER. Termine liegen in Close als frei beschriftete Aufgaben vor („QC“, „SC“, „#HP1“, „Closing-Termin am …“, „Follow up“, „Bestätigen“ …), Kalender-Meetings gibt es nur 104 und keines in der Zukunft. Ob eine Aufgabe ein Folgetermin ist, lässt sich nicht sauber ableiten. Als Fakt steht daneben die Spalte „Offene Aufgaben in Close“ (alle offenen Aufgaben am Lead, mit Fälligkeit und Text).',
      'Deshalb ist auch „SC/ Statt. FU ohne Folgetermin“ nicht ausgewiesen; die Ersatzangabe „ohne offene Aufgabe in Close“ ist eine harte Untergrenze, kein Folgetermin-Maß.',
      '„SC/ Statt. FU“ seit mehr als 5 Tagen = Status heute „SC/ Statt. FU“ und seit dem letzten Statuswechsel mehr als 5 Kalendertage vergangen.',
      'Angebot erstellt: „ja“, wenn nach dem SC „SC/ Statt. FU“ (früher „Angebot verschickt“) oder „Won“ folgte; „nein“, wenn nur „SC/ Statt. Kein Angebot“ folgte; sonst leer. Das Angebots-Kennzeichen der NK-Deals im KPI-Tracker wurde nicht genutzt (Produktions-DB nicht lesbar).',
      'Entschieden = nach einem stattgefundenen SC folgte „Won“ oder „Lost“ (das erste zählt). Closing-Rate auf entschiedene = Won / (Won + Lost). Ø Tage bis Entscheidung = Kalendertage von „SC am“ bis Won/Lost.'].map(x => [x]), widths: [160] }], zus: zusRows });
}

// ── 5) Settings als Opener (Groten) ─────────────────────────────────────────
{
  const name = 'Brian Groten';
  const ts = TERMINE.filter(t => t.art === 'setting' && okt(t.am) && t.vonName === name)
    .sort((a, b) => a.am < b.am ? -1 : a.am > b.am ? 1 : firma(a).localeCompare(firma(b)));
  const rows = ts.map((t, i) => { const sc = E.closingNach(t); const w = gewonnen(t); const st = E.setterVon(t);
    return { t, sc, w, st, r: [i + 1, d(t.am), firma(t), t.herkunft, st.name, t.ausgang, t.ausgangStatus, d(t.ausgangAm),
      sc ? 'ja' : 'nein', sc ? d(sc.am) : '', sc ? sc.vonName : '', sc ? sc.ausgang : '', sc ? sc.ausgangStatus : '',
      w ? 'ja' : 'nein', w ? d(E.ymd(w.date_created)) : '', wertWenn(t, w), statusHeute(t), t.opp.o.id, st.quelle] }; });
  const n = rows.length, c = f => rows.filter(f).length;
  const scs = rows.filter(x => x.sc).map(x => x.sc);
  const statt = c(x => x.t.ausgang === 'stattgefunden'), platzt = c(x => x.t.ausgang === 'nicht stattgefunden');
  const jeSetter = Object.entries(rows.reduce((m, x) => { const k = x.st.name || '(nicht zuordenbar)'; m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
  const direktN = scOkt.filter(t => t.vonName === name && !vorherQC(t)).length;
  const zus = [[`Settings gelegt (Opener) — ${name}, Oktober 2026`, '', ''], [stand, '', ''], [], ['Kennzahl', 'Anzahl', '%'],
    ['Settings gelegt', n, ''],
    ['  davon stattgefunden', statt, pct(statt, n)], ['  davon geplatzt (No-Show/abgesagt)', platzt, pct(platzt, n)],
    ['  davon verschoben / unklar (direkt Lost/Blacklist)', c(x => ['verschoben', 'unklar'].includes(x.t.ausgang)), ''],
    ['  davon ohne Ausgang', c(x => x.t.ausgang === 'offen'), pct(c(x => x.t.ausgang === 'offen'), n)],
    ['Show-Rate Setting % (stattgefunden / (stattgefunden + geplatzt))', '', pct(statt, statt + platzt)], [],
    ['Closing-Termin entstanden', scs.length, pct(scs.length, n)], ['  auf stattgefundene Settings', '', pct(scs.length, statt)],
    ['  Closing stattgefunden', scs.filter(s => s.ausgang === 'stattgefunden').length, ''], ['  Closing geplatzt', scs.filter(s => s.ausgang === 'nicht stattgefunden').length, ''],
    ['  Closing verschoben / unklar', scs.filter(s => ['verschoben', 'unklar'].includes(s.ausgang)).length, ''], ['  Closing ohne Ausgang', scs.filter(s => s.ausgang === 'offen').length, ''], [],
    ['Gewonnen', c(x => x.w), ''], ['Wert gewonnen €', rows.filter(x => x.w).reduce((s, x) => s + (E.wert(x.t.opp.o) || 0), 0), ''], [],
    ['Je Setter (wer das Setting geführt hat)', 'Anzahl', ''], ...jeSetter.map(([k, v]) => [k, v, pct(v, n)]), [],
    ['Nicht enthalten: direkte Sales Calls ohne Setting (eigene Datei)', direktN, '']];
  files.push({ file: 'Settings_Groten_Oktober-2026.xlsx', sheets: [
    { name: 'Settings Okt 2026', header: ['Nr', 'Setting gelegt am', 'Firma (Lead)', 'Herkunft', 'Setter', 'Setting-Ausgang', 'Ausgang-Status in Close', 'Ausgang am',
      'Closing-Termin entstanden', 'Closing gelegt am', 'Closing gelegt von', 'Closing-Ausgang', 'Closing-Status in Close', 'Gewonnen', 'Gewonnen am', 'Opp.-Wert €', 'Status heute', 'Close-Opportunity', 'Setter-Zuordnung über'],
      rows: rows.map(x => x.r), widths: [5, 11, 40, 13, 18, 18, 22, 11, 12, 11, 18, 18, 22, 9, 11, 11, 22, 50, 26] },
    { name: 'Zusammenfassung', rows: zus, widths: [60, 10, 8], titel: true },
    { name: 'Hinweise', rows: [...BASIS, '',
      `Auswahl: alle Settings („QC Terminiert“), die ${name} im Oktober als Opener gelegt hat — bei Anlage der Opportunity (Owner) oder per Statuswechsel. Aufbau wie Settings_Kotaman / Settings_Bous.`,
      `Ausgeschlossen: die ${direktN} Sales Calls, die er im Oktober direkt aus dem Opening gelegt hat („SC Terminiert“ ohne vorheriges „QC Terminiert“) — sie stehen in SalesCalls_direkt_Groten_Oktober-2026.xlsx.`,
      'Setter = wer das Setting geführt hat (Setter-Regel oben); leer = Setting ohne Ausgang und ohne Setter-Feld. Ist Brian selbst Setter, hat er das Setting gelegt und auch geführt.',
      'Closing-Termin entstanden = auf das Setting folgte „SC Terminiert“ auf derselben Opportunity; Closing gelegt von = wer diesen Status gesetzt hat.'].map(x => [x]), widths: [160] }], zus });
}

fs.writeFileSync(__dirname + '/files.json', JSON.stringify({ outdir: OUTDIR, files }));
console.log('ok', files.map(f => f.file + ' ' + f.sheets[0].rows.length));
