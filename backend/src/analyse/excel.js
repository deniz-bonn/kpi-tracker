// Excel-Anhaenge des Wochenreports: Verbleib-Liste (mit Firma) und Codierungen der Woche (Paraphrasen, keine Zitate).
const ExcelJS = require('exceljs');
const { db, PH } = require('./basis');
const V = require('./verbleib');
const K = require('./kennzahlen');

const BED = { a: 'a) kein nächster Schritt', b: 'b) Closing ohne Ergebnis', c: 'c) Setting ohne Ergebnis', d: 'd) Follow-Up statt Termin' };
const deDatum = (s) => (s ? `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)}` : '');

function blatt(wb, name, spalten, zeilen) {
  const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = spalten.map(([header, key, width]) => ({ header, key, width: width || 16 }));
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEF7' } };
  for (const z of zeilen) ws.addRow(z);
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: spalten.length } };
  return ws;
}

async function verbleibXlsx(daten) {
  const wb = new ExcelJS.Workbook();
  const ops = V.jeOpportunity(daten.verbleib.zeilen);
  const ws = blatt(wb, 'Verbleib', [
    ['Firma', 'firma', 32], ['Stufe', 'stufe', 10], ['Datum', 'datum', 12], ['Opener', 'opener', 14], ['Setter', 'setter', 14], ['Closer', 'closer', 14],
    ['Status', 'status', 18], ['Status seit', 'seit', 12], ['Tage (Werktage)', 'tage', 10], ['Bedingung', 'bed', 26], ['Follow-Up akzeptiert statt Termin', 'fu', 14],
    ['Nächster Schritt laut Close', 'nsc', 34], ['Fällig (Close)', 'nscd', 12], ['Nächster Schritt laut Transkript', 'nst', 34], ['Datum (Transkript)', 'nstd', 12],
    ['Grund', 'grund', 40], ['Opportunity-Wert', 'wert', 14], ['Währung', 'wae', 8], ['Link in Close', 'link', 40], ['Opp-ID', 'opp', 30],
  ], ops.map(z => ({
    firma: z.firma, stufe: z.stufe, datum: deDatum(z.termin_datum), opener: z.opener, setter: z.setter, closer: z.closer, status: z.status_label,
    seit: deDatum(z.status_seit), tage: z.tage_im_status, bed: z.bedingungen.split(', ').map(b => BED[b]).join('; '), fu: z.follow_up_statt_termin ? 'ja' : '',
    nsc: z.naechster_schritt_close || '', nscd: deDatum(z.naechster_schritt_close_datum), nst: z.naechster_schritt_transkript || '', nstd: deDatum(z.naechster_schritt_transkript_datum),
    grund: z.grund ? `${z.grund_id} ${z.grund}` : '', wert: z.opportunity_wert, wae: z.waehrung, link: z.close_link ? { text: 'öffnen', hyperlink: z.close_link } : '', opp: z.close_opportunity_id,
  })));
  ws.getColumn('wert').numFmt = '#,##0 €';
  ops.forEach((z, i) => { if (z.follow_up_statt_termin) ws.getRow(i + 2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF4D6' } }; });

  const kz = [];
  for (const [lab, v] of [['Woche', daten.verbleib.woche], ['Monat', daten.verbleib.monat]]) {
    kz.push({ a: lab, b: 'Settings geführt ohne Ergebnis', c: v.settingsOhneErgebnis }, { a: lab, b: 'Closings geführt ohne Ergebnis', c: v.closingsOhneErgebnis },
      { a: lab, b: 'Follow-Ups (Anzahl)', c: v.fuAnzahl }, { a: lab, b: 'Summe Opportunity-Wert in Follow-Ups (EUR)', c: v.fuWert },
      { a: lab, b: 'Anteil „Follow-Up akzeptiert statt Termin“ (%)', c: v.fuStattTerminAnteil });
    for (const [rolle, je] of [['Setter', v.jeSetter], ['Closer', v.jeCloser]]) for (const [n, x] of Object.entries(je)) {
      kz.push({ a: lab, b: `${rolle} ${n}: Settings / Closings ohne Ergebnis`, c: `${x.settingsOhneErgebnis} / ${x.closingsOhneErgebnis}` },
        { a: lab, b: `${rolle} ${n}: Follow-Up-Wert (EUR), davon „statt Termin“`, c: `${x.fuWert} (${x.fuAnzahl} FU, ${x.fuStattTermin} statt Termin)` });
    }
  }
  blatt(wb, 'Kennzahlen', [['Zeitraum', 'a', 10], ['Kennzahl', 'b', 60], ['Wert', 'c', 24]], kz);
  return wb.xlsx.writeBuffer();
}

async function codierungenXlsx(daten) {
  const rows = daten.codierungenWoche;
  const opps = [...new Set(rows.map(r => r.close_opportunity_id).filter(Boolean))];
  const namen = {};
  for (let i = 0; i < opps.length; i += 500) {
    const t = opps.slice(i, i + 500);
    for (const o of await db.all(`SELECT id, lead_id, lead_name FROM close_opportunities WHERE id IN (${PH(t.length)})`, t)) namen[o.id] = o;
  }
  const wb = new ExcelJS.Workbook();
  blatt(wb, 'Codierungen', [
    ['Datum', 'datum', 11], ['Mitarbeiter', 'ma', 16], ['Quelle', 'quelle', 10], ['Stufe (Inhalt)', 'stufe', 16], ['Stufe (Zeitlinie)', 'stufeH', 14],
    ['Ergebnis', 'erg', 28], ['Erfolg', 'erfolg', 8], ['Konfidenz', 'konf', 10], ['Grund 1', 'g1', 40], ['Grund 2', 'g2', 40], ['Freitext Sonstiger Grund', 'frei', 28],
    ['Entscheider im Gespräch', 'm1', 10], ['Bedarf bestätigt', 'm0', 10], ['Aktiv nach Termin gefragt', 'm2', 10], ['Nächster Schritt mit Datum', 'm3', 10],
    ['Terminfrage gestellt', 'm4', 10], ['Closing aktiv angeboten', 'm5', 10], ['Termin verbindlich fixiert', 'm6', 10], ['Abschluss aktiv versucht', 'm7', 10],
    ['Nächster Schritt (Paraphrase)', 'ns', 34], ['Datum nächster Schritt', 'nsd', 12], ['Redeanteil MA %', 'rede', 10], ['Dauer Min', 'dauer', 8],
    ['Einzeiler (paraphrasiert)', 'ein', 70], ['Firma', 'firma', 30], ['Link in Close', 'link', 30], ['Opp-ID', 'opp', 30], ['Call-/Meeting-ID', 'id', 30], ['Basis', 'basis', 9],
  ], rows.map(r => {
    const o = namen[r.close_opportunity_id] || {};
    const g = (id, k) => (id ? `${id} ${K.grundName(id)}${k ? ' (' + k + ')' : ''}` : '');
    return { datum: r.call_datum ? `${r.call_datum.slice(8, 10)}.${r.call_datum.slice(5, 7)}.` : '', ma: r.mitarbeiter, quelle: r.quelle === 'fireflies' ? 'Fireflies' : 'Close',
      stufe: r.stufe, stufeH: r.stufe_zeitlinie, erg: r.ergebnis, erfolg: r.erfolg, konf: r.konfidenz, g1: g(r.grund1_id, r.grund1_konfidenz), g2: g(r.grund2_id, r.grund2_konfidenz),
      frei: r.grund_freitext || '', m1: r.entscheider_im_gespraech, m0: r.bedarf_bestaetigt, m2: r.ma_fragte_aktiv_nach_termin, m3: r.naechster_schritt_mit_datum,
      m4: r.abschlussfrage_gestellt, m5: r.closing_aktiv_angeboten, m6: r.termin_verbindlich_fixiert, m7: r.abschluss_aktiv_versucht,
      ns: r.naechster_schritt_text || '', nsd: r.naechster_schritt_datum ? String(r.naechster_schritt_datum).slice(0, 10) : '',
      rede: r.redeanteil_ma != null ? Number(r.redeanteil_ma) : null, dauer: r.dauer_sek != null ? Math.round(Number(r.dauer_sek) / 6) / 10 : null,
      ein: r.einzeiler || '', firma: o.lead_name || '', link: (o.lead_id || r.close_lead_id) ? { text: 'öffnen', hyperlink: `https://app.close.com/lead/${o.lead_id || r.close_lead_id}/` } : '',
      opp: r.close_opportunity_id || '', id: r.quell_id, basis: r.basis };
  }));
  return wb.xlsx.writeBuffer();
}

module.exports = { verbleibXlsx, codierungenXlsx };
