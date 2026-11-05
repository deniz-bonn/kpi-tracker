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
      s.top3.forEach((g, i) => { w[`${kz}.${st}.grund${i + 1}`] = `${g.name} (${g.n}-mal)`; });
      for (const [k, v] of Object.entries(s.qualitaet || {})) if (v && v.basis) w[`${kz}.${st}.q.${k}`] = `${v.ja} von ${v.basis}`;
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
      w[`${b}.hebel`] = h.titel;
      w[`${b}.erklaerung`] = h.text;
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

/** Rechnung als einfache Schritte (fuer Mail und Slack). */
function rechnungSchritte(h) {
  const s = [];
  if (h.stufe === 'Setting') {
    s.push(`${fmtZ(h.pool)} solche Settings`);
    s.push(`Wer den Termin anbietet, bekommt in ${fmtP(h.vergleichsquote)} der Fälle einen Sales Call → ${fmtZ(h.zusatzSc)} Sales Calls mehr`);
    s.push(`Davon werden ${fmtP(h.scZuWon)} gewonnen → ${fmtZ(h.zusatzDeals)} Abschlüsse mehr`);
  } else if (h.stufe === 'Opening') {
    s.push(`${fmtZ(h.pool)} solche Erstgespräche`);
    s.push(`Wer konkret fragt, bekommt in ${fmtP(h.vergleichsquote)} der Fälle einen Termin → ${fmtZ(h.zusatzTermine)} Termine mehr`);
    s.push(`${fmtP(h.settingZuSc)} der Settings führen zum Sales Call, ${fmtP(h.scZuWon)} der Sales Calls werden gewonnen → ${fmtZ(h.zusatzDeals)} Abschlüsse mehr`);
  } else {
    s.push(`${fmtZ(h.pool)} solche Sales Calls`);
    s.push(`Wer um die Entscheidung bittet, gewinnt ${fmtP(h.vergleichsquote)} → ${fmtZ(h.zusatzDeals)} Abschlüsse mehr`);
  }
  s.push(`× ${fmtE(h.dealWert)} durchschnittlicher Auftrag = bis zu ${fmtE(h.umsatz)}, vorsichtig gerechnet ${fmtE(h.umsatzKonservativ)}`);
  return s;
}

function rechnungText(h) {
  return rechnungSchritte(h).join(' · ');
}


const REGELN = `Regeln:
- Zahlen schreibst du NIE selbst. Jede Zahl, Quote oder jeder Betrag kommt ausschliesslich als Platzhalter {{schluessel}} aus dem Woerterbuch "werte" (exakt so geschrieben). Auch keine Zahlwoerter fuer Mengen.
- Gruende nur mit ihrer Bezeichnung nennen, NIE mit Codes wie B2-13 oder B6-07.
- Einfache Sprache: kurze Hauptsaetze (hoechstens 20 Woerter), keine Schachtelsaetze, keine Einschuebe. Jeder Stichpunkt beginnt mit der Kernaussage. Keine Abkuerzungen wie QC, SC oder FU: schreibe Setting, Sales Call, Wiedervorlage.
- Hoechstens zwei Platzhalter pro Satz.
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
QUALIFIZIERUNG (Vorgabe der Vertriebsleitung): Im Opening wird ein Termin nur angeboten, wenn der Entscheider erreicht ist; Bedarf festzustellen ist ein Plus. Im Setting wird ein Closing-Termin nur angeboten, wenn der Lead qualifiziert ist: Entscheider dabei oder Teilnahme zugesagt, deckbarer Bedarf, zeitnahe Besetzung. Viele Settings ohne Entscheider sind ein Fehler im Opening, nicht im Setting. Im Sales Call soll der Closer den Abschluss suchen, wenn der Entscheider dabei ist, Einwaende behandeln und einen Folgetermin nur legen, wenn keine Einwaende mehr offen sind; ein Folgetermin als Ausweg wird oft zum No-Show. Kritisiere nie ein fehlendes Angebot bei unqualifizierten Gespraechen.
Kennzahlen mit _qual zaehlen nur dort, wo das Verhalten sinnvoll ist (Terminfrage nur mit Entscheider, Closing-Angebot nur bei qualifiziertem Setting, Abschlussversuch nur mit Entscheider). Nutze fuer Bewertungen IMMER die _qual-Kennzahlen. Qualitaets-Werte (q.*): terminOhneEntscheider, bedarfFestgestellt, qualifiziert, ohneEntscheider, ohneBedarf, nichtZeitnah, angebotenUnqualifiziert, einwaendeBehandelt, folgeterminTrotzEinwaenden.
Merkmale (Schluessel -> deutscher Begriff): abschlussfrage_gestellt_qual -> Terminfrage bei erreichtem Entscheider; closing_aktiv_angeboten_qual -> Closing angeboten bei qualifiziertem Setting; abschluss_aktiv_versucht_qual -> Abschluss versucht mit Entscheider; entscheider_im_gespraech -> Entscheider im Gespraech; ma_fragte_aktiv_nach_termin -> aktiv nach Termin gefragt; naechster_schritt_mit_datum -> naechster Schritt mit Datum; abschlussfrage_gestellt -> Terminfrage gestellt (Opening/Setting); closing_aktiv_angeboten -> Closing aktiv angeboten (nur Setting); termin_verbindlich_fixiert -> Termin verbindlich fixiert (Opening/Setting); abschluss_aktiv_versucht -> Abschluss aktiv versucht (nur Closing).
${REGELN}
Der Report ist ein kompaktes PDF; jeder Abschnitt ist GENAU EIN Satz mit hoechstens 22 Woertern.
Abschnitte:
- gut: das Wichtigste, was diese Woche gut lief, mit einem Platzhalter als Beleg.
- schlecht: das Wichtigste, was diese Woche schlecht lief, mit einem Platzhalter als Beleg.
- schulung: was der Mitarbeiter im Gespraech konkret anders sagen oder tun soll (eine Handlung, kein Ziel), ohne Platzhalter.`;

const SYS_TEAM = `Du schreibst Teile eines woechentlichen Team-Reports (Vertrieb Bonn, acht Personen). Grundlage sind NUR die uebergebenen Kennzahlen.
Qualifizierung: Closing-Termin nur bei qualifiziertem Setting (Entscheider dabei oder zugesagt, deckbarer Bedarf, zeitnah); Termin im Opening nur mit Entscheider; viele Settings ohne Entscheider (T.opener.*) sind ein Fehler im Opening. Folgetermine nur ohne offene Einwaende.
${REGELN}
Der Report ist ein kompaktes PDF; jeder Stichpunkt ist EIN Satz mit hoechstens 18 Woertern.
Abschnitte:
- kernaussagen: genau drei Stichpunkte, die wichtigsten Aussagen der Woche fuer die Vertriebsleitung (Soll/Ist, Ziel-Kennzahlen, groesster Hebel). Je Stichpunkt hoechstens zwei Platzhalter. Umsatz-Hebel immer als "bis zu {{T.hebel1.umsatz}}, vorsichtig {{T.hebel1.umsatzKonservativ}}".
- warum: genau zwei Stichpunkte, warum gefuehrte Settings und Sales Calls ohne Ergebnis bleiben (aus V.grund*).
- aendern: genau zwei Stichpunkte, was sich konkret aendern muss (Handlungen, keine Ziele).`;

const SCHEMA_PERSON = { type: 'object', additionalProperties: false, required: ['gut', 'schlecht', 'schulung'],
  properties: { gut: { type: 'string' }, schlecht: { type: 'string' }, schulung: { type: 'string' } } };
const SCHEMA_TEAM = { type: 'object', additionalProperties: false, required: ['kernaussagen', 'warum', 'aendern'],
  properties: { kernaussagen: { type: 'array', items: { type: 'string' } }, warum: { type: 'array', items: { type: 'string' } },
    aendern: { type: 'array', items: { type: 'string' } } } };

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
  const MAX = { kernaussagen: 3, warum: 2, aendern: 2 };   // Platz im PDF
  const out = Object.fromEntries(Object.entries(r.json).map(([k, v]) => [k, ersetze(Array.isArray(v) && MAX[k] ? v.slice(0, MAX[k]) : v)]));
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
  d.team.hebel.forEach((h, i) => { w[`T.hebel${i + 1}`] = h.titel; w[`T.hebel${i + 1}.umsatz`] = fmtE(h.umsatz); w[`T.hebel${i + 1}.umsatzKonservativ`] = fmtE(h.umsatzKonservativ); });
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
  for (const [name, x] of Object.entries(d.team.settingsJeOpener.monat || {})) w[`T.opener.${name}`] = `${x.gelegt} Settings gelegt, Show-Rate ${fmtP(x.showRate)} (${x.geplatzt} geplatzt); von ${x.ausgewertet} ausgewerteten ${x.qualifiziert} qualifiziert, nicht qualifiziert weil Entscheider fehlt ${x.entscheiderFehlt}, Bedarf fehlt ${x.bedarfFehlt}, nicht zeitnah ${x.nichtZeitnah}`;
  const g = d.verbleib.woche.gesamtListe;
  w['V.liste.opportunities'] = fmtZ(g.opportunities); w['V.liste.wert'] = fmtE(g.wert); w['V.liste.followUpStattTermin'] = fmtZ(g.followUpStattTermin);
  for (const [b, n] of Object.entries(g.jeBedingung)) w[`V.liste.bedingung_${b}`] = fmtZ(n);
  const gruende = {};
  for (const z of d.verbleib.zeilen) if (z.grund_id) gruende[z.grund_id] = (gruende[z.grund_id] || 0) + 1;
  Object.entries(gruende).sort((a, b) => b[1] - a[1]).slice(0, 5).forEach(([id, n], i) => { w[`V.grund${i + 1}`] = `${K.grundName(id)} (${n}-mal)`; });
  return w;
}

async function teamText(d, warnungen) {
  const kontext = { bedingungen: { a: 'kein nächster Schritt (Status seit > 5 Werktagen, keine datierte Aufgabe)', b: 'Closing stattgefunden ohne Ergebnis',
    c: 'Setting stattgefunden ohne Ergebnis', d: 'Wiedervorlage statt Termin: Entscheider und Bedarf waren da, trotzdem wurde nur eine Wiedervorlage vereinbart (spaeter als 14 Tage oder ohne Datum)' },
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

module.exports = { personText, teamText, pruefeModelle, werteFuerPerson, rechnungText, rechnungSchritte, fmtP, fmtZ, fmtE, freieZiffern };
