// HTML des Wochenreports. KEINE Kundennamen im Mailtext (nur in den Excel-Anhaengen), keine Zitate.
const { TEAM } = require('./basis');
const K = require('./kennzahlen');
const { fmtP, fmtZ, fmtE, rechnungSchritte } = require('./texte');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const de = (s) => (s ? `${s.slice(8, 10)}.${s.slice(5, 7)}.` : '');
const TBL = 'border-collapse:collapse;font-size:13px;margin:6px 0 14px 0';
const TH = 'border:1px solid #d0d7de;background:#f3f6fa;padding:4px 8px;text-align:left';
const TD = 'border:1px solid #d0d7de;padding:4px 8px';
const TDR = TD + ';text-align:right';
const tabelle = (kopf, zeilen) => `<table style="${TBL}"><tr>${kopf.map(k => `<th style="${TH}">${esc(k)}</th>`).join('')}</tr>${zeilen.map(z => `<tr>${z.map((v, i) => `<td style="${i ? TDR : TD}">${v == null ? '–' : v}</td>`).join('')}</tr>`).join('')}</table>`;
const liste = (a) => (a && a.length ? `<ul style="margin:4px 0 12px 18px;padding:0">${a.map(x => `<li style="margin:2px 0">${esc(x)}</li>`).join('')}</ul>` : '<p>–</p>');
const h2 = (t) => `<h2 style="font-size:18px;margin:26px 0 6px 0;border-bottom:2px solid #1f4e79;color:#1f4e79">${esc(t)}</h2>`;
const h3 = (t) => `<h3 style="font-size:15px;margin:16px 0 4px 0">${esc(t)}</h3>`;
const quote = (s) => (s ? `${fmtP(s.erfolgsquote)} <span style="color:#666">(${s.erfolgJa}/${s.erfolgBasis})</span>` : '–');
const mq = (s, k) => (s && s.merkmale[k] ? `${fmtP(s.merkmale[k].quote)} <span style="color:#666">(${s.merkmale[k].ja}/${s.merkmale[k].basis})</span>` : '–');
const MERKMAL_STUFE = { abschlussfrage_gestellt: ['Opening', 'Setting'], closing_aktiv_angeboten: ['Setting'], termin_verbindlich_fixiert: ['Opening', 'Setting'], abschluss_aktiv_versucht: ['Closing'] };

function personBlock(p, txt, ov) {
  const kz = (t) => t.kpis.map(k => [esc(k.label), k.key === 'ae' ? fmtE(k.ist) : fmtZ(k.ist),
    k.pace ? (k.key === 'ae' ? fmtE(k.pace.soll) : fmtZ(k.pace.soll)) : '–', k.pace ? fmtP(k.pace.erreichung) : 'kein Tagesziel']);
  const stufen = K.STUFEN.filter(st => [p.woche, p.monat].some(x => x && x.stufen && x.stufen[st]));
  const okt = (st) => (st === 'Opening' ? 'nicht vergleichbar' : quote(p.oktober && p.oktober.stufen[st]));
  const nv = (per, st, inhalt) => (st === 'Opening' && !ov[per] ? 'nicht vergleichbar' : inhalt);
  let html = h2(`${p.vorname} — ${p.rolle}`);
  html += h3('KPIs aus dem Tracker gegen Tagesziel-Pace');
  html += `<table><tr><td style="vertical-align:top;padding-right:16px"><b>Woche</b>${tabelle(['KPI', 'Ist', 'Soll', 'Erreichung'], kz(p.tracker.woche))}</td>
           <td style="vertical-align:top"><b>Monat</b>${tabelle(['KPI', 'Ist', 'Soll', 'Erreichung'], kz(p.tracker.monat))}</td></tr></table>`;
  const pot = (p.potenzial.woche[0] || p.potenzial.monat[0]) || null;
  if (!stufen.length) return html + '<p>Keine codierten Gespräche in Woche oder Monat.</p>' + prosa(txt, pot);
  html += h3('Erfolgsquote je Stufe (codierte Gespräche)');
  html += tabelle(['Stufe', 'Calls Woche', 'Woche', 'Vorwoche', 'Monat', 'Oktober-Basis'], stufen.map(st => [st,
    fmtZ(p.woche && p.woche.stufen[st] ? p.woche.stufen[st].n : 0), quote(p.woche && p.woche.stufen[st]), nv('vorwoche', st, quote(p.vorwoche && p.vorwoche.stufen[st])),
    nv('monat', st, quote(p.monat && p.monat.stufen[st])), okt(st)]));
  html += h3('Verhaltensmerkmale (Quote, Woche | Vorwoche | Monat | Oktober)');
  const zeilen = [];
  for (const st of stufen) for (const [k, label] of K.MERKMALE) {
    if (MERKMAL_STUFE[k] && !MERKMAL_STUFE[k].includes(st)) continue;
    const s = (x) => x && x.stufen[st];
    if (![p.woche, p.monat].some(x => s(x) && s(x).merkmale[k])) continue;
    zeilen.push([`${st}: ${esc(label)}`, mq(s(p.woche), k), nv('vorwoche', st, mq(s(p.vorwoche), k)), nv('monat', st, mq(s(p.monat), k)), st === 'Opening' ? 'nicht vergleichbar' : mq(s(p.oktober), k)]);
  }
  html += tabelle(['Merkmal', 'Woche', 'Vorwoche', 'Monat', 'Oktober-Basis'], zeilen);
  html += h3('Top-3-Gründe je Bruchstelle');
  const gz = [];
  for (const st of stufen) {
    const fmt = (x) => { const s = x && x.stufen[st]; return s && s.top3.length ? s.top3.map(g => `${esc(g.name)} (${g.n}-mal)`).join('<br>') : '–'; };
    gz.push([st, fmt(p.woche), nv('vorwoche', st, fmt(p.vorwoche)), nv('monat', st, fmt(p.monat)), st === 'Opening' ? 'nicht vergleichbar' : fmt(p.oktober)]);
  }
  html += tabelle(['Bruchstelle', 'Woche', 'Vorwoche', 'Monat', 'Oktober-Basis'], gz);
  return html + prosa(txt, pot);
}

/** Hebel als Block: Titel, was gemeint ist, Rechnung in Schritten (+ optional ein Satz von Opus). */
function hebelBlock(h, satz) {
  return `<p style="margin:8px 0 2px 0"><b>${esc(h.titel)}</b><br>${esc(h.text)}</p>`
    + `<ul style="margin:2px 0 4px 18px;padding:0;color:#333">${rechnungSchritte(h).map(x => `<li>${esc(x)}</li>`).join('')}</ul>`
    + (satz ? `<p style="margin:2px 0 10px 0">${esc(satz)}</p>` : '');
}

/** Opus-Absatz mit "- "-Zeilen als Liste darstellen. */
function absatz(text) {
  const zeilen = String(text || '').split('\n').map(z => z.trim()).filter(Boolean);
  let html = '', offen = false;
  for (const z of zeilen) {
    if (z.startsWith('- ')) { if (!offen) { html += '<ul style="margin:4px 0 8px 18px;padding:0">'; offen = true; } html += `<li>${esc(z.slice(2))}</li>`; }
    else { if (offen) { html += '</ul>'; offen = false; } html += `<p style="margin:6px 0 2px 0"><b>${esc(z)}</b></p>`; }
  }
  return html + (offen ? '</ul>' : '');
}

function prosa(txt, pot) {
  if (!txt) return '<p><i>Texte nicht erzeugt.</i></p>';
  return h3('Was war gut') + liste(txt.gut) + h3('Was war schlecht') + liste(txt.schlecht)
    + h3('Größtes Potenzial für sofort mehr Umsatz') + (pot ? hebelBlock(pot, txt.potenzial) : `<p>${esc(txt.potenzial)}</p>`)
    + h3('Was muss geschult werden') + liste(txt.schulung);
}

function html(d, texte) {
  const Zr = d.zeitraeume;
  const t = d.team;
  let s = `<div style="font-family:Arial,Helvetica,sans-serif;color:#1b1f23;max-width:980px">`;
  s += `<h1 style="font-size:22px;margin:0 0 4px 0">Vertriebsanalyse Bonn KW ${Zr.woche.kw}</h1>`;
  s += `<p style="margin:0 0 10px 0;color:#555">Woche ${de(Zr.woche.von)}–${de(Zr.woche.bis)}${Zr.woche.bis.slice(0, 4)} (Sa–Fr) · Monat ${de(Zr.monat.von)}–${de(Zr.monat.bis)} · Vergleich: Vorwoche ${de(Zr.vorwoche.von)}–${de(Zr.vorwoche.bis)} und Oktober-Basis (01.10.–03.11.). Codiert: ${d.codierung.woche} Gespräche in der Woche, ${d.codierung.monat} im Monat.</p>`;
  if (d.codierung.nichtVollstaendig) s += `<p style="background:#fff4d6;border:1px solid #e0b84c;padding:6px 10px"><b>Nicht vollständig:</b> ${d.codierung.nichtCodiertWoche} Aufnahmen der Woche waren bis zum Versand noch nicht codiert. Sie werden nachts nachgeholt und erscheinen im Vorwochen-Vergleich des nächsten Reports.</p>`;
  if (texte.modus === 'test') s += `<p style="background:#e8f1fb;border:1px solid #8bb3e0;padding:6px 10px"><b>Testlauf</b> — nur an ${esc(TEAM.versand.empfaenger_test.join(', '))}.</p>`;

  s += h2('Team');
  const si = (x) => x.zeilen.map(z => [esc(z.label), z.label.includes('EUR') ? fmtE(z.ist) : fmtZ(z.ist), z.soll == null ? '–' : (z.label.includes('EUR') ? fmtE(z.soll) : fmtZ(z.soll)),
    z.soll ? fmtP(Math.round(100 * z.ist / z.soll)) : '–']);
  s += `<table><tr><td style="vertical-align:top;padding-right:16px"><b>Soll/Ist Woche</b> (${t.sollIst.woche.werktage} Werktage)${tabelle(['Kennzahl', 'Ist', 'Soll', 'Erreichung'], si(t.sollIst.woche))}</td>
        <td style="vertical-align:top"><b>Soll/Ist Monat</b> (${t.sollIst.monat.werktage} Werktage)${tabelle(['Kennzahl', 'Ist', 'Soll', 'Erreichung'], si(t.sollIst.monat))}</td></tr></table>`;
  s += h3('Die eine Kennzahl je Stufe gegen die November-Ziele');
  s += tabelle(['Stufe', 'Kennzahl', 'Woche', 'Monat', 'Oktober-Basis', 'Ziel'], TEAM.november_ziele.kennzahlen.map((z, i) => {
    const f = (x) => (x[i].quote == null ? '–' : `${fmtP(x[i].quote)} <span style="color:#666">(${x[i].ja}/${x[i].basis})</span>`);
    return [z.stufe, esc(z.label), f(t.zielKennzahlen.woche), f(t.zielKennzahlen.monat), z.stufe === 'Opening' ? 'nicht vergleichbar' : f(t.zielKennzahlen.oktober), fmtP(z.ziel)];
  }));
  s += h3('Die drei größten Hebel') + (t.hebel.length ? t.hebel.map((h, i) => hebelBlock(h, texte.team && texte.team.hebel ? texte.team.hebel[i] : null)).join('') : '<p>–</p>');
  if (t.hebel.length) s += `<p style="font-size:12px;color:#555">Durchschnittlicher Auftrag = Auftragseingang je gewonnenem Neukunden-Deal in Bonn, letzte 90 Tage (${d.deal.basis} Deals). „Bis zu“ ist eine Obergrenze; vorsichtig gerechnet ist die Hälfte.</p>`;

  s += h2('Verbleib: geführte Settings und Closings ohne Ergebnis');
  const vb = (v) => [fmtZ(v.settingsOhneErgebnis), fmtZ(v.closingsOhneErgebnis), fmtZ(v.fuAnzahl), fmtE(v.fuWert), fmtP(v.fuStattTerminAnteil)];
  s += tabelle(['Zeitraum', 'Settings ohne Ergebnis', 'Closings ohne Ergebnis', 'Wiedervorlagen', 'Wert der Wiedervorlagen', 'davon Wiedervorlage statt Termin'],
    [['Woche', ...vb(d.verbleib.woche)], ['Monat', ...vb(d.verbleib.monat)]]);
  const je = (rolle, obj) => Object.entries(obj).filter(([n]) => TEAM.personen.some(p => p.vorname === n))
    .map(([n, x]) => [`${rolle} ${esc(n)}`, fmtZ(x.settingsOhneErgebnis), fmtZ(x.closingsOhneErgebnis), fmtZ(x.fuAnzahl), fmtE(x.fuWert), fmtZ(x.fuStattTermin)]);
  const jeZ = [...je('Setter', d.verbleib.monat.jeSetter), ...je('Closer', d.verbleib.monat.jeCloser)];
  if (jeZ.length) s += '<b>Je Setter und Closer (Monat)</b>' + tabelle(['Person', 'Settings ohne Ergebnis', 'Closings ohne Ergebnis', 'Wiedervorlagen', 'Wert', 'Wiedervorlage statt Termin'], jeZ);
  const g = d.verbleib.woche.gesamtListe;
  s += `<p>Gesamte Liste (Stand ${de(d.verbleib.stand)}): ${fmtZ(g.opportunities)} Opportunities, ${fmtE(g.wert)} Opportunity-Wert, davon ${fmtZ(g.followUpStattTermin)} „Wiedervorlage statt Termin“. Firmen und Links stehen in der angehängten Excel-Liste.</p><p style="font-size:12px;color:#555">„Wiedervorlage statt Termin“ heißt: Entscheider und Bedarf waren im Gespräch da, trotzdem wurde kein Termin gelegt, sondern nur eine Wiedervorlage vereinbart, die mehr als 14 Tage später liegt oder gar kein Datum hat.</p>`;
  s += h3('Warum kein Ergebnis') + absatz(texte.team ? texte.team.verbleib : 'Text nicht erzeugt.');

  for (const p of d.personen) s += personBlock(p, texte.personen[p.vorname], d.openingVergleichbar);

  s += h2('Abdeckung und Hinweise');
  const ab = d.abdeckung.woche;
  s += tabelle(['Closer', 'Sales Calls stattgefunden (Woche)', 'mit Aufnahme', 'ohne Aufnahme'],
    Object.entries(ab.salesCallsJeCloser).map(([n, x]) => [esc(n), fmtZ(x.stattgefunden), fmtZ(x.mitAufnahme), fmtZ(x.ohneAufnahme)]));
  s += `<ul style="font-size:12px;color:#444;margin-left:18px;padding:0">
    <li>Quoten nur aus Codierungen mit hoher oder mittlerer Konfidenz. Closing erfolgreich = Abschluss im Call oder laut Close gewonnen.</li>
    <li>Opening: Ab 31.10. werden alle Calls ab 60 Sekunden der acht codiert, davor nur Calls auf Leads mit späterem Termin. Opening-Werte aus Zeiträumen vor dem 31.10. (Oktober-Basis, Vorwoche KW 44) sind deshalb nicht vergleichbar.</li>
    <li>Potenzial: „bis zu“ ist eine Obergrenze, weil Gespräche mit dem gewünschten Verhalten oft ohnehin besser laufen. Vorsichtig gerechnet ist die Hälfte, wie in der Oktober-Analyse.</li>
    <li>Codierungen bis 03.11. stammen aus der Oktober-Analyse (Prompt v1); ab 04.11. Prompt v2 (zusätzlich Datum und Inhalt des nächsten Schritts).</li>
    <li>Keine Kundennamen, keine Zitate. Paraphrasen und Firmen nur in den Excel-Anhängen.</li></ul>`;
  return s + '</div>';
}

module.exports = { html };
