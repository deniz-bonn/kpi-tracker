const fs = require('fs'); const path = require('path'); const names = require('./run/names_scratch.json');
const OUT = '/Users/denizakpinar/Desktop/Claude-Code-Tools/AE-Tracker_Projekt/exports/oktober-2026/transkript-analyse';
const GEN = new Set(['gmbh', 'group', 'service', 'services', 'partner', 'management', 'technik', 'verwaltung', 'gesellschaft', 'deutschland', 'handel', 'holding', 'gruppe', 'systems', 'solutions', 'consulting', 'logistik', 'industrie', 'werke', 'immobilien']);
const tokens = [...new Set(Object.values(names).flatMap(n => [...(n.kunden || []), n.lead || ''].flatMap(x => x.split(/[\s,.&\-\/()]+/))).filter(t => t.length >= 5 && !GEN.has(t.toLowerCase())).map(t => t.toLowerCase()))];
const files = fs.readdirSync(OUT).filter(f => f.endsWith('.md')); const hits = {};
for (const f of files) { const txt = fs.readFileSync(path.join(OUT, f), 'utf8').toLowerCase(); const words = new Set(txt.match(/[a-zäöüß]{5,}/g) || []); for (const t of tokens) if (words.has(t)) (hits[t] ||= []).push(f); }
const anzahl = Object.keys(hits).length; console.log('Namenstokens', tokens.length, '| Treffer-Woerter in md', anzahl);
// haeufige deutsche Woerter herausfiltern: Wort kommt in vielen Dateien/oft vor -> vermutlich kein Name
const freq = {}; for (const f of files) { const txt = fs.readFileSync(path.join(OUT, f), 'utf8').toLowerCase().match(/[a-zäöüß]{5,}/g) || []; for (const w of txt) freq[w] = (freq[w] || 0) + 1; }
const verd = Object.entries(hits).map(([t, fl]) => [t, [...new Set(fl)].length, freq[t]]).sort((a, b) => a[2] - b[2]); console.log(verd.map(([t, n, c]) => `${t}(${n} Dateien, ${c}x)`).join(', '));
fs.writeFileSync('run/leak_hits.json', JSON.stringify(hits));
