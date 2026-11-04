const fs = require('fs'); const L = require('./lib'); const E = L.E;
const t = require('./taxo/taxonomie.json'); const zu = require('./ff/zuordnung.json'); const doms = require('./ff/lead_domains.json');
// Namens-Check gegen alle Kundennamen der Leads
const namen = [...new Set(Object.values(doms).flatMap(d => (d.name || '').split(/[\s,.&\-\/()]+/)).filter(x => x.length >= 6 && !/gmbh|gesellschaft|verwaltung|service|group|holding|deutschland|technik|handel|bau/i.test(x)).map(x => x.toLowerCase()))];
const blob = JSON.stringify(t).toLowerCase(); const treffer = namen.filter(n => blob.includes(n)); if (treffer.length) console.log('WARNUNG Namens-Treffer in Taxonomie:', treffer.slice(0, 10).join(', '));
const esc = s => String(s).replace(/\|/g, '/').replace(/\n/g, ' ');
let md = `# Ursachen-Taxonomie Oktober 2026 — ENTWURF zur Freigabe\n\nAbgeleitet aus 60 zufällig gezogenen Gesprächen (48 Close-Aufnahmen, 12 Fireflies-Videocalls) über alle Stufen und Personen, offen codiert mit Opus, danach zur Taxonomie verdichtet. Keine Kundennamen, keine Zitate. Die Häufigkeiten gelten nur für diese Stichprobe und sind keine Quoten.\n\nKategorien: **Prozess** = Terminierungsregeln, Bestätigung, Nachfassen · **Gesprächsführung** = Qualifizieren, Abschlussfrage, Einwandbehandlung · **Lead-Qualität** = Zielgruppe, Bedarf, Budget des Kunden.\n`;
for (const b of t.bruchstellen) { md += `\n## ${b.id} ${b.name}\n\n${b.beschreibung}\n\n| ID | Grund | Kategorie | Definition (woran man ihn erkennt) | Signal (paraphrasiert) | n in Stichprobe | Quelle |\n|---|---|---|---|---|---|---|\n`;
  for (const g of b.gruende) md += `| ${g.id} | ${esc(g.name)} | ${g.kategorie} | ${esc(g.definition)} | ${esc(g.signal)} | ${g.n_stichprobe} | ${g.aus_pflichtliste ? 'Pflichtliste' : 'neu induziert'} |\n`; }
md += `\n## Ergebniswerte je Stufe\n`; for (const s of t.ergebnisse_je_stufe) { md += `\n**${s.stufe}**\n\n`; for (const w of s.werte) md += `- **${w.wert}**: ${w.definition}\n`; }
md += `\n## Ja/Nein-Merkmale je Call\n\n`; for (const m of t.merkmale) md += `- **${m.name}**: ${m.definition}\n`;
md += `\n## Abdeckung der Pflichtliste\n\n| Grund aus der Pflichtliste | in Stichprobe beobachtet | umgesetzt als |\n|---|---|---|\n`; for (const p of t.pflichtliste_abdeckung) md += `| ${esc(p.grund_aus_pflichtliste)} | ${p.in_stichprobe_beobachtet} | ${esc(p.umgesetzt_als)} |\n`;
md += `\n## Zusammengelegt oder umgedeutet\n\n` + t.gestrichen_oder_zusammengelegt.map(x => `- ${x}`).join('\n') + `\n\n## Lücken der Stichprobe\n\n` + t.luecken_der_stichprobe.map(x => `- ${x}`).join('\n') + '\n';
fs.writeFileSync('/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/exports/oktober-2026/transkript-analyse/taxonomie_ENTWURF.md', md);
console.log('Entwurf geschrieben,', md.length, 'Zeichen,', t.bruchstellen.reduce((s, b) => s + b.gruende.length, 0), 'Gruende');
// Offene SC Statt. FU je Closer: wie viele mit Fireflies-Aufnahme?
const belegt = new Set(zu.filter(z => z.stufe === 'sicher' || z.stufe.startsWith('wahr')).map(z => z.leadId));
const OFFEN = E.S.SC_STATT_FU; const res = {};
for (const rec of E.OPPS) { if (rec.o.status_id !== OFFEN) continue; const sc = rec.termine.filter(x => x.art === 'closing' && x.am.startsWith('2026-10')).pop(); if (!sc) continue;
  const last = rec.hist[rec.hist.length - 1]; const seit = last ? E.ymd(last.date_created) : E.ymd(rec.o.date_created); if (E.kalendertage(seit, E.HEUTE) <= 5) continue;
  const n = E.closerVon(sc).name || '(unbekannt)'; const R = res[n] ||= { offen: 0, mitFF: 0 }; R.offen++; if (belegt.has(rec.o.lead_id)) R.mitFF++; }
console.log('Offene SC Statt. FU (>5 Tage) je Closer, davon mit Fireflies-Aufnahme:', JSON.stringify(res));
