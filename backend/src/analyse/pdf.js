// Kompakter Wochenreport als PDF (max. 3 A4-Seiten): Seite 1 Team, Seiten 2–3 je Mitarbeiter ein Block.
// Keine Kundennamen, keine Codes. Details stehen in den Excel-Dateien und im Dashboard (/verbleib).
const path = require('path');
const pdfmake = require('pdfmake');
const { fmtP, fmtZ, fmtE } = require('./texte');

const FONTS = require('pdfmake/fonts/Roboto');
const FONT_DIR = path.dirname(require.resolve('pdfmake/fonts/Roboto'));
pdfmake.setFonts(FONTS);
pdfmake.setLocalAccessPolicy((p) => path.resolve(p).startsWith(FONT_DIR));
pdfmake.setUrlAccessPolicy(() => false);

let BLOCK_ABSTAND = 8;   // wird beim Einpassen auf 3 Seiten verkleinert
const BLAU = '#1f4e79', GRAU = '#666666', LINIE = '#d0d7de', HELL = '#f3f6fa', GELB = '#fff4d6';
const anteilVon = (x) => (x && x.basis ? `${x.verpasst} von ${x.basis} (${fmtP(x.quote)})` : '–');
const kurz = (t, n) => { const s = String(t || ''); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
const de = (s) => (s ? `${s.slice(8, 10)}.${s.slice(5, 7)}.` : '');
const STUFE_VON = { opener: 'Opening', setter: 'Setting', closer: 'Closing' };

const tabLayout = {
  hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length ? 0.6 : 0.3),
  vLineWidth: () => 0, hLineColor: () => LINIE, paddingLeft: () => 4, paddingRight: () => 4, paddingTop: () => 2, paddingBottom: () => 2,
  fillColor: (r) => (r === 0 ? HELL : null),
};
const tab = (kopf, zeilen, widths) => ({
  table: { headerRows: 1, widths: widths || kopf.map((_, i) => (i === 0 ? '*' : 'auto')),
    body: [kopf.map((k, i) => ({ text: k, bold: true, alignment: i ? 'right' : 'left' })), ...zeilen.map(z => z.map((v, i) => ({ text: v == null ? '–' : String(v), alignment: i ? 'right' : 'left', noWrap: i > 0 && !(String(v).includes(' · ')) })))] },
  layout: tabLayout, margin: [0, 2, 0, 6],
});
const h = (t) => ({ text: t, bold: true, fontSize: 11, color: BLAU, margin: [0, 8, 0, 3] });
const punkte = (a) => ({ ul: (a || []).filter(Boolean).map(String), margin: [0, 0, 0, 4] });
const q = (s) => (s ? `${fmtP(s.erfolgsquote)} (${s.erfolgJa}/${s.erfolgBasis})` : '–');
const mq = (s, k) => (s && s.merkmale[k] ? `${fmtP(s.merkmale[k].quote)} (${s.merkmale[k].ja}/${s.merkmale[k].basis})` : '–');

function seiteTeam(d, texte) {
  const Zr = d.zeitraeume, t = d.team, c = [];
  c.push({ columns: [
    { width: '*', text: `Vertriebsanalyse Bonn · KW ${Zr.woche.kw}${texte.modus === 'test' ? ' (Test)' : ''}`, fontSize: 15, bold: true, color: BLAU },
    { width: 'auto', text: `Woche ${de(Zr.woche.von)}–${de(Zr.woche.bis)}${Zr.woche.bis.slice(0, 4)}\nMonat ${de(Zr.monat.von)}–${de(Zr.monat.bis)} · ${d.codierung.woche} Gespräche ausgewertet`, alignment: 'right', fontSize: 8, color: GRAU },
  ] });
  if (d.codierung.nichtVollstaendig) c.push({ text: `Nicht vollständig: ${d.codierung.nichtCodiertWoche} Gespräche der Woche waren noch nicht ausgewertet.`, fillColor: GELB, margin: [0, 4, 0, 0], fontSize: 8 });

  c.push(h('Auf einen Blick'));
  c.push(punkte(texte.team ? texte.team.kernaussagen : ['Texte nicht erzeugt.']));

  const pw = t.verpasst.woche, pm = t.verpasst.monat;
  const sw = t.sollIst.woche.zeilen, sm = t.sollIst.monat.zeilen;
  const zahl = (z, v) => (v == null ? '–' : z.label.includes('EUR') ? fmtE(v) : fmtZ(v));
  const erf = (z) => (z.soll ? fmtP(Math.round(100 * z.ist / z.soll)) : '–');
  c.push({ columns: [
    { width: '56%', stack: [h('Soll / Ist'), tab(['', 'Woche', 'Soll', '%', 'Monat', 'Soll', '%'],
      sw.map((z, i) => [z.label.replace(' (EUR)', '').replace(' (terminiert)', ''), zahl(z, z.ist), zahl(z, z.soll), erf(z), zahl(sm[i], sm[i].ist), zahl(sm[i], sm[i].soll), erf(sm[i])]))] },
    { width: '44%', stack: [h('Verpasste Chancen'), tab(['', 'Woche', 'Monat'], [
      ['Verpasste Termine (Setting)', anteilVon(pw.setting), anteilVon(pm.setting)],
      ['Verpasste Abschlüsse (Closing)', anteilVon(pw.closing), anteilVon(pm.closing)],
    ]), { text: 'Setting: qualifiziert, aber kein Sales Call, weil der Setter keinen Termin angeboten oder fixiert hat. Closing: closebar, aber nicht gewonnen, weil der Closer keinen Abschluss gesucht, Einwände offen gelassen oder einen Folgetermin als Ausweg gelegt hat.', fontSize: 7, color: GRAU }] },
  ], columnGap: 12 });

  // Zum Reinhören: die konkreten Leads der Woche (Firma, Link zur Aufnahme bzw. zum Lead in Close)
  for (const [titel, x] of [['Zum Reinhören: verpasste Termine dieser Woche', pw.setting], ['Zum Reinhören: verpasste Abschlüsse dieser Woche', pw.closing]]) {
    if (!x.beispiele.length) continue;
    c.push(h(titel));
    c.push({
      table: { headerRows: 1, widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto'],
        body: [['Datum', 'Mitarbeiter', 'Firma', 'Was passiert ist', 'Wert', ''].map((k, i) => ({ text: k, bold: true, alignment: i === 4 ? 'right' : 'left' })),
          ...x.beispiele.map(b => [de(b.datum), b.mitarbeiter, { text: b.firma, bold: true }, { text: [{ text: b.warum + ': ', bold: true }, kurz(b.was, 150)] },
            { text: b.wert != null ? fmtE(b.wert) : '–', alignment: 'right', noWrap: true },
            b.link ? { text: 'öffnen', link: b.link, color: BLAU, decoration: 'underline', noWrap: true } : '–'])] },
      layout: tabLayout, margin: [0, 2, 0, 4],
    });
  }

  const jo = Object.entries(t.settingsJeOpener.monat).filter(([, x]) => x.gelegt || x.ausgewertet)
    .sort((a, b) => (a[0] === 'andere') - (b[0] === 'andere') || b[1].gelegt - a[1].gelegt);
  if (jo.length) {
    c.push(h('Settings nach Opener (Monat): Show-Rate und Qualifizierung'));
    c.push({
      table: { headerRows: 2, widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          [{ text: '', border: [false, false, false, false] }, { text: 'Gelegte Settings', colSpan: 5, alignment: 'center', bold: true }, {}, {}, {}, {},
            { text: 'davon mit Aufnahme ausgewertet', colSpan: 5, alignment: 'center', bold: true }, {}, {}, {}, {}],
          ['Opener', 'gelegt', 'statt-\ngefunden', 'geplatzt', 'offen', 'Show-\nRate', 'aus-\ngewertet', 'quali-\nfiziert', 'Entscheider\nfehlt', 'Bedarf\nfehlt', 'nicht\nzeitnah']
            .map((k, i) => ({ text: k, bold: true, alignment: i ? 'right' : 'left' })),
          ...jo.map(([n, x]) => [n, fmtZ(x.gelegt), fmtZ(x.stattgefunden), fmtZ(x.geplatzt), fmtZ(x.offen), fmtP(x.showRate),
            fmtZ(x.ausgewertet), fmtZ(x.qualifiziert), fmtZ(x.entscheiderFehlt), fmtZ(x.bedarfFehlt), fmtZ(x.nichtZeitnah)]
            .map((v, i) => ({ text: String(v), alignment: i ? 'right' : 'left', noWrap: i > 0 }))),
        ] },
      layout: { ...tabLayout, fillColor: (r) => (r <= 1 ? HELL : null), hLineWidth: (i, node) => (i === 2 || i === node.table.body.length ? 0.6 : 0.3) },
      margin: [0, 2, 0, 4],
    });
    c.push({ text: 'Je Zeile: gelegt = stattgefunden + geplatzt + offen; ausgewertet = qualifiziert + Entscheider fehlt + Bedarf fehlt + nicht zeitnah. Stattgefunden = laut Close oder Aufnahme vorhanden. Geplatzt = No-Show oder abgesagt. Offen = Termin noch nicht fällig, verschoben oder Ausgang in Close nicht gepflegt. Show-Rate = stattgefunden / (stattgefunden + geplatzt). Qualifiziert = Entscheider dabei oder zugesagt, deckbarer Bedarf, zeitnah; sonst genau ein Grund, in dieser Reihenfolge geprüft. Entscheider fehlt = Fehler im Opening.', fontSize: 7, color: GRAU });
  }

  const vw = d.verbleib.woche, vm = d.verbleib.monat, g = vw.gesamtListe;
  c.push(h('Verbleib: Settings und Sales Calls ohne Ergebnis'));
  c.push(tab(['', 'Settings ohne Ergebnis', 'Sales Calls ohne Ergebnis', 'Wiedervorlagen (Wert)', 'davon statt Termin'], [
    ['Woche', fmtZ(vw.settingsOhneErgebnis), fmtZ(vw.closingsOhneErgebnis), `${fmtZ(vw.fuAnzahl)} (${fmtE(vw.fuWert)})`, fmtZ(vw.fuStattTermin)],
    ['Monat', fmtZ(vm.settingsOhneErgebnis), fmtZ(vm.closingsOhneErgebnis), `${fmtZ(vm.fuAnzahl)} (${fmtE(vm.fuWert)})`, fmtZ(vm.fuStattTermin)],
  ]));
  c.push({ text: `Gesamte offene Liste: ${fmtZ(g.opportunities)} Opportunities, ${fmtE(g.wert)}. „Statt Termin“ = Entscheider und Bedarf waren da, vereinbart wurde aber nur eine Wiedervorlage (später als 14 Tage oder ohne Datum). Firmen und Links: Excel „Verbleib“.`, fontSize: 7, color: GRAU, margin: [0, 0, 0, 4] });
  c.push({ columns: [
    { stack: [{ text: 'Warum kein Ergebnis', bold: true, margin: [0, 2, 0, 2] }, punkte(texte.team ? texte.team.warum : [])] },
    { stack: [{ text: 'Was sich ändern muss', bold: true, margin: [0, 2, 0, 2] }, punkte(texte.team ? texte.team.aendern : [])] },
  ], columnGap: 12 });
  return c;
}

const anteil = (x) => (x && x.basis ? `${x.ja} von ${x.basis}` : '–');
/** Kurzer Qualitaetswert je Stufe fuer die Tabellenspalte (Opener zusaetzlich: Herkunft ihrer Settings). */
function qualitaetKurz(st, s, herkunft) {
  const q = s && s.qualitaet;
  const teile = [];
  if (q && st === 'Opening') teile.push(`Termin ohne Entscheider ${anteil(q.terminOhneEntscheider)}`, `Bedarf festgestellt ${anteil(q.bedarfFestgestellt)}`);
  if (q && st === 'Setting') teile.push(`qualifiziert ${anteil(q.qualifiziert)}`, `angeboten ohne Qualifizierung ${q.angebotenUnqualifiziert.ja}`);
  if (q && st === 'Closing') teile.push(`Einwände behandelt ${anteil(q.einwaendeBehandelt)}`, `Folgetermin trotz Einwand ${anteil(q.folgeterminTrotzEinwaenden)}`);
  if (st === 'Opening' && herkunft) teile.push(`deine Settings (Monat): Show-Rate ${fmtP(herkunft.showRate)}, qualifiziert ${herkunft.qualifiziert} von ${herkunft.ausgewertet}, ohne Entscheider ${herkunft.entscheiderFehlt}`);
  return teile.join(' · ') || '–';
}

function blockPerson(p, txt, ov, herkunft, verpasst) {
  const kpi = (k) => p.tracker.woche.kpis.find(x => x.key === k);
  const kpiM = (k) => p.tracker.monat.kpis.find(x => x.key === k);
  const zelle = (k) => { const w = kpi(k), m = kpiM(k); if (!w) return '–'; const f = (x) => (k === 'ae' ? fmtE(x.ist) : fmtZ(x.ist)); return `${f(w)} / ${f(m)}`; };
  const stufen = [...new Set(p.funktionen.map(f => STUFE_VON[f]))].filter(st => [p.woche, p.monat].some(x => x && x.stufen && x.stufen[st]));
  const zeilen = stufen.map(st => {
    const s = (x) => x && x.stufen && x.stufen[st];
    const vw = st === 'Opening' && !ov.vorwoche ? 'n. vergl.' : q(s(p.vorwoche));
    const vp = st === 'Setting' ? verpasst.setting.jePerson[p.vorname] : st === 'Closing' ? verpasst.closing.jePerson[p.vorname] : null;
    const verp = st === 'Setting' ? (vp ? `${vp.verpasst} von ${vp.basis} qualifizierten` : '–')
      : st === 'Closing' ? (vp ? `${vp.verpasst} von ${vp.basis} closebaren` : '–') : '';
    return [st, q(s(p.woche)), vw, verp, qualitaetKurz(st, s(p.woche), herkunft)];
  });
  const pot = p.potenzial.woche[0] || p.potenzial.monat[0];
  const zeile = (label, text, farbe) => ({ text: [{ text: label + ' ', bold: true, color: farbe || '#1b1f23' }, text || '–'], margin: [0, 1, 0, 0] });
  return {
    unbreakable: true, margin: [0, 0, 0, BLOCK_ABSTAND],
    stack: [
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 523, y2: 0, lineWidth: 0.8, lineColor: BLAU }] },
      { columns: [{ text: `${p.vorname}`, bold: true, fontSize: 11, color: BLAU }, { text: p.rolle, alignment: 'right', color: GRAU, fontSize: 8 }], margin: [0, 3, 0, 2] },
      tab(['Woche / Monat', 'Entscheider erreicht', 'Settings gelegt', 'Sales Calls gelegt', 'Sales Calls stattgef.', 'Gewonnen', p.funktionen.includes('closer') ? 'AE' : 'AE beteiligt'],
        [['', zelle('entscheider_erreicht'), zelle('terminiert'), zelle('sc_gelegt'), zelle('sc_stattgefunden'), zelle('gewonnen'), zelle('ae')]]),
      zeilen.length ? tab(['Stufe', 'Erfolg Woche', 'Vorwoche', 'Verpasst (Woche)', 'Qualität (Woche)'], zeilen, ['auto', 'auto', 'auto', 'auto', '*'])
        : { text: 'Keine ausgewerteten Gespräche in Woche oder Monat.', color: GRAU, margin: [0, 0, 0, 3] },
      zeile('+', txt && txt.gut, '#1a7f37'),
      zeile('–', txt && txt.schlecht, '#cf222e'),
      pot ? zeile('Hebel:', `${pot.titel}: ${fmtZ(pot.pool)} Fälle, bis zu ${fmtE(pot.umsatz)} mehr Umsatz (vorsichtig ${fmtE(pot.umsatzKonservativ)}).`) : zeile('Hebel:', 'kein Hebel mit ausreichender Datenbasis.'),
      zeile('Schulung:', txt && txt.schulung),
    ],
  };
}

async function rendere(d, texte, { fontSize, lineHeight, abstand, raender }) {
  BLOCK_ABSTAND = abstand;
  const personen = d.personen.map(p => blockPerson(p, texte.personen[p.vorname], d.openingVergleichbar,
    p.funktionen.includes('opener') ? d.team.settingsJeOpener.monat[p.vorname] : null, d.team.verpasst.woche));
  const doc = {
    pageSize: 'A4', pageMargins: raender,
    defaultStyle: { font: 'Roboto', fontSize, lineHeight, color: '#1b1f23' },
    info: { title: `Vertriebsanalyse Bonn KW ${d.zeitraeume.woche.kw}` },
    footer: (seite, gesamt) => ({ text: `Vertriebsanalyse Bonn · KW ${d.zeitraeume.woche.kw} · Seite ${seite} von ${gesamt} · Quoten aus ausgewerteten Gesprächen (Konfidenz hoch/mittel); Opening vor dem 31.10. nicht vergleichbar`, fontSize: 6.5, color: GRAU, margin: [raender[0], 10, raender[2], 0] }),
    content: [
      ...seiteTeam(d, texte),
      { text: 'Mitarbeiter (Werte Woche / Monat)', bold: true, fontSize: 12, color: BLAU, pageBreak: 'before', margin: [0, 0, 0, 6] },
      ...personen,
    ],
  };
  return Buffer.from(await pdfmake.createPdf(doc).getBuffer());
}

// Stufen zum Einpassen auf hoechstens 3 Seiten: erst normal, dann schrittweise kompakter.
const STUFEN_LAYOUT = [
  { fontSize: 8.5, lineHeight: 1.15, abstand: 8, raender: [36, 32, 36, 32] },
  { fontSize: 8, lineHeight: 1.1, abstand: 6, raender: [32, 28, 32, 28] },
  { fontSize: 7.5, lineHeight: 1.05, abstand: 4, raender: [30, 26, 30, 26] },
  { fontSize: 7, lineHeight: 1.0, abstand: 3, raender: [28, 24, 28, 24] },
];

/** PDF als Buffer, auf hoechstens 3 Seiten eingepasst (soweit moeglich). */
async function erzeuge(d, texte) {
  let buf = null;
  for (const layout of STUFEN_LAYOUT) {
    buf = await rendere(d, texte, layout);
    if (seiten(buf) <= 3) return buf;
  }
  return buf;   // auch kompakt mehr als 3 Seiten: der Lauf meldet das als Warnung
}

/** Seitenzahl eines erzeugten PDFs (fuer die Pruefung auf max. 3 Seiten). */
function seiten(buf) { return (buf.toString('latin1').match(/\/Type \/Page[^s]/g) || []).length; }

module.exports = { erzeuge, seiten };
