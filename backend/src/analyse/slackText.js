// Slack-Fassung des Wochenreports (mrkdwn). Inhalt wie mailHtml.js: Hauptbeitrag = Team + Verbleib,
// je Mitarbeiter ein Thread-Beitrag. KEINE Kundennamen im Text (nur in der Excel-Datei im Thread).
const { TEAM } = require('./basis');
const K = require('./kennzahlen');
const { fmtP, fmtZ, fmtE, rechnungSchritte } = require('./texte');
const hebel = (h, satz) => `*${esc(h.titel)}*\n${esc(h.text)}\n${rechnungSchritte(h).map(x => `   ◦ ${esc(x)}`).join('\n')}${satz ? '\n' + esc(satz) : ''}`;
const absatz = (text) => String(text || '').split('\n').map(z => z.trim()).filter(Boolean).map(z => (z.startsWith('- ') ? `• ${esc(z.slice(2))}` : `*${esc(z)}*`)).join('\n');

const de = (s) => (s ? `${s.slice(8, 10)}.${s.slice(5, 7)}.` : '');
const q = (s) => (s ? `${fmtP(s.erfolgsquote)} (${s.erfolgJa}/${s.erfolgBasis})` : '–');
const mq = (s, k) => (s && s.merkmale[k] ? `${fmtP(s.merkmale[k].quote)} (${s.merkmale[k].ja}/${s.merkmale[k].basis})` : '–');
const MERKMAL_STUFE = { abschlussfrage_gestellt: ['Opening', 'Setting'], closing_aktiv_angeboten: ['Setting'], termin_verbindlich_fixiert: ['Opening', 'Setting'], abschluss_aktiv_versucht: ['Closing'] };
// Slack-Steuerzeichen in freiem Text entschaerfen
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Monospace-Tabelle als Codeblock. */
function tabelle(kopf, zeilen) {
  const alle = [kopf, ...zeilen].map(z => z.map(v => String(v == null ? '–' : v)));
  const breiten = kopf.map((_, i) => Math.max(...alle.map(z => z[i].length)));
  const fmt = (z) => z.map((v, i) => (i === 0 ? v.padEnd(breiten[i]) : v.padStart(breiten[i]))).join('  ');
  return '```\n' + [fmt(alle[0]), breiten.map(b => '-'.repeat(b)).join('  '), ...alle.slice(1).map(fmt)].join('\n') + '\n```';
}
const liste = (a) => (a && a.length ? a.map(x => `• ${esc(x)}`).join('\n') : '–');

function haupt(d, texte) {
  const Zr = d.zeitraeume, t = d.team;
  const zeilen = [];
  zeilen.push(`*Vertriebsanalyse Bonn KW ${Zr.woche.kw}${texte.modus === 'test' ? ' (Test)' : ''}*`);
  zeilen.push(`Woche ${de(Zr.woche.von)}–${de(Zr.woche.bis)} (Sa–Fr) · Monat ${de(Zr.monat.von)}–${de(Zr.monat.bis)} · Vergleich Vorwoche ${de(Zr.vorwoche.von)}–${de(Zr.vorwoche.bis)} und Oktober-Basis. Codiert: ${d.codierung.woche} Gespräche in der Woche, ${d.codierung.monat} im Monat.`);
  if (texte.modus === 'test') zeilen.push('_Testlauf — nur an Deniz._');
  if (d.codierung.nichtVollstaendig) zeilen.push(`:warning: *Nicht vollständig:* ${d.codierung.nichtCodiertWoche} Aufnahmen der Woche waren bis zum Versand noch nicht codiert; sie erscheinen im Vorwochen-Vergleich des nächsten Reports.`);

  const si = (x) => x.zeilen.map(z => z.label.includes('EUR') ? fmtE(z.ist) : fmtZ(z.ist));
  const so = (x) => x.zeilen.map(z => (z.soll == null ? '–' : (z.label.includes('EUR') ? fmtE(z.soll) : fmtZ(z.soll))));
  const er = (x) => x.zeilen.map(z => (z.soll ? fmtP(Math.round(100 * z.ist / z.soll)) : '–'));
  const [iw, sw, ew, im, sm, em] = [si(t.sollIst.woche), so(t.sollIst.woche), er(t.sollIst.woche), si(t.sollIst.monat), so(t.sollIst.monat), er(t.sollIst.monat)];
  zeilen.push(`\n*Team — Soll/Ist* (Woche ${t.sollIst.woche.werktage}, Monat ${t.sollIst.monat.werktage} Werktage)`);
  zeilen.push(tabelle(['Kennzahl', 'Woche Ist', 'Soll', 'Erf.', 'Monat Ist', 'Soll', 'Erf.'],
    t.sollIst.woche.zeilen.map((z, i) => [z.label.replace(' (EUR)', ''), iw[i], sw[i], ew[i], im[i], sm[i], em[i]])));

  zeilen.push('*Die eine Kennzahl je Stufe gegen die November-Ziele*');
  zeilen.push(tabelle(['Stufe / Kennzahl', 'Woche', 'Monat', 'Oktober', 'Ziel'], TEAM.november_ziele.kennzahlen.map((z, i) => {
    const f = (x) => (x[i].quote == null ? '–' : `${fmtP(x[i].quote)} (${x[i].ja}/${x[i].basis})`);
    return [`${z.stufe}: ${z.label}`, f(t.zielKennzahlen.woche), f(t.zielKennzahlen.monat), z.stufe === 'Opening' ? 'n. vergl.' : f(t.zielKennzahlen.oktober), fmtP(z.ziel)];
  })));

  zeilen.push('*Die drei größten Hebel*');
  zeilen.push(t.hebel.length ? t.hebel.map((h, i) => hebel(h, texte.team && texte.team.hebel ? texte.team.hebel[i] : null)).join('\n\n') : '–');
  if (t.hebel.length) zeilen.push(`_Durchschnittlicher Auftrag = Auftragseingang je gewonnenem Neukunden-Deal in Bonn, letzte 90 Tage (${d.deal.basis} Deals). „Bis zu“ ist eine Obergrenze, vorsichtig gerechnet die Hälfte._`);

  zeilen.push('\n*Verbleib: geführte Settings und Closings ohne Ergebnis*');
  const vb = (v) => [fmtZ(v.settingsOhneErgebnis), fmtZ(v.closingsOhneErgebnis), fmtZ(v.fuAnzahl), fmtE(v.fuWert), fmtP(v.fuStattTerminAnteil)];
  zeilen.push(tabelle(['Zeitraum', 'Settings ohne Erg.', 'Closings ohne Erg.', 'Wiedervorl.', 'Wert', 'statt Termin'],
    [['Woche', ...vb(d.verbleib.woche)], ['Monat', ...vb(d.verbleib.monat)]]));
  const je = (rolle, obj) => Object.entries(obj).filter(([n]) => TEAM.personen.some(p => p.vorname === n))
    .map(([n, x]) => [`${rolle} ${n}`, fmtZ(x.settingsOhneErgebnis), fmtZ(x.closingsOhneErgebnis), fmtZ(x.fuAnzahl), fmtE(x.fuWert), fmtZ(x.fuStattTermin)]);
  const jeZ = [...je('Setter', d.verbleib.monat.jeSetter), ...je('Closer', d.verbleib.monat.jeCloser)];
  if (jeZ.length) zeilen.push('Je Setter und Closer (Monat)\n' + tabelle(['Person', 'Settings', 'Closings', 'Wiedervorl.', 'Wert', 'statt Termin'], jeZ));
  const g = d.verbleib.woche.gesamtListe;
  zeilen.push(`Gesamte Liste (Stand ${de(d.verbleib.stand)}): ${fmtZ(g.opportunities)} Opportunities, ${fmtE(g.wert)} Opportunity-Wert, davon ${fmtZ(g.followUpStattTermin)} „Wiedervorlage statt Termin“.\n_„Wiedervorlage statt Termin“ heißt: Entscheider und Bedarf waren im Gespräch da, trotzdem wurde kein Termin gelegt, sondern nur eine Wiedervorlage vereinbart, die mehr als 14 Tage später liegt oder gar kein Datum hat._`);
  zeilen.push(`*Warum kein Ergebnis*\n${absatz(texte.team ? texte.team.verbleib : 'Text nicht erzeugt.')}`);

  const ab = d.abdeckung.woche.salesCallsJeCloser;
  zeilen.push('\n_Abdeckung Sales Calls (Woche): ' + Object.entries(ab).map(([n, x]) => `${n} ${x.mitAufnahme} von ${x.stattgefunden} mit Aufnahme`).join(' · ') + '_');
  zeilen.push('_Details je Mitarbeiter im Thread. Firmen, Werte und Close-Links in der Verbleib-Excel im Thread. Quoten nur aus Codierungen mit hoher/mittlerer Konfidenz; Opening-Werte vor dem 31.10. sind nicht vergleichbar; Potenzial „bis zu“ = Obergrenze, vorsichtig gerechnet die Hälfte._');
  return zeilen.join('\n');
}

function person(p, txt, ov) {
  const z = [];
  z.push(`*${p.vorname} — ${esc(p.rolle)}*`);
  const kz = (k, t) => (k.key === 'ae' ? fmtE(k.ist) : fmtZ(k.ist)) + (k.pace ? ` / ${k.key === 'ae' ? fmtE(k.pace.soll) : fmtZ(k.pace.soll)} (${fmtP(k.pace.erreichung)})` : '');
  z.push('KPIs aus dem Tracker (Ist / Soll nach Tagesziel, falls hinterlegt)');
  z.push(tabelle(['KPI', 'Woche', 'Monat'], p.tracker.woche.kpis.map((k, i) => [k.label.replace(' (EUR)', ''), kz(k), kz(p.tracker.monat.kpis[i])])));
  const stufen = K.STUFEN.filter(st => [p.woche, p.monat].some(x => x && x.stufen && x.stufen[st]));
  if (stufen.length) {
    const nv = (per, st, inhalt) => (st === 'Opening' && !ov[per] ? 'n. vergl.' : inhalt);
    z.push('Erfolgsquote je Stufe (codierte Gespräche)');
    z.push(tabelle(['Stufe', 'Woche', 'Vorwoche', 'Monat', 'Oktober'], stufen.map(st => [st, q(p.woche && p.woche.stufen[st]),
      nv('vorwoche', st, q(p.vorwoche && p.vorwoche.stufen[st])), nv('monat', st, q(p.monat && p.monat.stufen[st])),
      st === 'Opening' ? 'n. vergl.' : q(p.oktober && p.oktober.stufen[st])])));
    const mz = [];
    for (const st of stufen) for (const [k, label] of K.MERKMALE) {
      if (MERKMAL_STUFE[k] && !MERKMAL_STUFE[k].includes(st)) continue;
      const s = (x) => x && x.stufen[st];
      if (![p.woche, p.monat].some(x => s(x) && s(x).merkmale[k])) continue;
      mz.push([`${st.slice(0, 4)}.: ${label}`, mq(s(p.woche), k), nv('vorwoche', st, mq(s(p.vorwoche), k)), nv('monat', st, mq(s(p.monat), k)), st === 'Opening' ? 'n. vergl.' : mq(s(p.oktober), k)]);
    }
    z.push('Verhaltensmerkmale');
    z.push(tabelle(['Merkmal', 'Woche', 'Vorwoche', 'Monat', 'Oktober'], mz));
    z.push('Top-3-Gründe je Bruchstelle (Woche | Monat)');
    for (const st of stufen) {
      const g = (x) => { const s = x && x.stufen[st]; return s && s.top3.length ? s.top3.map(r => `${r.name} (${r.n}-mal)`).join('; ') : '–'; };
      z.push(`• *${st}* — Woche: ${esc(g(p.woche))} | Monat: ${esc(g(p.monat))}`);
    }
  } else z.push('_Keine codierten Gespräche in Woche oder Monat._');
  if (txt) {
    z.push(`\n*Was war gut*\n${liste(txt.gut)}`);
    z.push(`*Was war schlecht*\n${liste(txt.schlecht)}`);
    const pot = p.potenzial.woche[0] || p.potenzial.monat[0];
    z.push(`*Größtes Potenzial für sofort mehr Umsatz*\n${pot ? hebel(pot, txt.potenzial) : esc(txt.potenzial)}`);
    z.push(`*Was muss geschult werden*\n${liste(txt.schulung)}`);
  } else z.push('_Texte nicht erzeugt._');
  return z.join('\n');
}

function nachrichten(d, texte) {
  return { haupt: haupt(d, texte), personen: d.personen.map(p => person(p, texte.personen[p.vorname], d.openingVergleichbar)) };
}

module.exports = { nachrichten, tabelle };
