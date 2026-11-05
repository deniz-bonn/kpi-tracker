// Prosa-Abschnitte des Wochenreports mit Opus. Zahlen werden NICHT vom Modell geschrieben:
// Opus bekommt ein Woerterbuch {{schluessel}} -> fertig formatierter Wert und setzt nur Platzhalter.
// Danach ersetzt der Code die Platzhalter; freie Ziffern im Modelltext fuehren zu einem zweiten Versuch,
// danach wird der Abschnitt mit Hinweis uebernommen und im Lauf-Log vermerkt.
const { MODELS, TEAM } = require('./basis');
const { anthropic } = require('./codierung');
const { kosten } = require('./kosten');
const K = require('./kennzahlen');

const fmtP = (q) => (q == null ? 'k. A.' : String(q).replace('.', ',') + ' %');
const fmtZ = (x) => (x == null ? 'k. A.' : Number(x).toLocaleString('de-DE', { maximumFractionDigits: 1 }));
const fmtE = (x) => (x == null ? 'k. A.' : Math.round(Number(x)).toLocaleString('de-DE') + ' €');
const LABEL_P = { W: 'diese Woche', V: 'Vorwoche', M: 'Monat bis heute', O: 'Oktober-Basis' };

/** Flaches Woerterbuch der Zahlen einer Person: Schluessel -> formatierter Text. */
function werteFuerPerson(p) {
  const w = {};
  const per = { W: p.woche, V: p.vorwoche, M: p.monat, O: p.oktober };
  for (const [kz, d] of Object.entries(per)) {
    if (!d) continue;
    w[`${kz}.calls`] = fmtZ(d.nCalls);
    for (const [st, s] of Object.entries(d.stufen || {})) {
      w[`${kz}.${st}.calls`] = fmtZ(s.n);
      w[`${kz}.${st}.erfolg`] = `${fmtP(s.erfolgsquote)} (${s.erfolgJa} von ${s.erfolgBasis})`;
      for (const [m, v] of Object.entries(s.merkmale)) if (v) w[`${kz}.${st}.${m}`] = `${fmtP(v.quote)} (${v.ja} von ${v.basis})`;
      s.top3.forEach((g, i) => { w[`${kz}.${st}.grund${i + 1}`] = `${g.id} ${g.name} (${g.n}×, ${fmtP(g.anteil)} der nicht erfolgreichen)`; });
    }
  }
  for (const [kz, t] of Object.entries({ W: p.tracker.woche, M: p.tracker.monat })) {
    for (const k of t.kpis) {
      w[`${kz}.kpi.${k.key}`] = k.key === 'ae' ? fmtE(k.ist) : fmtZ(k.ist);
      if (k.pace) w[`${kz}.kpi.${k.key}.soll`] = (k.key === 'ae' ? fmtE(k.pace.soll) : fmtZ(k.pace.soll)) + ` (Erreichung ${fmtP(k.pace.erreichung)})`;
    }
  }
  for (const [kz, liste] of Object.entries({ W: p.potenzial.woche, M: p.potenzial.monat })) {
    liste.forEach((h, i) => {
      const b = `${kz}.pot${i + 1}`;
      w[`${b}.hebel`] = h.text;
      w[`${b}.pool`] = fmtZ(h.pool);
      w[`${b}.vergleichsquote`] = `${fmtP(h.vergleichsquote)} (Basis ${h.vergleichsBasis} Gespräche)`;
      w[`${b}.zusatzDeals`] = fmtZ(h.zusatzDeals);
      w[`${b}.dealWert`] = fmtE(h.dealWert);
      w[`${b}.umsatz`] = fmtE(h.umsatz);
      w[`${b}.umsatzKonservativ`] = fmtE(h.umsatzKonservativ);
      w[`${b}.rechnung`] = rechnungText(h);
    });
  }
  return w;
}

function rechnungText(h) {
  if (h.stufe === 'Setting') return `${fmtZ(h.pool)} Settings × ${fmtP(h.vergleichsquote)} SC-Quote × ${fmtP(h.scZuWon)} SC-Gewinnquote × ${fmtE(h.dealWert)} Ø Deal = ${fmtE(h.umsatz)} (obere Grenze; konservativ halbiert ${fmtE(h.umsatzKonservativ)})`;
  if (h.stufe === 'Opening') return `${fmtZ(h.pool)} Openings × ${fmtP(h.vergleichsquote)} Terminquote × ${fmtP(h.settingZuSc)} Setting→SC × ${fmtP(h.scZuWon)} SC-Gewinnquote × ${fmtE(h.dealWert)} Ø Deal = ${fmtE(h.umsatz)} (obere Grenze; konservativ halbiert ${fmtE(h.umsatzKonservativ)})`;
  return `${fmtZ(h.pool)} Sales Calls × ${fmtP(h.vergleichsquote)} Gewinnquote mit Abschlussversuch × ${fmtE(h.dealWert)} Ø Deal = ${fmtE(h.umsatz)} (obere Grenze; konservativ halbiert ${fmtE(h.umsatzKonservativ)})`;
}

const REGELN = `Regeln:
- Zahlen schreibst du NIE selbst. Jede Zahl, Quote oder jeder Betrag kommt ausschliesslich als Platzhalter {{schluessel}} aus dem Woerterbuch "werte" (exakt so geschrieben). Auch keine Zahlwoerter fuer Mengen. Grund-Codes wie B2-13 sind erlaubt.
- Jede inhaltliche Aussage braucht mindestens einen Platzhalter als Beleg. Vergleiche Woche mit Vorwoche (V.*), Monat (M.*) und Oktober-Basis (O.*), wo es hilft.
- Ist eine Basis klein (unter 10 Gespraeche), schreibe "dünn belegt".
- Opening-Werte gibt es nur fuer Zeitraeume ab 31.10. (vorher nur Leads mit spaeterem Termin). Fehlt ein Opening-Wert fuer Vorwoche oder Oktober, ist er "nicht vergleichbar" — dann nicht vergleichen.
- Potenzial-Rechnungen sind eine obere Grenze (Auswahleffekt); nenne immer auch den konservativen Wert.
- Schreibe Merkmale mit deutschen Begriffen (z. B. "Closing aktiv angeboten", "Terminfrage gestellt"), NIE mit technischen Feldnamen wie closing_aktiv_angeboten.
- AE wird dem Closer gutgeschrieben; bei Openern und Settern ist "AE beteiligt" angegeben. Werte zwischen Tracker und Codierung nicht gegeneinander aufrechnen.
- Closing: "erfolgreich" heisst Abschluss im Call oder spaeter laut Close gewonnen. Closing-Aufnahmen decken nur einen Teil der Sales Calls ab.
- Mitarbeiter nur mit Vornamen. Keine Kunden- oder Firmennamen, keine Zitate. Sachlich, knapp, ohne Wertung der Person, auf Deutsch.
- Fehlen Daten (k. A.), sag das, statt etwas zu erfinden.`;

const SYS_PERSON = `Du schreibst Abschnitte eines woechentlichen Coaching-Reports fuer einen Vertriebsmitarbeiter eines B2B-Teams (Personalgewinnung, Bonn). Grundlage sind NUR die uebergebenen Kennzahlen (Tracker-KPIs gegen Tagesziel-Pace und Transkript-Codierung: Erfolgsquote je Stufe, Verhaltensmerkmale, Top-Gruende).
Merkmale (Schluessel -> deutscher Begriff): entscheider_im_gespraech -> Entscheider im Gespraech; ma_fragte_aktiv_nach_termin -> aktiv nach Termin gefragt; naechster_schritt_mit_datum -> naechster Schritt mit Datum; abschlussfrage_gestellt -> Terminfrage gestellt (Opening/Setting); closing_aktiv_angeboten -> Closing aktiv angeboten (nur Setting); termin_verbindlich_fixiert -> Termin verbindlich fixiert (Opening/Setting); abschluss_aktiv_versucht -> Abschluss aktiv versucht (nur Closing).
${REGELN}
Abschnitte:
- gut: 2 bis 4 Stichpunkte, was gut war.
- schlecht: 2 bis 4 Stichpunkte, was schlecht war.
- potenzial: ein Absatz zum groessten Potenzial fuer sofort mehr Umsatz. Nimm den Hebel W.pot1 (falls fehlend M.pot1), nenne die Rechnung mit {{W.pot1.rechnung}} bzw. {{M.pot1.rechnung}} und erklaere in einem Satz, was der Hebel im Gespraech bedeutet. Gibt es keinen Hebel, sag das.
- schulung: hoechstens drei Punkte, was geschult werden muss: jeweils was genau anders gesagt oder getan wird, woran man es im Gespraech erkennt, und welches Verhaltensmerkmal (mit Platzhalter) sich bewegen soll.`;

const SYS_TEAM = `Du schreibst Teile eines woechentlichen Team-Reports (Vertrieb Bonn, acht Personen). Grundlage sind NUR die uebergebenen Kennzahlen.
${REGELN}
Abschnitte:
- hebel: genau drei Stichpunkte, die drei groessten Hebel fuer das Team (aus den Platzhaltern T.hebel1..3 mit Rechnung, ergaenzt um die Ziel-Kennzahl derselben Stufe gegen das November-Ziel). Gruende nur aus derselben Stufe nennen. Knapp: hoechstens drei Saetze je Hebel.
- verbleib: ein Absatz (4 bis 6 Saetze): Warum gibt es bei den gefuehrten Settings und Closings kein Ergebnis, und was muss sich aendern. Stuetze dich auf die Verbleib-Kennzahlen und die Gruende.`;

const SCHEMA_PERSON = { type: 'object', additionalProperties: false, required: ['gut', 'schlecht', 'potenzial', 'schulung'],
  properties: { gut: { type: 'array', items: { type: 'string' } }, schlecht: { type: 'array', items: { type: 'string' } },
    potenzial: { type: 'string' }, schulung: { type: 'array', items: { type: 'string' } } } };
const SCHEMA_TEAM = { type: 'object', additionalProperties: false, required: ['hebel', 'verbleib'],
  properties: { hebel: { type: 'array', items: { type: 'string' } }, verbleib: { type: 'string' } } };

const PLATZ = /\{\{\s*([^}]+?)\s*\}\}/g;
function einsetzen(text, werte) {
  const fehlend = [];
  // Verstuemmelte Platzhalter reparieren, z. B. "{{W.Closing.x}`` ``}}" -> "{{W.Closing.x}}"
  const repariert = String(text).replace(/\{\{\s*([\w.\-]+)[\s\S]*?\}\}/g, '{{$1}}');
  let out = repariert.replace(PLATZ, (_, k) => { if (werte[k] == null) { fehlend.push(k); return 'k. A.'; } return werte[k]; });
  if (/\{\{|\}\}/.test(out)) { fehlend.push('(Klammerrest)'); out = out.replace(/\{\{|\}\}/g, ''); }
  return { out, fehlend };
}
/** Freie Ziffern im Modelltext (ohne Platzhalter und Grund-Codes). */
const freieZiffern = (text) => text.replace(PLATZ, '').replace(/\bB\d-\d{2}\b/g, '').replace(/\bSONSTIG\b/g, '').match(/\d/g) || [];

async function opus(system, user, schema, label) {
  const cfg = MODELS.texte;
  const params = { model: cfg.model, max_tokens: cfg.max_tokens, system,
    output_config: { effort: cfg.effort, format: { type: 'json_schema', schema } }, messages: [{ role: 'user', content: user }] };
  let msg;
  try {
    msg = await anthropic().beta.messages.stream({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: cfg.fallbacks || 'default' }).finalMessage();
  } catch (e) {
    // Fallback-Parameter nicht verfuegbar: ohne erneut versuchen (Ablehnungen werden dann unten gemeldet).
    if (e && e.status === 400 && /fallback/i.test(String(e.message))) msg = await anthropic().messages.stream(params).finalMessage();
    else throw e;
  }
  if (msg.stop_reason === 'refusal') throw new Error(`${label}: Modell hat abgelehnt (${(msg.stop_details || {}).category || 'ohne Kategorie'})`);
  if (msg.stop_reason === 'max_tokens') throw new Error(`${label}: Ausgabe abgeschnitten (max_tokens)`);
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return { json: JSON.parse(text), usd: kosten(cfg.model, msg.usage, false), model: msg.model };
}

/** Erzeugt Abschnitte mit Platzhalter-Pruefung (ein zweiter Versuch bei freien Ziffern). */
async function erzeuge(system, werte, kontext, schema, label, warnungen) {
  let usd = 0;
  const user = `werte (Platzhalter -> Wert):\n${JSON.stringify(werte)}\n\nKontext (nur Deutung, keine Zahlen daraus uebernehmen):\n${JSON.stringify(kontext)}`;
  let r = await opus(system, user, schema, label); usd += r.usd;
  const alleTexte = (j) => Object.values(j).flat().join(' ');
  if (freieZiffern(alleTexte(r.json)).length) {
    const r2 = await opus(system, user + '\n\nACHTUNG: Im ersten Entwurf standen Ziffern ausserhalb von Platzhaltern. Schreibe jede Zahl ausschliesslich als {{schluessel}}.', schema, label);
    usd += r2.usd; r = r2;
    if (freieZiffern(alleTexte(r.json)).length) warnungen.push(`${label}: freie Ziffern im Text trotz zweitem Versuch`);
  }
  const fehlend = [];
  const ersetze = (v) => (Array.isArray(v) ? v.map(ersetze) : (() => { const e = einsetzen(v, werte); fehlend.push(...e.fehlend); return e.out; })());
  const out = Object.fromEntries(Object.entries(r.json).map(([k, v]) => [k, ersetze(v)]));
  if (fehlend.length) warnungen.push(`${label}: unbekannte Platzhalter ${[...new Set(fehlend)].join(', ')}`);
  return { out, usd };
}

async function personText(p, warnungen) {
  const werte = werteFuerPerson(p);
  const kontext = { vorname: p.vorname, rolle: p.rolle, funktionen: p.funktionen, legende: LABEL_P,
    stufenMitDaten: { woche: Object.keys((p.woche || {}).stufen || {}), monat: Object.keys((p.monat || {}).stufen || {}) } };
  return erzeuge(SYS_PERSON, werte, kontext, SCHEMA_PERSON, 'Text ' + p.vorname, warnungen);
}

function werteFuerTeam(d) {
  const w = {};
  d.team.hebel.forEach((h, i) => { w[`T.hebel${i + 1}`] = h.text; w[`T.hebel${i + 1}.rechnung`] = rechnungText(h); w[`T.hebel${i + 1}.umsatz`] = fmtE(h.umsatz); });
  for (const [kz, liste] of Object.entries(d.team.zielKennzahlen)) {
    for (const z of liste) w[`T.${kz}.${z.stufe}.ziel`] = `${z.label}: ${fmtP(z.quote)} (${z.ja} von ${z.basis}) gegen Ziel ${fmtP(z.ziel)}`;
  }
  for (const [kz, v] of Object.entries({ W: d.verbleib.woche, M: d.verbleib.monat })) {
    w[`V.${kz}.settingsOhneErgebnis`] = fmtZ(v.settingsOhneErgebnis);
    w[`V.${kz}.closingsOhneErgebnis`] = fmtZ(v.closingsOhneErgebnis);
    w[`V.${kz}.fuWert`] = fmtE(v.fuWert);
    w[`V.${kz}.fuAnzahl`] = fmtZ(v.fuAnzahl);
    w[`V.${kz}.fuStattTerminAnteil`] = fmtP(v.fuStattTerminAnteil);
  }
  const g = d.verbleib.woche.gesamtListe;
  w['V.liste.opportunities'] = fmtZ(g.opportunities); w['V.liste.wert'] = fmtE(g.wert); w['V.liste.followUpStattTermin'] = fmtZ(g.followUpStattTermin);
  for (const [b, n] of Object.entries(g.jeBedingung)) w[`V.liste.bedingung_${b}`] = fmtZ(n);
  const gruende = {};
  for (const z of d.verbleib.zeilen) if (z.grund_id) gruende[z.grund_id] = (gruende[z.grund_id] || 0) + 1;
  Object.entries(gruende).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([id, n], i) => { w[`V.grund${i + 1}`] = `${id} ${K.grundName(id)} (${n}×)`; });
  return w;
}

async function teamText(d, warnungen) {
  const kontext = { bedingungen: { a: 'kein nächster Schritt (Status seit > 5 Werktagen, keine datierte Aufgabe)', b: 'Closing stattgefunden ohne Ergebnis',
    c: 'Setting stattgefunden ohne Ergebnis', d: 'Follow-Up akzeptiert statt Termin (qualifizierter Lead, Wiedervorlage > 14 Tage oder undatiert)' },
  zielQuelle: 'November-Ziele: ' + TEAM.november_ziele.kennzahlen.map(z => `${z.stufe} ${z.label} ${z.ziel} %`).join(', ') };
  return erzeuge(SYS_TEAM, werteFuerTeam(d), kontext, SCHEMA_TEAM, 'Text Team', warnungen);
}

/** Pruefen, ob die konfigurierten Modell-IDs gueltig sind (Models-API). Wirft mit klarer Meldung. */
async function pruefeModelle() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY ist nicht gesetzt (Railway-Variablen des Dienstes pruefen)');
  const ids = [...new Set([MODELS.codierung.model, MODELS.texte.model])];
  const ungueltig = [];
  for (const id of ids) {
    try { await anthropic().models.retrieve(id); } catch (e) {
      if (e && (e.status === 401 || e.status === 403)) throw new Error(`ANTHROPIC_API_KEY wird abgelehnt (HTTP ${e.status}) — Schluessel pruefen`);
      if (e && e.status === 404) ungueltig.push(id);
      else throw new Error(`Models-API nicht erreichbar beim Pruefen von ${id}: ${e && e.status ? 'HTTP ' + e.status + ' ' : ''}${String(e && e.message).slice(0, 120)}`);
    }
  }
  if (ungueltig.length) throw new Error('Ungueltige Modell-ID(s) in config/analyse/models.json: ' + ungueltig.join(', '));
  return ids;
}

module.exports = { personText, teamText, pruefeModelle, werteFuerPerson, rechnungText, fmtP, fmtZ, fmtE, freieZiffern };
