// Verknuepft Codierung + Metadaten, bereinigt Namen, ordnet Personen zu. Eingabe: Ergebnisliste [{meta,out}] oder Batch-Ergebnis + run/meta.json.
const fs = require('fs'); const C = require('./code_lib'); const E = require('./lib').E; const OPPS = Object.fromEntries(E.OPPS.map(r => [r.o.id, r]));
const EIGHT = ['Markus Bauer', 'Andreas Buharin', 'Brian Groten', 'Mikail Kotaman', 'Dominik Bous', 'Clemens Näkel', 'Julius Kawka', 'Tobias Böttcher'];
const norm = n => { n = (n || '').replace(/[‎‏]/g, '').trim(); return EIGHT.find(e => e.split(' ')[1].toLowerCase().slice(0, 4) === n.split(' ').slice(-1)[0].toLowerCase().slice(0, 4) && e.split(' ')[0].toLowerCase().slice(0, 3) === n.split(' ')[0].toLowerCase().slice(0, 3)) || n; };
const GEN = new Set(['gmbh', 'group', 'service', 'services', 'partner', 'management', 'technik', 'verwaltung', 'gesellschaft', 'deutschland', 'handel', 'holding', 'gruppe', 'bau', 'systems', 'solutions', 'consulting', 'logistik', 'industrie', 'werke', 'haus', 'immobilien']);
function laden(modus) {
  let rows;
  if (modus === 'probe') rows = require('./run/probe_sonnet.json').map(x => ({ meta: x.meta, out: x.out }));
  else { const meta = require('./run/meta.json'); rows = require('./run/batch_results.json').map(r => ({ meta: meta[r.customId], out: r.out })); }
  rows = rows.filter(r => r.meta && r.out && !r.out.fehler);
  const names = fs.existsSync('run/names_scratch.json') ? require('./run/names_scratch.json') : {};
  // Dokumentfrequenz der Woerter in Freitexten: haeufige Woerter sind keine Namen
  const df = {}; for (const r of rows) for (const w of new Set(((r.out.einzeiler || '') + ' ' + r.out.gruende.map(g => g.freitext).join(' ')).toLowerCase().match(/[a-zäöüß]{4,}/g) || [])) df[w] = (df[w] || 0) + 1;
  let ersetzt = 0;
  const bereinige = (s, tokens) => { let t = s || ''; for (const tok of tokens) { const re = new RegExp('\\b' + tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*', 'gi'); if (re.test(t)) { t = t.replace(re, '[Name]'); ersetzt++; } } return t; };
  return rows.map(r => { const n = names[r.meta.customId] || {}; const tokens = [...new Set([...(n.kunden || []), n.lead || ''].flatMap(x => x.split(/[\s,.&\-\/()]+/)).filter(t => t.length >= 5 && !GEN.has(t.toLowerCase()) && (df[t.toLowerCase()] || 0) <= 3))];
    const o = JSON.parse(JSON.stringify(r.out)); o.einzeiler = bereinige(o.einzeiler, tokens); o.gruende.forEach(g => { g.freitext = bereinige(g.freitext, tokens); });
    const person = norm(r.meta.person); const gr = o.gruende.map(g => { const t = C.gruende.find(x => x.id === g.id); return { ...g, name: t ? t.name : (g.id === 'SONSTIG' ? 'Sonstiger Grund' : g.id), kategorie: t ? t.kategorie : 'Sonstiges', bs: t ? t.bs : null }; });
    const rec = OPPS[r.meta.oppId]; const oppGewonnen = !!(rec && rec.hist.some(e => e.new_status_id === E.S.WON));
    return { ...r.meta, dauer: r.meta.quelle === 'fireflies' ? (r.meta.dauer || 0) * 60 : r.meta.dauer, ...o, oppGewonnen, gruende: gr, person, imKreis: EIGHT.includes(person), vorname: person.split(' ')[0], _ersetzt: ersetzt }; });
}
const vorn = n => { n = (n || '').trim(); if (!n) return '(unbekannt)'; const e = EIGHT.find(x => x === n || norm(n) === x); return e ? e.split(' ')[0] : 'andere'; };
module.exports = { laden, EIGHT, norm, vorn };
if (require.main === module) { const modus = process.argv[2] || 'probe'; const c = laden(modus); fs.writeFileSync(`run/calls_${modus}.json`, JSON.stringify(c));
  console.log('Calls', c.length, '| acht Personen', c.filter(x => x.imKreis).length, '| Namen ersetzt', c.length ? c[c.length - 1]._ersetzt : 0); const z = {}; for (const x of c) z[x.stufe] = (z[x.stufe] || 0) + 1; console.log(JSON.stringify(z)); }
