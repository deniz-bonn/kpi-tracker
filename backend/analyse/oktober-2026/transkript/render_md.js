// Deterministische Markdown-Bausteine fuer die Reports (keine LLM-Zahlen).
const fs = require('fs'); const ROLLEN = { 'Markus Bauer': 'Hybrid, Opener und Setter', 'Andreas Buharin': 'Hybrid, Opener und Setter', 'Brian Groten': 'Opener, teilweise Setter', 'Mikail Kotaman': 'Opener', 'Dominik Bous': 'Opener', 'Clemens Näkel': 'Setter', 'Julius Kawka': 'Closer', 'Tobias Böttcher': 'Closer' };
const BSN = { Opening: 'B1 Opening ohne Setting', Setting: 'B2 Setting ohne Closing-Termin', Closing: 'B5 Sales Call ohne Abschluss', Nachfassung: 'B6 Nachfassung ohne Fortschritt' };
const f1 = v => v == null ? '–' : String(v).replace('.', ','); const p = v => v == null ? '–' : f1(v) + ' %';
function zahlen(st, sonstigesArten, nSonst) {
  let md = `### Calls je Stufe\n\n| Stufe | Calls | in Hauptquote | niedrige Konfidenz | Stufe erfolgreich |\n|---|---|---|---|---|\n`;
  for (const [k, s] of Object.entries(st)) md += `| ${k} | ${s.n} | ${s.nBase} | ${s.nNiedrig} | ${p(s.erfolgsquote)} (${s.erfolgJa} von ${s.erfolgJa + s.erfolgNein}) |\n`;
  md += `\n### Gespraechsmerkmale (Basis: Hauptquote)\n\n| Stufe | Entscheider im Gespraech | aktiv nach Termin gefragt | naechster Schritt mit Datum | Abschlussfrage gestellt | Closing aktiv angeboten | Termin verbindlich fixiert | Abschluss aktiv versucht |\n|---|---|---|---|---|---|---|---|\n`;
  for (const [k, s] of Object.entries(st)) { const q = x => x && (x.ja + x.nein) > 0 ? `${p(x.quote)} (${x.ja}/${x.ja + x.nein})` : '–'; md += `| ${k} | ${p(s.entscheider.quote)} | ${p(s.aktivNachTermin.quote)} | ${p(s.schrittMitDatum.quote)} | ${q(s.abschlussfrage)} | ${q(s.closingAngeboten)} | ${q(s.terminFixiert)} | ${q(s.abschlussVersucht)} |\n`; }
  md += `\n### Redeanteil und Dauer\n\n| Stufe | Redeanteil MA Ø | erfolgreich | nicht erfolgreich | Dauer Ø (Min) | erfolgreich | nicht erfolgreich |\n|---|---|---|---|---|---|---|\n`;
  for (const [k, s] of Object.entries(st)) md += `| ${k} | ${p(s.redeanteil.alle)} | ${p(s.redeanteil.erfolg)} | ${p(s.redeanteil.nichtErfolg)} | ${f1(s.dauerMin.alle)} | ${f1(s.dauerMin.erfolg)} | ${f1(s.dauerMin.nichtErfolg)} |\n`;
  md += `\n### Ergebnisverteilung\n\n`; for (const [k, s] of Object.entries(st)) md += `- **${k}**: ` + Object.entries(s.ergebnis).sort((a, b) => b[1] - a[1]).map(([e, n]) => `${e} ${n}`).join(' · ') + '\n';
  md += `\n### Sonstiges (eigene Kategorie)\n\n${nSonst} Calls, nach Art: ` + (Object.keys(sonstigesArten || {}).length ? Object.entries(sonstigesArten).map(([k, n]) => `${k.replace('Sonstiges_', '').replace(/_/g, '/')} ${n}`).join(' · ') : 'keine') + '\n';
  return md;
}
function gruende(st) {
  let md = '';
  for (const [k, s] of Object.entries(st)) { if (!s.erfolgNein) continue; md += `\n### ${BSN[k]} (${s.erfolgNein} nicht erfolgreiche Calls in der Hauptquote${s.niedrigGruende ? `, zusätzlich ${s.niedrigGruende} niedrig-konfidente Gruende separat` : ''})\n\n| # | Grund | Kategorie | Calls | Anteil |\n|---|---|---|---|---|\n`;
    s.topGruende.forEach((g, i) => { md += `| ${i + 1} | ${g.id} ${g.name} | ${g.kat} | ${g.n} | ${p(g.anteil)} |\n`; });
    const bsp = s.topGruende.filter(g => g.bsp.length); if (bsp.length) { md += `\n**Beispiele (paraphrasiert, ohne Namen):**\n\n`; for (const g of bsp) { md += `- *${g.id} ${g.name}*\n` + g.bsp.slice(0, 4).map(e => `  - ${e}`).join('\n') + '\n'; } } }
  return md || '\n_Keine nicht erfolgreichen Calls in der Hauptquote._\n';
}
module.exports = { zahlen, gruende, ROLLEN, BSN, p, f1 };
