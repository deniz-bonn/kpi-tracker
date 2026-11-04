const fs = require('fs'); const L = require('./lib'); const E = L.E; const C = require('./code_lib'); const J = require('./join');
const modus = process.argv[2] || 'probe'; const calls = JSON.parse(fs.readFileSync(`run/calls_${modus}.json`)); const R = JSON.parse(fs.readFileSync('run/regeln.json'));
const EIGHT = J.EIGHT; const okt = s => !!s && s.startsWith('2026-10');
const BS = { Opening: 'B1', Setting: 'B2', Closing: 'B5', Nachfassung: 'B6' };
const info = Object.fromEntries(C.gruende.map(g => [g.id, g])); const base = c => c.konfidenz !== 'niedrig';
const avg = a => a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length * 10) / 10 : null; const pct = (a, b) => b ? Math.round(1000 * a / b) / 10 : null;
const cnt = (a, f) => a.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
function stat(list, stufe) {
  const b = list.filter(base); const n = list.length;
  // Closing: erfolgreich = Abschluss im Call ODER Opportunity laut Close gewonnen; Gruende nur fuer nicht gewonnene
  const f = stufe === 'Closing' ? b.filter(c => c.erfolg === 'nein' && !c.oppGewonnen) : b.filter(c => c.erfolg === 'nein'), s = stufe === 'Closing' ? b.filter(c => c.erfolg === 'ja' || c.oppGewonnen) : b.filter(c => c.erfolg === 'ja');
  const jn = (k) => { const ja = b.filter(c => c[k] === 'ja').length, nein = b.filter(c => c[k] === 'nein').length; return { ja, nein, quote: pct(ja, ja + nein) }; };
  const r = {}; for (const c of f) for (const g of c.gruende.slice(0, 2)) { if (g.konfidenz === 'niedrig') continue; const k = g.id === 'SONSTIG' ? 'SONSTIG' : g.id; (r[k] ||= { id: k, n: 0, bsp: [] }).n++; if (g.konfidenz === 'hoch' && c.konfidenz === 'hoch' && c.einzeiler && r[k].bsp.length < 5) r[k].bsp.push(c.einzeiler); }
  const top = Object.values(r).sort((a, b) => b.n - a.n).slice(0, 5).map(x => ({ ...x, name: x.id === 'SONSTIG' ? 'Sonstiger Grund (Freitext)' : info[x.id].name, kat: x.id === 'SONSTIG' ? '-' : info[x.id].kategorie, anteil: pct(x.n, f.length) }));
  const niedrigGruende = f.reduce((m, c) => m + c.gruende.filter(g => g.konfidenz === 'niedrig').length, 0);
  return { stufe, n, nBase: b.length, oppGewonnen: b.filter(c => c.oppGewonnen).length, abschlussImCall: b.filter(c => c.erfolg === 'ja').length, nNiedrig: n - b.length, ergebnis: cnt(b, c => c.ergebnis), erfolgJa: s.length, erfolgNein: f.length, erfolgsquote: pct(s.length, s.length + f.length),
    entscheider: { ja: b.filter(c => c.entscheider_im_gespraech === 'ja').length, nein: b.filter(c => c.entscheider_im_gespraech === 'nein').length, unklar: b.filter(c => c.entscheider_im_gespraech === 'unklar').length, quote: pct(b.filter(c => c.entscheider_im_gespraech === 'ja').length, b.length) },
    aktivNachTermin: { ja: b.filter(c => c.ma_fragte_aktiv_nach_termin === 'ja').length, quote: pct(b.filter(c => c.ma_fragte_aktiv_nach_termin === 'ja').length, b.length) },
    schrittMitDatum: { ja: b.filter(c => c.naechster_schritt_mit_datum === 'ja').length, quote: pct(b.filter(c => c.naechster_schritt_mit_datum === 'ja').length, b.length) },
    abschlussfrage: jn('abschlussfrage_gestellt'), closingAngeboten: jn('closing_aktiv_angeboten'), terminFixiert: jn('termin_verbindlich_fixiert'), abschlussVersucht: jn('abschluss_aktiv_versucht'),
    redeanteil: { alle: avg(b.map(c => c.redeanteil).filter(x => x != null)), erfolg: avg(s.map(c => c.redeanteil).filter(x => x != null)), nichtErfolg: avg(f.map(c => c.redeanteil).filter(x => x != null)) },
    dauerMin: { alle: avg(b.map(c => c.dauer / 60)), erfolg: avg(s.map(c => c.dauer / 60)), nichtErfolg: avg(f.map(c => c.dauer / 60)) },
    topGruende: top, niedrigGruende, freitexte: f.flatMap(c => c.gruende.filter(g => g.id === 'SONSTIG' && g.konfidenz !== 'niedrig').map(g => g.freitext)) };
}
const out = { modus, gesamt: calls.length, personen: {}, team: {}, kreuz: {} };
for (const p of EIGHT) { const cs = calls.filter(c => c.person === p); const o = { person: p, vorname: p.split(' ')[0], nCalls: cs.length, nSonstiges: cs.filter(c => /^Sonstiges/.test(c.stufe)).length, sonstigesArten: cnt(cs.filter(c => /^Sonstiges/.test(c.stufe)), c => c.stufe), niedrigGesamt: cs.filter(c => !base(c)).length, stufen: {} };
  for (const st of ['Opening', 'Setting', 'Closing', 'Nachfassung']) { const l = cs.filter(c => c.stufe === st); if (l.length) o.stufen[st] = stat(l, st); } out.personen[p] = o; }
const eight = calls.filter(c => c.imKreis); out.team.nCalls = eight.length; out.team.stufen = {}; out.team.sonstigesArten = cnt(eight.filter(c => /^Sonstiges/.test(c.stufe)), c => c.stufe);
for (const st of ['Opening', 'Setting', 'Closing', 'Nachfassung']) out.team.stufen[st] = stat(eight.filter(c => c.stufe === st), st);
out.team.konfidenz = cnt(eight, c => c.konfidenz); out.team.konfidenzGruende = cnt(eight.flatMap(c => c.gruende), g => g.konfidenz);
// Welcher Grund kostet am meisten Termine
const settingsAlle = R.settings.length, scRate = pct(R.settings.filter(s => s.scGelegt).length, settingsAlle) / 100;
const verl = {}; for (const st of ['Opening', 'Setting', 'Closing', 'Nachfassung']) for (const c of eight.filter(c => c.stufe === st && base(c) && c.erfolg === 'nein')) for (const g of c.gruende.slice(0, 2)) { if (g.konfidenz === 'niedrig') continue; const k = (g.id === 'SONSTIG' ? 'SONSTIG-' + BS[st] : g.id); const v = verl[k] ||= { id: k, bs: BS[st], n: 0, scAequiv: 0 }; v.n++; v.scAequiv += st === 'Setting' ? 1 : st === 'Opening' ? scRate : 0; }
out.team.kostenTermine = Object.values(verl).map(v => ({ ...v, name: info[v.id] ? info[v.id].name : 'Sonstiger Grund', kat: info[v.id] ? info[v.id].kategorie : '-', scAequiv: Math.round(v.scAequiv * 10) / 10 })).sort((a, b) => b.scAequiv - a.scAequiv || b.n - a.n);
out.team.settingToScRate = scRate;
const katSumme = {}; for (const v of out.team.kostenTermine) { const k = v.bs + '|' + v.kat; katSumme[k] = (katSumme[k] || 0) + v.n; } out.team.kategorien = katSumme;
// Hypothesen: nur qualifizierte Gespraeche (Entscheider + Bedarf), Quote aus vergleichbaren Gespraechen MIT dem Verhalten; obere Grenze und konservativ (halbiert, wegen Auswahleffekt)
const qual = c => c.entscheider_im_gespraech === 'ja' && c.bedarf_bestaetigt === 'ja'; const rate = (a, f) => a.length ? a.filter(f).length / a.length : 0; const r1 = x => Math.round(x * 10) / 10;
const sc = eight.filter(c => c.stufe === 'Setting' && base(c)), op = eight.filter(c => c.stufe === 'Opening' && base(c)); const skala = sc.length ? settingsAlle / sc.length : 0;
const h1pool = sc.filter(c => qual(c) && c.closing_aktiv_angeboten === 'nein' && c.erfolg === 'nein'), h1rate = rate(sc.filter(c => qual(c) && c.closing_aktiv_angeboten === 'ja'), c => c.erfolg === 'ja');
const h2pool = sc.filter(c => c.entscheider_im_gespraech !== 'ja' && c.bedarf_bestaetigt === 'ja' && c.erfolg === 'nein'), h2rate = rate(sc.filter(qual), c => c.erfolg === 'ja');
const h3pool = op.filter(c => c.abschlussfrage_gestellt === 'nein' && c.erfolg === 'nein'), h3rate = rate(op.filter(c => c.abschlussfrage_gestellt === 'ja' && c.entscheider_im_gespraech === 'ja'), c => c.erfolg === 'ja');
const mk = (name, pool, rt, faktor, text) => ({ name, text, poolGroesse: pool.length, vergleichsquote: Math.round(rt * 1000) / 10, zusaetzlicheScObereGrenze: r1(pool.length * rt * faktor), zusaetzlicheScKonservativ: r1(pool.length * rt * faktor / 2) });
out.team.hypothesen = [mk('Closing im Setting aktiv anbieten (B2-13)', h1pool, h1rate, skala, 'Qualifizierte Settings (Entscheider + Bedarf bestaetigt) ohne aktives Closing-Angebot, die nicht zum SC fuehrten; Vergleichsquote = SC-Quote qualifizierter Settings MIT aktivem Angebot.'),
  mk('Entscheider im Setting sicherstellen (B2-01/02)', h2pool, h2rate, skala, 'Settings mit bestaetigtem Bedarf, aber ohne Entscheider im Gespraech, die nicht zum SC fuehrten; Vergleichsquote = SC-Quote qualifizierter Settings.'),
  mk('Im Opening aktiv um den Termin bitten (B1-09)', h3pool, h3rate, scRate, 'Opening-Calls ohne Termin- bzw. Abschlussfrage; Vergleichsquote = Setting-Quote von Openings MIT Abschlussfrage und Entscheider; Setting-Gewinn wird mit der Setting-zu-SC-Quote aus Close umgerechnet.')];
out.team.settingsAlleOkt = settingsAlle; out.team.settingsCodiertBasis = sc.length;
fs.writeFileSync(`run/stats_${modus}.json`, JSON.stringify(out, null, 1));
console.log('Stats', modus, '| Calls', calls.length, '| Team-Stufen', Object.entries(out.team.stufen).map(([k, v]) => k + ':' + v.n).join(' '), '| Hypothesen', out.team.hypothesen.map(h => h.zusaetzlicheScProMonat).join('/'));
