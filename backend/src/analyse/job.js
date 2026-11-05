// Lauf-Steuerung der Wochenanalyse: Codierlauf, Einsammeln, Verbleib, Wochenreport.
// Jeder Lauf schreibt analyse_runs (Abdeckung, Fehler, Kosten, Log). Bei Fehlern eine kurze Nachricht NUR an Deniz
// (Slack-Direktnachricht an versand.slack.fehler_an, sonst Mail an versand.fehler_an).
// Versandweg des Reports: team.json versand.kanal ('slack' | 'mail'), manuell ueberschreibbar. Sperre prozesslokal je Lauftyp (eine Railway-Instanz, wie closeSyncJob.js).
const { db, TEAM, P, NOW, heute, addTage, berichtswoche, setting, insertId, ymd } = require('./basis');
const { sendEmail } = require('../utils/email');

const aktiv = {};               // typ -> { runId, gestartetAm }
const BACKFILL_CALLS_AB = '2026-10-01';
const CODIERUNG_AB = '2026-10-31';  // erster laufender Codierzeitraum (Samstag vor dem 02.11.)

function mailKonfiguriert() { return !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST); }

async function fehlerMail(betreff, text) {
  const slack = require('./slack');
  if (slack.konfiguriert()) {
    try { await slack.sendeFehler(TEAM.versand.slack.fehler_an, `:rotating_light: *[Vertriebsanalyse] ${betreff}*\n\`\`\`${String(text).slice(0, 2500)}\`\`\``); return; }
    catch (e) { console.error('[analyse] Slack-Fehlermeldung fehlgeschlagen, versuche Mail:', e.message); }
  }
  if (!mailKonfiguriert()) { console.error('[analyse] Fehlermail nicht moeglich (kein Mailversand konfiguriert):', betreff, text); return; }
  try {
    await sendEmail({ to: TEAM.versand.fehler_an, subject: `[Vertriebsanalyse] ${betreff}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:13px"><p>${String(text).replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p><p style="color:#666">Lauf-Log: KPI-Tracker → /api/admin/analyse/status</p></div>` });
  } catch (e) { console.error('[analyse] Fehlermail fehlgeschlagen:', e.message); }
}

/** Fuehrt fn als protokollierten Lauf aus. fn bekommt { runId, log } und liefert { abdeckung?, kosten?, status?, fehler? }. */
async function lauf(typ, { ausgeloestVon = 'cron', user = null, von = null, bis = null, still = false } = {}, fn) {
  if (aktiv[typ]) return { ok: false, grund: 'laeuft', runId: aktiv[typ].runId };
  aktiv[typ] = { runId: null, gestartetAm: new Date().toISOString() };
  const zeilen = [];
  const log = (m) => { const z = `[${new Date().toISOString().slice(11, 19)}] ${m}`; zeilen.push(z); console.log(`[analyse:${typ}] ${m}`); };
  let runId = null;
  try {
    runId = await insertId('analyse_runs', { typ, ausgeloest_von: ausgeloestVon, user_name: user ? (user.name || user.email) : null, zeitraum_von: von, zeitraum_bis: bis });
    aktiv[typ].runId = runId;
    const r = (await fn({ runId, log })) || {};
    const status = r.status || ((r.fehler && r.fehler.length) ? 'teilweise' : 'ok');
    await db.run(`UPDATE analyse_runs SET status=${P(1)}, beendet_am=${NOW()}, abdeckung=${P(2)}, fehler=${P(3)}, kosten_usd=${P(4)}, log=${P(5)} WHERE id=${P(6)}`,
      [status, r.abdeckung ? JSON.stringify(r.abdeckung) : null, r.fehler && r.fehler.length ? JSON.stringify(r.fehler) : null,
        r.kosten != null ? Math.round(r.kosten * 1e4) / 1e4 : null, zeilen.join('\n').slice(-60000), runId]);
    if (status === 'teilweise' && !still) await fehlerMail(`${typ}: mit Warnungen (Lauf ${runId})`, r.fehler.join('\n'));
    return { ok: true, runId, status, ...r };
  } catch (e) {
    log('FEHLER: ' + e.message);
    if (runId) {
      await db.run(`UPDATE analyse_runs SET status='fehler', beendet_am=${NOW()}, fehler=${P(1)}, log=${P(2)} WHERE id=${P(3)}`,
        [JSON.stringify([e.message]), zeilen.join('\n').slice(-60000), runId]).catch(() => {});
    }
    await fehlerMail(`${typ} fehlgeschlagen${runId ? ` (Lauf ${runId})` : ''}`, `${e.message}\n\n${zeilen.slice(-15).join('\n')}`);
    return { ok: false, grund: 'fehler', fehler: e.message, runId };
  } finally {
    delete aktiv[typ];
  }
}

/** Ende des letzten erfolgreichen Codierlaufs (Tag) — Start des naechsten inkrementellen Fensters. */
async function codierStart() {
  const r = await db.get(`SELECT MAX(zeitraum_bis) m FROM analyse_runs WHERE typ='codierung' AND status IN ('ok','teilweise') AND ausgeloest_von='cron'`);
  return r && r.m ? addTage(ymd(r.m), -1) : CODIERUNG_AB;     // ein Tag Ueberlappung (spaete Aufnahmen)
}

/** Codierlauf: Close-Sync-Delta, Calls/Fireflies spiegeln, Kandidaten anlegen, Batch einreichen. */
async function codierlauf({ von = null, bis = null, ausgeloestVon = 'cron', user = null, neuCodieren = false } = {}) {
  const v = von || await codierStart();
  const b = bis || heute();
  return lauf('codierung', { ausgeloestVon, user, von: v, bis: b }, async ({ runId, log }) => {
    const { pruefeModelle } = require('./texte');
    await pruefeModelle();
    const { syncDelta } = require('../utils/closeSync');
    const d = await syncDelta({ log }).catch(e => ({ fehler: e.message }));
    if (d && d.fehler) log('  Close-Delta fehlgeschlagen (naechtlicher Volllauf 01:15 holt es nach): ' + d.fehler);
    await einmaligBackfill(log);
    await oppBackfill(log);
    await oktoberBasisEinmalig(log);
    const C = require('./codierung');
    await C.sammleEin({ log });                          // fertige Batches vorher einsammeln
    const k = await C.sammleKandidaten({ von: v, bis: b, log });
    if (neuCodieren) await C.nachcodieren({ von: v, bis: b, log });
    const e = await C.reicheEin({ runId, log });
    const fehler = [];
    if (e.fehler) fehler.push(`${e.fehler} Auftraege konnten nicht aufgebaut werden (Wiederholung beim naechsten Lauf)`);
    const abd = await require('./reportDaten').abdeckungKurz({ von: v, bis: b });
    return { abdeckung: { ...abd, kandidaten: k, eingereicht: e }, fehler };
  });
}

/**
 * Einmalig: alle Opportunities ab CLOSE_BACKFILL_AB neu spiegeln, damit Firma (lead_name) und Wert (value) auch bei
 * Opportunities gesetzt sind, die sich seit Migration 119 nicht mehr geaendert haben. Nur lesend gegenueber Close.
 */
async function oppBackfill(log) {
  const { setzeSetting } = require('./basis');
  if (!(await setting('opp_backfill_119', null))) {
    const { syncOpportunities } = require('../utils/closeSync');
    const r = await syncOpportunities({ since: process.env.CLOSE_BACKFILL_AB || '2026-06-01', log });
    await setzeSetting('opp_backfill_119', new Date().toISOString(), 'analyse');
    log(`  Opportunity-Backfill (Firma/Wert): ${r.gesamt} Opportunities`);
  }
  await oppLuecken(log);
}

/**
 * Lueckenfueller: Opportunities, die in Terminen oder Codierungen vorkommen, aber noch keine Firma haben (seit
 * Migration 119 nicht mehr in Close geaendert und aelter als das Backfill-Fenster), einzeln aus Close holen.
 * Nur lesend; hoechstens 400 je Lauf; in Close geloeschte Opportunities werden uebersprungen.
 */
async function oppLuecken(log) {
  const close = require('../utils/closeClient');
  const { P: Pp } = require('./basis');
  const ids = (await db.all(`SELECT o.id FROM close_opportunities o WHERE o.lead_name IS NULL AND o.geloescht_am IS NULL AND (
      EXISTS (SELECT 1 FROM termine t WHERE t.close_opportunity_id = o.id) OR EXISTS (SELECT 1 FROM call_codings c WHERE c.close_opportunity_id = o.id))
      LIMIT 400`)).map(r => r.id);
  if (!ids.length) return;
  let ok = 0, weg = 0;
  for (const id of ids) {
    try {
      const o = await close.get(`/opportunity/${id}/`, { _fields: 'id,lead_name,value,value_currency,value_period' });
      await db.run(`UPDATE close_opportunities SET lead_name=${Pp(1)}, value=${Pp(2)}, value_currency=${Pp(3)}, value_period=${Pp(4)} WHERE id=${Pp(5)}`,
        [o.lead_name ?? null, o.value != null ? Number(o.value) / 100 : null, o.value_currency ?? null, o.value_period ?? null, id]);
      ok++;
    } catch (e) {
      weg++;
      // In Close geloescht (z. B. beim Zusammenfuehren doppelter Leads): markieren, nicht loeschen.
      if (/HTTP 404/.test(String(e.message))) await db.run(`UPDATE close_opportunities SET geloescht_am=${NOW()} WHERE id=${Pp(1)}`, [id]);
    }
  }
  log(`  Opportunity-Luecken: ${ok} nachgezogen${weg ? `, ${weg} in Close nicht mehr vorhanden (markiert)` : ''}`);
}

/** Einmalig: Calls ab 01.10. spiegeln (fuer Bedingung c der Verbleib-Liste), ohne Codier-Auftraege. */
async function einmaligBackfill(log) {
  const { setzeSetting } = require('./basis');
  if (await setting('calls_backfill', null)) return;
  const { ladeTeam } = require('./team');
  const { spiegleCalls } = require('./closeSpiegel');
  const team = await ladeTeam();
  await spiegleCalls({ von: BACKFILL_CALLS_AB, bis: addTage(CODIERUNG_AB, -1), userIds: team.personen.flatMap(p => p.closeUserIds), log });
  await setzeSetting('calls_backfill', new Date().toISOString(), 'analyse');
}

/** Einmalig: Oktober-Basis aus config/analyse/oktober-basis.json uebernehmen, falls noch nicht vorhanden. */
async function oktoberBasisEinmalig(log) {
  const r = await db.get(`SELECT COUNT(*) n FROM call_codings WHERE basis='oktober'`);
  if (Number(r.n)) return;
  const datei = require('path').join(require('./basis').CONFIG_DIR, 'oktober-basis.json');
  if (!require('fs').existsSync(datei)) { log('  Oktober-Basis fehlt (config/analyse/oktober-basis.json) — Vergleich Oktober bleibt leer'); return; }
  await require('./oktoberBasis').importiere(datei, { log });
}

/** Alle 10 Minuten: fertige Batches einsammeln. Protokolliert nur, wenn etwas eingesammelt wurde. */
async function einsammeln({ ausgeloestVon = 'cron' } = {}) {
  if (aktiv.einsammeln) return { ok: false, grund: 'laeuft' };
  const offen = await db.get(`SELECT COUNT(*) n FROM analyse_batches WHERE status='laeuft'`).catch(() => ({ n: 0 }));
  if (!Number(offen.n)) return { ok: true, nichts: true };
  return lauf('einsammeln', { ausgeloestVon, still: true }, async ({ log }) => {
    const r = await require('./codierung').sammleEin({ log });
    return { kosten: r.kostenUsd, abdeckung: r, fehler: r.fehlgeschlagen ? [`${r.fehlgeschlagen} Calls fehlgeschlagen (Wiederholung beim naechsten Codierlauf)`] : [] };
  });
}

async function verbleiblauf({ stichtag = heute(), ausgeloestVon = 'cron', user = null } = {}) {
  return lauf('verbleib', { ausgeloestVon, user, von: stichtag, bis: stichtag }, async ({ log }) => {
    await oppBackfill(log);
    const V = require('./verbleib');
    const r = await V.berechne({ stichtag, log });
    return { abdeckung: { zeilen: r.zeilen.length, opportunities: new Set(r.zeilen.map(z => z.close_opportunity_id)).size } };
  });
}

/**
 * Wochenreport. modus: 'test' | 'live' | 'ohne_versand' | null (= analyse_settings.versand_modus, Standard test).
 * stichtag: Freitag der Berichtswoche (Standard heute); von/bis frei waehlbar zum Nachholen.
 */
async function reportlauf({ stichtag = heute(), von = null, bis = null, modus = null, kanal = null, ausgeloestVon = 'cron', user = null } = {}) {
  const m = modus || await setting('versand_modus', 'test');
  // Slack ist der vorgesehene Weg; solange die Slack-App noch nicht installiert ist (kein SLACK_BOT_TOKEN),
  // faellt der automatische Lauf auf Mail zurueck, statt auszufallen. Manuell erzwungenes kanal='slack' scheitert dagegen laut.
  const gewuenscht = kanal || TEAM.versand.kanal || 'mail';
  const weg = (!kanal && gewuenscht === 'slack' && !process.env.SLACK_BOT_TOKEN) ? 'mail' : gewuenscht;
  const wegHinweis = weg !== gewuenscht ? 'Slack-App noch nicht eingerichtet (SLACK_BOT_TOKEN fehlt) — Versand per Mail' : null;
  return lauf('report', { ausgeloestVon, user, von: von || berichtswoche(stichtag).von, bis: bis || berichtswoche(stichtag).bis }, async ({ runId, log }) => {
    const Tx = require('./texte');
    await Tx.pruefeModelle();
    if (m !== 'ohne_versand') {
      if (weg === 'slack') {
        if (!process.env.SLACK_BOT_TOKEN) throw new Error('Slack-Versand: SLACK_BOT_TOKEN fehlt');
        if (m === 'live' && !process.env.SLACK_KANAL_ID) throw new Error('Slack-Versand live: SLACK_KANAL_ID fehlt');
      } else if (!mailKonfiguriert()) throw new Error('Kein Mailversand konfiguriert (RESEND_API_KEY oder SMTP_HOST fehlt)');
    }
    const C = require('./codierung');
    await C.sammleEin({ log });
    await oppBackfill(log);
    const V = require('./verbleib');
    await V.berechne({ stichtag, log });                  // frischer Stand zum Versand
    const RD = require('./reportDaten');
    const d = await RD.baue({ stichtag, von, bis, log });
    log(`  Zahlen: ${d.codierung.woche} Codierungen Woche, ${d.codierung.monat} Monat, nicht codiert ${d.codierung.nichtCodiertWoche}`);

    const warnungen = wegHinweis ? [wegHinweis] : [];
    let kostenTexte = 0;
    const personen = {};
    let i = 0;
    const worker = async () => {
      while (i < d.personen.length) {
        const p = d.personen[i++];
        try { const r = await Tx.personText(p, warnungen, d.team.verpasst.woche); personen[p.vorname] = r.out; kostenTexte += r.usd; }
        catch (e) { warnungen.push(`Text ${p.vorname}: ${e.message}`); }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    let team = null;
    try { const r = await Tx.teamText(d, warnungen); team = r.out; kostenTexte += r.usd; } catch (e) { warnungen.push('Text Team: ' + e.message); }
    log(`  Texte erzeugt, ${kostenTexte.toFixed(2)} $`);

    const X = require('./excel');
    const kw = d.zeitraeume.woche.kw;
    const pdf = await require('./pdf').erzeuge(d, { personen, team, modus: m });
    const seiten = require('./pdf').seiten(pdf);
    log(`  PDF erzeugt: ${seiten} Seite(n)`);
    if (seiten > 3) warnungen.push(`PDF hat ${seiten} Seiten (Ziel: hoechstens 3)`);
    const titel = `Vertriebsanalyse Bonn KW ${kw}${m === 'test' ? ' (Test)' : ''}`;
    const kern = (team && team.kernaussagen) || [];
    const anh = [
      { filename: `Vertriebsanalyse_Bonn_KW${kw}.pdf`, content: pdf },
      { filename: `Verbleib_Bonn_KW${kw}.xlsx`, content: Buffer.from(await X.verbleibXlsx(d)) },
      { filename: `Codierungen_Bonn_KW${kw}.xlsx`, content: Buffer.from(await X.codierungenXlsx(d)) },
    ];
    // Kosten der Woche: Codierungen, die in der Berichtswoche codiert wurden, plus Texte dieses Laufs
    const kc = await db.get(`SELECT COALESCE(SUM(kosten_usd),0) k FROM call_codings WHERE basis='laufend' AND call_datum >= ${P(1)} AND call_datum <= ${P(2)}`,
      [d.zeitraeume.woche.von, d.zeitraeume.woche.bis]);
    const kostenCod = Number(kc.k) || 0;
    const empf = m === 'ohne_versand' ? []
      : weg === 'slack' ? [m === 'live' ? `Slack-Kanal ${process.env.SLACK_KANAL_ID}` : `Slack-DM ${TEAM.versand.slack.test_an.join(' / ')}`]
      : m === 'live' ? TEAM.versand.empfaenger_live : TEAM.versand.empfaenger_test;
    const reportId = await require('./basis').insertId('weekly_reports', {
      jahr: d.zeitraeume.woche.jahr, kw, woche_von: d.zeitraeume.woche.von, woche_bis: d.zeitraeume.woche.bis, monat_von: d.zeitraeume.monat.von, monat_bis: d.zeitraeume.monat.bis,
      modus: m, empfaenger: empf.join(', '), anzahl_codiert_woche: d.codierung.woche, anzahl_codiert_monat: d.codierung.monat,
      nicht_vollstaendig: require('./basis').B(d.codierung.nichtVollstaendig), offen_ungecodiert: d.codierung.nichtCodiertWoche,
      abdeckung: JSON.stringify(d.abdeckung), kennzahlen: JSON.stringify({ team: d.team, personen: d.personen.map(p => ({ ...p })), verbleib: { woche: d.verbleib.woche, monat: d.verbleib.monat } })
        .slice(0, 900000),
      texte: JSON.stringify({ personen, team }), kosten_codierung_usd: Math.round(kostenCod * 1e4) / 1e4, kosten_texte_usd: Math.round(kostenTexte * 1e4) / 1e4,
      kosten_gesamt_usd: Math.round((kostenCod + kostenTexte) * 1e4) / 1e4, run_id: runId, versand_status: m === 'ohne_versand' ? 'ohne_versand' : 'ausstehend',
    });
    if (m !== 'ohne_versand') {
      const betreff = TEAM.versand.betreff.replace('{kw}', kw) + (m === 'test' ? ' (Test)' : '');
      try {
        if (weg === 'slack') {
          // Eine kurze Nachricht mit PDF und den beiden Excel-Dateien.
          const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const text = `*${titel}*\n${kern.map(k => `• ${esc(k)}`).join('\n')}\n_Report im PDF. Firmen, Werte und Close-Links in der Excel „Verbleib“, alle ausgewerteten Gespräche in „Codierungen“._`;
          await require('./slack').sendeDateien({
            ziel: m === 'live' ? { kanal: process.env.SLACK_KANAL_ID } : { emails: TEAM.versand.slack.test_an },
            text, dateien: anh,
          });
        } else {
          const e = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
          const html = `<div style="font-family:Arial,sans-serif;font-size:14px"><p><b>${e(titel)}</b></p><ul>${kern.map(k => `<li>${e(k)}</li>`).join('')}</ul><p style="color:#555">Report im PDF-Anhang. Firmen, Werte und Close-Links in der Excel „Verbleib“, alle ausgewerteten Gespräche in „Codierungen“.</p></div>`;
          await sendEmail({ to: empf, subject: betreff, html, attachments: anh });
        }
        await db.run(`UPDATE weekly_reports SET versand_status='gesendet', versendet_am=${NOW()} WHERE id=${P(1)}`, [reportId]);
        log(`  versendet an ${empf.join(', ')}`);
      } catch (e) {
        await db.run(`UPDATE weekly_reports SET versand_status='fehler', fehler=${P(1)} WHERE id=${P(2)}`, [e.message.slice(0, 500), reportId]);
        throw new Error('Versand fehlgeschlagen: ' + e.message);
      }
    }
    // Lokale Kopie fuer Pruefzwecke (nur wenn ANALYSE_AUSGABE_DIR gesetzt, z. B. beim lokalen Testlauf)
    if (process.env.ANALYSE_AUSGABE_DIR) {
      const fs = require('fs'), path = require('path');
      fs.mkdirSync(process.env.ANALYSE_AUSGABE_DIR, { recursive: true });
      for (const a of anh) fs.writeFileSync(path.join(process.env.ANALYSE_AUSGABE_DIR, a.filename), a.content);
    }
    return { abdeckung: d.abdeckung, kosten: kostenCod + kostenTexte, fehler: warnungen, reportId };
  });
}

/** Cron-Registrierung (Europe/Berlin). Aktiv auf Railway (DATABASE_URL) oder mit ANALYSE_JOBS=an; ANALYSE_JOBS=aus schaltet ab. */
function registriereCron(cron) {
  const an = process.env.ANALYSE_JOBS ? process.env.ANALYSE_JOBS === 'an' : !!process.env.DATABASE_URL;
  if (!an) { console.log('[analyse] Cron-Jobs aus (ANALYSE_JOBS)'); return; }
  const tz = { timezone: 'Europe/Berlin' };
  const sicher = (fn) => async () => { try { await fn(); } catch (e) { console.error('[analyse] Cron-Fehler:', e.message); } };
  cron.schedule('0 23 * * *', sicher(() => codierlauf()), tz);                          // taeglich 23:00 Codierung
  cron.schedule('0 17 * * 5', sicher(() => codierlauf({ ausgeloestVon: 'cron' })), tz);  // Freitag 17:00 Zusatzlauf
  cron.schedule('*/10 * * * *', sicher(() => einsammeln()), tz);                        // Batches einsammeln
  cron.schedule('55 19 * * 5', sicher(() => einsammeln()), tz);                         // Freitag: letzter Stand 19:55
  cron.schedule('30 5 * * *', sicher(() => verbleiblauf()), tz);                        // Verbleib-Liste taeglich
  cron.schedule('0 20 * * 5', sicher(() => reportlauf()), tz);                          // Freitag 20:00 Report
  console.log('[analyse] Cron-Jobs registriert (23:00 Codierung, Fr 17:00 Zusatzlauf, alle 10 Min. Einsammeln, 05:30 Verbleib, Fr 20:00 Report)');
}

function status() { return Object.fromEntries(Object.entries(aktiv).map(([k, v]) => [k, v])); }

module.exports = { codierlauf, einsammeln, verbleiblauf, reportlauf, registriereCron, status, fehlerMail };
