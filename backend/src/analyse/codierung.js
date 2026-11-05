// Inkrementelle Codierung: Kandidaten sammeln -> Batch einreichen -> Ergebnisse einsammeln.
// Jeder Call wird genau einmal codiert (UNIQUE quelle+quell_id in codier_auftraege und call_codings).
// Transkripte werden nur im Speicher gehalten und an die Batch-API uebergeben, nie gespeichert.
const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');
const { db, TEAM, MODELS, P, PH, NOW, B, ymd, addTage, tsParam, upsert, istWahr } = require('./basis');
const { ladeTeam } = require('./team');
const { spiegleCalls, spiegleTasksInkrementell, leadDomains, closeTranskript } = require('./closeSpiegel');
const ff = require('./fireflies');
const Z = require('./zeitlinie');
const PR = require('./prompt');
const { kosten } = require('./kosten');

let client = null;
const anthropic = () => (client = client || new Anthropic());

const MIN_SEK = TEAM.regeln.min_dauer_sek;
const MAX_VERSUCHE = TEAM.regeln.max_codierversuche;
const CHUNK = 300;                  // Anfragen je Batch
const WARTEN_AUF_TRANSKRIPT_H = 12; // juengere Calls ohne Transkript bleiben offen (Transkript evtl. noch in Arbeit)

// ── 1) Kandidaten sammeln ────────────────────────────────────────────────────────────────
/**
 * Spiegelt Calls der acht, Fireflies-Meetings und Aufgaben fuer den Zeitraum und legt fuer jede
 * Aufnahme ab 60 s (Close) bzw. jedes zugeordnete Sales-Call-Meeting (Fireflies) einen Codier-Auftrag an.
 * Bestehende Auftraege bleiben unberuehrt (genau einmal).
 */
async function sammleKandidaten({ von, bis, log = () => {} }) {
  const team = await ladeTeam();
  const userIds = team.personen.flatMap(p => p.closeUserIds);
  const calls = await spiegleCalls({ von, bis, userIds, log });

  // Leads mit Closing-Termin in den letzten 60 Tagen: Aufgaben (SC-Datum, Verbleib) und Fireflies-Zuordnung
  const termLeads = (await db.all(
    `SELECT DISTINCT close_lead_id FROM termine WHERE gelegt_am >= ${P(1)} AND close_lead_id IS NOT NULL`, [addTage(von, -60)]))
    .map(r => r.close_lead_id);
  const callLeads = [...new Set(calls.map(c => c.lead_id).filter(Boolean))];
  await spiegleTasksInkrementell({ log });

  const zl = await Z.ladeOpps({ leadIds: [...new Set([...termLeads, ...callLeads])] });
  let neuClose = 0;
  for (const c of calls) {
    const person = team.nachUser.get(c.user_id);
    if (!person || c.dauer_sek < MIN_SEK || !c.hat_aufnahme) continue;
    const [stufeH, warum] = Z.stufeLautZeitlinie(zl.nachLead[c.lead_id], c.beginn, c.dauer_sek);
    const r = await db.run(
      `INSERT INTO codier_auftraege (quelle, quell_id, close_lead_id, employee_id, mitarbeiter, call_am, dauer_sek, richtung, stufe_zeitlinie, stufe_zeitlinie_grund)
       VALUES ('close', ${PH(9)}) ON CONFLICT (quelle, quell_id) DO NOTHING`,
      [c.id, c.lead_id, person.employeeId, person.name, tsParam(c.beginn), c.dauer_sek, c.richtung, stufeH, warum]);
    neuClose += Number(r.rowCount ?? r.changes ?? 0);
  }

  // Fireflies
  let neuFF = 0, ffStat = { gesamt: 0, sc: 0, zugeordnet: 0, keine: 0, mehrdeutig: 0 };
  if (process.env.FIREFLIES_API_KEY) {
    const ms = await ff.meetings(von, bis);
    ffStat.gesamt = ms.length;
    const domains = await leadDomains(termLeads);
    const tasks = termLeads.length ? await db.all(
      `SELECT lead_id, text, faellig_datum FROM close_tasks WHERE lead_id IN (${PH(termLeads.length)}) AND faellig_datum IS NOT NULL`, termLeads) : [];
    const scDates = {};
    for (const t of tasks) if (/^\s*sc\b/i.test(t.text || '')) (scDates[t.lead_id] = scDates[t.lead_id] || []).push(ymd(t.faellig_datum));
    const kandidaten = termLeads.map(id => ({
      id, name: (domains[id] || {}).name || '', domains: (domains[id] || {}).domains || [], scDates: scDates[id] || [],
      scAusgaenge: (zl.nachLead[id] || []).flatMap(r => r.termine.filter(t => t.art === 'closing' && t.ausgangAm).map(t => t.ausgangAm)),
    }));
    for (const m of ms) {
      const k = ff.klassifiziere(m);
      let z = null;
      if (k.klasse === 'SC' || k.klasse === 'Zweifel_SC') {
        ffStat.sc++;
        z = ff.ordneZu(m, k, kandidaten);
        if (z.zuordnung === 'sicher' || z.zuordnung === 'wahrscheinlich') {
          ffStat.zugeordnet++;
          const r = await db.run(
            `INSERT INTO codier_auftraege (quelle, quell_id, close_lead_id, call_am, dauer_sek, stufe_zeitlinie, stufe_zeitlinie_grund)
             VALUES ('fireflies', ${PH(6)}) ON CONFLICT (quelle, quell_id) DO NOTHING`,
            [m.id, z.leadId, tsParam(m.beginn), Math.round((Number(m.duration) || 0) * 60), 'Closing', `Fireflies-Videocall, Zuordnung ${z.zuordnung}`]);
          neuFF += Number(r.rowCount ?? r.changes ?? 0);
        } else ffStat[z.zuordnung === 'mehrdeutig' ? 'mehrdeutig' : 'keine']++;
      }
      await ff.speichere(m, k, z);
    }
  } else log('  Fireflies: FIREFLIES_API_KEY fehlt — uebersprungen');
  // Bereits codiert (z. B. Oktober-Basis bis 03.11.): nicht erneut einreichen.
  await db.run(`UPDATE codier_auftraege SET status='fertig', letzter_fehler='bereits codiert (Oktober-Basis)'
                 WHERE status='offen' AND EXISTS (SELECT 1 FROM call_codings cc WHERE cc.quelle = codier_auftraege.quelle AND cc.quell_id = codier_auftraege.quell_id)`);
  log(`  Kandidaten neu: Close ${neuClose}, Fireflies ${neuFF} | Fireflies ${JSON.stringify(ffStat)}`);
  return { calls: calls.length, neuClose, neuFF, ff: ffStat };
}

// ── 2) Einreichen ────────────────────────────────────────────────────────────────────────
const customId = (a) => (a.quelle === 'fireflies' ? 'ff_' : 'cl_') + String(a.quell_id).replace(/[^A-Za-z0-9_-]/g, '').slice(-58);

async function baueAnfrage(a, team) {
  const datum = ymd(a.call_am);
  let d;
  if (a.quelle === 'fireflies') {
    d = await ff.ffTranskript(a.quell_id, team);
    if (d && !d.person) return { aufgeben: 'kein Hauptsprecher der acht im Meeting' };
  } else d = await closeTranskript(a.quell_id);
  if (!d) {
    const alterH = (Date.now() - new Date(a.call_am instanceof Date ? a.call_am : String(a.call_am).replace(' ', 'T') + (String(a.call_am).includes('T') ? '' : 'Z')).getTime()) / 36e5;
    return alterH < WARTEN_AUF_TRANSKRIPT_H ? { warten: true } : { ohne: true };
  }
  const zl = await Z.ladeOpps({ leadIds: [a.close_lead_id] });
  const rec = Z.oppZumZeitpunkt(zl.nachLead[a.close_lead_id], Z.zeit(a.call_am));
  const kontext = Z.kontextSatz({ stufeH: a.stufe_zeitlinie, warum: a.stufe_zeitlinie_grund, richtung: a.richtung, rec });
  const params = {
    model: MODELS.codierung.model,
    max_tokens: MODELS.codierung.max_tokens,
    system: [{ type: 'text', text: PR.SYSTEM, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: MODELS.codierung.effort, format: { type: 'json_schema', schema: PR.SCHEMA } },
    messages: [{ role: 'user', content: PR.userText({ kontext, summary: d.summary, dauerSek: d.dauerSek || a.dauer_sek, quelle: a.quelle, datum, zeilen: d.zeilen }) }],
  };
  const leadName = rec ? rec.o.lead_name : null;
  return {
    params, rec,
    person: a.quelle === 'fireflies' ? d.person : null,
    mitsprecher: d.mitsprecher || null,
    redeanteil: d.redeanteil,
    dauerSek: d.dauerSek || a.dauer_sek,
    namen: [...(d.kundenNamen || []), leadName || ''].filter(Boolean),
  };
}

/** Offene und fehlgeschlagene Auftraege einreichen. Gibt die Batch-IDs zurueck. */
async function reicheEin({ runId = null, log = () => {} } = {}) {
  const team = await ladeTeam();
  const offen = await db.all(
    `SELECT * FROM codier_auftraege WHERE status IN ('offen','fehler') AND versuche < ${P(1)} ORDER BY call_am`, [MAX_VERSUCHE]);
  const reqs = [];
  let ohne = 0, warten = 0, aufgegeben = 0, fehler = 0;
  let i = 0;
  const worker = async () => {
    while (i < offen.length) {
      const a = offen[i++];
      try {
        const f = await baueAnfrage(a, team);
        if (f.warten) { warten++; continue; }
        if (f.ohne) { ohne++; await setzeStatus(a.id, 'ohne_transkript', 'kein Transkript vorhanden'); continue; }
        if (f.aufgeben) { aufgegeben++; await setzeStatus(a.id, 'aufgegeben', f.aufgeben); continue; }
        if (f.person) {
          await db.run(`UPDATE codier_auftraege SET employee_id=${P(1)}, mitarbeiter=${P(2)} WHERE id=${P(3)}`, [f.person.employeeId, f.person.name, a.id]);
        }
        await db.run(`UPDATE codier_auftraege SET namen_tmp=${P(1)}, custom_id=${P(2)} WHERE id=${P(3)}`,
          [JSON.stringify({ namen: f.namen, mitsprecher: f.mitsprecher, redeanteil: f.redeanteil, dauerSek: f.dauerSek, opp: f.rec ? f.rec.o.id : null }), customId(a), a.id]);
        reqs.push({ id: a.id, custom_id: customId(a), params: f.params });
      } catch (e) {
        fehler++;
        await db.run(`UPDATE codier_auftraege SET status='fehler', versuche=versuche+1, letzter_fehler=${P(1)}, aktualisiert_am=${NOW()} WHERE id=${P(2)}`,
          [('Aufbau: ' + e.message).slice(0, 300), a.id]);
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);

  const batchIds = [];
  for (let k = 0; k < reqs.length; k += CHUNK) {
    const teil = reqs.slice(k, k + CHUNK);
    const b = await anthropic().messages.batches.create({ requests: teil.map(r => ({ custom_id: r.custom_id, params: r.params })) });
    batchIds.push(b.id);
    await db.run(`INSERT INTO analyse_batches (batch_id, run_id, modell, anzahl) VALUES (${PH(4)})`, [b.id, runId, MODELS.codierung.model, teil.length]);
    for (const r of teil) {
      await db.run(`UPDATE codier_auftraege SET status='eingereicht', batch_id=${P(1)}, versuche=versuche+1, aktualisiert_am=${NOW()} WHERE id=${P(2)}`, [b.id, r.id]);
    }
  }
  log(`  eingereicht: ${reqs.length} in ${batchIds.length} Batch(es) | ohne Transkript ${ohne} | wartet auf Transkript ${warten} | aufgegeben ${aufgegeben} | Fehler beim Aufbau ${fehler}`);
  return { eingereicht: reqs.length, batchIds, ohne, warten, aufgegeben, fehler };
}

async function setzeStatus(id, status, grund) {
  await db.run(`UPDATE codier_auftraege SET status=${P(1)}, letzter_fehler=${P(2)}, aktualisiert_am=${NOW()} WHERE id=${P(3)}`, [status, grund, id]);
}

// ── 3) Einsammeln ────────────────────────────────────────────────────────────────────────
const GEN = new Set(['gmbh', 'group', 'service', 'services', 'partner', 'management', 'technik', 'verwaltung', 'gesellschaft', 'deutschland',
  'handel', 'holding', 'gruppe', 'bau', 'systems', 'solutions', 'consulting', 'logistik', 'industrie', 'werke', 'haus', 'immobilien']);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function bereinige(text, tokens) {
  let t = text || '';
  for (const tok of tokens) {
    const re = new RegExp('\\b' + esc(tok) + '\\w*', 'gi');
    if (re.test(t)) t = t.replace(re, '[Name]');
  }
  return t;
}
const nameTokens = (namen, df) => [...new Set(namen.flatMap(x => String(x).split(/[\s,.&\-/()]+/)))]
  .filter(t => t.length >= 5 && !GEN.has(t.toLowerCase()) && (df[t.toLowerCase()] || 0) <= 3);
const datumOk = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(Date.parse(s)) ? s : null);

/** Fertige Batches einsammeln. Rueckgabe: { gesammelt, codiert, fehlgeschlagen, kostenUsd, offen } */
async function sammleEin({ log = () => {} } = {}) {
  const laufend = await db.all(`SELECT * FROM analyse_batches WHERE status='laeuft' ORDER BY eingereicht_am`);
  let codiert = 0, fehlgeschlagen = 0, kostenUsd = 0, gesammelt = 0, offen = 0;
  for (const b of laufend) {
    const st = await anthropic().messages.batches.retrieve(b.batch_id);
    if (st.processing_status !== 'ended') { offen++; continue; }
    const ergebnisse = [];
    for await (const r of await anthropic().messages.batches.results(b.batch_id)) ergebnisse.push(r);
    // Dokumentfrequenz ueber den Batch: haeufige Woerter sind keine Namen (join.js)
    const df = {};
    for (const r of ergebnisse) {
      if (r.result.type !== 'succeeded') continue;
      const txt = r.result.message.content.filter(c => c.type === 'text').map(c => c.text).join('');
      for (const w of new Set((txt.toLowerCase().match(/[a-zäöüß]{4,}/g) || []))) df[w] = (df[w] || 0) + 1;
    }
    let bKosten = 0, bOk = 0, bFehl = 0;
    for (const r of ergebnisse) {
      const a = await db.get(`SELECT * FROM codier_auftraege WHERE custom_id=${P(1)} AND batch_id=${P(2)}`, [r.custom_id, b.batch_id]);
      if (!a) continue;
      if (r.result.type !== 'succeeded') {
        bFehl++;
        await db.run(`UPDATE codier_auftraege SET status='fehler', letzter_fehler=${P(1)}, aktualisiert_am=${NOW()} WHERE id=${P(2)}`,
          [(r.result.type + ' ' + JSON.stringify(r.result.error || {})).slice(0, 300), a.id]);
        continue;
      }
      const m = r.result.message;
      const usd = kosten(MODELS.codierung.model, m.usage, true);
      bKosten += usd;
      let out;
      try {
        if (m.stop_reason === 'refusal') throw new Error('refusal');
        out = JSON.parse(m.content.filter(c => c.type === 'text').map(c => c.text).join(''));
      } catch (e) {
        bFehl++;
        await db.run(`UPDATE codier_auftraege SET status='fehler', letzter_fehler=${P(1)}, aktualisiert_am=${NOW()} WHERE id=${P(2)}`,
          [`Antwort nicht lesbar (${m.stop_reason}): ${e.message}`.slice(0, 300), a.id]);
        continue;
      }
      const meta = a.namen_tmp ? JSON.parse(a.namen_tmp) : {};
      const tokens = nameTokens(meta.namen || [], df);
      const gr = (out.gruende || []).slice(0, 2).map(g => ({ ...g, freitext: bereinige(g.freitext, tokens) }));
      const datum = ymd(a.call_am);
      const nsDatum = datumOk(out.naechster_schritt_datum);
      const row = {
        quelle: a.quelle, quell_id: a.quell_id, basis: 'laufend', close_lead_id: a.close_lead_id, close_opportunity_id: meta.opp || null,
        employee_id: a.employee_id, mitarbeiter: a.mitarbeiter, mitsprecher: meta.mitsprecher && meta.mitsprecher.length ? JSON.stringify(meta.mitsprecher) : null,
        call_am: tsParam(a.call_am), call_datum: datum, dauer_sek: meta.dauerSek ?? a.dauer_sek, redeanteil_ma: meta.redeanteil ?? null, richtung: a.richtung,
        stufe_zeitlinie: a.stufe_zeitlinie, stufe_zeitlinie_grund: a.stufe_zeitlinie_grund,
        stufe: out.stufe, ergebnis: out.ergebnis, erfolg: out.erfolg, konfidenz: out.konfidenz, in_hauptquote: B(out.konfidenz !== 'niedrig'),
        grund1_id: gr[0] ? gr[0].id : null, grund1_konfidenz: gr[0] ? gr[0].konfidenz : null,
        grund2_id: gr[1] ? gr[1].id : null, grund2_konfidenz: gr[1] ? gr[1].konfidenz : null,
        grund_freitext: gr.filter(g => g.id === 'SONSTIG').map(g => g.freitext).filter(Boolean).join(' | ') || null,
        entscheider_im_gespraech: out.entscheider_im_gespraech, bedarf_bestaetigt: out.bedarf_bestaetigt,
        naechster_schritt_mit_datum: out.naechster_schritt_mit_datum, ma_fragte_aktiv_nach_termin: out.ma_fragte_aktiv_nach_termin,
        abschlussfrage_gestellt: out.abschlussfrage_gestellt, closing_aktiv_angeboten: out.closing_aktiv_angeboten,
        termin_verbindlich_fixiert: out.termin_verbindlich_fixiert, abschluss_aktiv_versucht: out.abschluss_aktiv_versucht,
        warnsignale_b4: (out.warnsignale_b4 || []).join(',') || null, widerspruch_zusammenfassung: out.widerspruch_zusammenfassung,
        naechster_schritt_datum: nsDatum, naechster_schritt_text: bereinige(out.naechster_schritt, tokens).slice(0, 200),
        einzeiler: bereinige(out.einzeiler, tokens).slice(0, 400),
        modell: m.model || MODELS.codierung.model, prompt_version: PR.PROMPT_VERSION, taxonomie_version: PR.TAXONOMIE_VERSION, batch_id: b.batch_id,
        input_tokens: m.usage.input_tokens || 0, output_tokens: m.usage.output_tokens || 0,
        cache_read_tokens: m.usage.cache_read_input_tokens || 0, cache_write_tokens: m.usage.cache_creation_input_tokens || 0,
        kosten_usd: Math.round(usd * 1e5) / 1e5,
      };
      const cols = Object.keys(row);
      await db.run(`INSERT INTO call_codings (${cols.join(',')}) VALUES (${PH(cols.length)}) ON CONFLICT (quelle, quell_id) DO NOTHING`, cols.map(c => row[c]));
      await db.run(`UPDATE codier_auftraege SET status='fertig', namen_tmp=NULL, letzter_fehler=NULL, aktualisiert_am=${NOW()} WHERE id=${P(1)}`, [a.id]);
      if (a.quelle === 'fireflies') {
        await db.run(`UPDATE ff_meetings SET mitarbeiter=${P(1)}, employee_id=${P(2)} WHERE id=${P(3)}`, [a.mitarbeiter, a.employee_id, a.quell_id]);
      }
      bOk++;
    }
    await db.run(`UPDATE analyse_batches SET status='eingesammelt', erfolgreich=${P(1)}, fehlgeschlagen=${P(2)}, kosten_usd=${P(3)}, eingesammelt_am=${NOW()} WHERE batch_id=${P(4)}`,
      [bOk, bFehl, Math.round(bKosten * 1e4) / 1e4, b.batch_id]);
    // Auftraege dieses Batches ohne Ergebniszeile (sollte nicht vorkommen): zurueck auf fehler
    await db.run(`UPDATE codier_auftraege SET status='fehler', letzter_fehler='kein Ergebnis im Batch' WHERE batch_id=${P(1)} AND status='eingereicht'`, [b.batch_id]);
    gesammelt++; codiert += bOk; fehlgeschlagen += bFehl; kostenUsd += bKosten;
  }
  // Endgueltig aufgeben nach MAX_VERSUCHE
  await db.run(`UPDATE codier_auftraege SET status='aufgegeben' WHERE status='fehler' AND versuche >= ${P(1)}`, [MAX_VERSUCHE]);
  if (gesammelt || codiert) log(`  eingesammelt: ${gesammelt} Batch(es), ${codiert} codiert, ${fehlgeschlagen} fehlgeschlagen, ${kostenUsd.toFixed(2)} $`);
  return { gesammelt, codiert, fehlgeschlagen, kostenUsd, offen };
}

/** Anzahl Auftraege, die (noch) nicht codiert sind, im Zeitraum. */
async function nochOffen(von, bis) {
  const r = await db.get(
    `SELECT COUNT(*) n FROM codier_auftraege WHERE status IN ('offen','eingereicht','fehler')
       AND call_am >= ${P(1)} AND call_am < ${P(2)}`, [tsParam(von + 'T00:00:00+01:00'), tsParam(addTage(bis, 1) + 'T00:00:00+01:00')]);
  return Number(r?.n || 0);
}

module.exports = { sammleKandidaten, reicheEin, sammleEin, nochOffen, bereinige, anthropic, istWahr };
