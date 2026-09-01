// Close-Sync fuer die Show-Rates (Opener/Setter). READ-ONLY gegenueber Close.
//
// Datenquelle sind Opportunities + ihre Status-Historie, NICHT Custom Activities
// (siehe docs/close-discovery.md). Zwei Eigenheiten der Close-API bestimmen den Aufbau:
//
//  1. Status-LABELS sind NICHT stabil. Close loest sie dynamisch auf — nach einer Umbenennung
//     liefern auch historische Events das neue Label (belegt am 31.08.: alle 24 Juni-Events kamen
//     mit den neuen Namen zurueck). Deshalb wird ausschliesslich ueber die stabile status_id
//     gemappt; Labels werden nur zur Anzeige mitgefuehrt.
//  2. Beim ANLEGEN einer Opportunity feuert Close KEIN status_change-Event (von 40 an einem Tag
//     angelegten Opportunities hatten 38 keines). Ein Termin gilt deshalb auch dann als "gelegt",
//     wenn die Opportunity bereits MIT dem Terminiert-Status angelegt wurde.
//
// Ablauf: Rohdaten spiegeln (Events + Opportunities) -> User-Mapping pflegen -> termine ableiten.
// Weil die Rohdaten lokal vollstaendig liegen, koennen spaet nachgetragene Ausgaenge jederzeit
// korrekt neu bewertet werden.
const db = require('../db');
const close = require('./closeClient');

const pg = () => db.dialect === 'postgres';
const P = (i) => pg() ? `$${i}` : '?';
const NOW = () => pg() ? 'NOW()' : `datetime('now')`;

// Datums-Normalisierung. Dialekt-Falle: Postgres liefert TIMESTAMPTZ als JS-Date, SQLite als
// ISO-String. toISOString() waere ebenfalls falsch — ein Termin um 00:30 Berliner Zeit rutschte
// in UTC in den Vormonat. Deshalb explizit Europe/Berlin ('sv-SE' liefert YYYY-MM-DD), DST-sicher.
const BERLIN = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });
const ymd = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? String(v).slice(0, 10) : BERLIN.format(d);
};
const ym = (v) => { const s = ymd(v); return s ? s.slice(0, 7) : null; };

// ── Status-Landkarte der Pipeline "Sales" (stabile IDs, Label nur als Kommentar) ─────────────
const S = {
  QC_TERMINIERT:  'stat_cYlePQlUq6XJptmG3z8xL1sNEbNW9EyA4kY9GsLVbbl', // "QC Terminiert"  (vorm. Setting terminiert)
  QC_FOLLOWUP:    'stat_MyJ8Ynlb4PomnOSBaEqCiE2C0SKqJDK6jQhkTpbcDvs', // "QC Follow-Up"   (vorm. Setting Follow-Up Kurzfristig)
  SC_TERMINIERT:  'stat_LSBKj1hMfk8GZ2aQSBky9DN9Al3ka34nTlwU593Yjtc', // "SC Terminiert"  (vorm. Closing terminiert)
  QC_SC_AUSSTEH:  'stat_2MRRrC6kCkqIbsBWhbjLrmxwYbkWTNMsBlD4bG2mje2', // "QC=SC Ausstehend" (vorm. Closing-Termin ausstehend)
  QC_ABGESAGT:    'stat_gcSOz9BCxExghxbLTBKddlE1zIzxIm3VffdzMIFvyzF', // "QC Abgesagt"    (vorm. Setting abgesagt)
  QC_NOSHOW:      'stat_WvaplVFvURd2dodrvGDyCCcK7KQm8ejbz3FbCl7AE2P', // "QC No/Show"     (vorm. Setting No-Show)
  QC_VERSCHOBEN:  'stat_SWO5jUdXrjy6SODw2Mh6I75hFKhgf4VeksJizpK66xo', // "QC Verschoben"  (neu)
  SC_STATT_FU:    'stat_Db2TQE72ssnCMQjTRWNgqvWhlJeII1OGvFcVNO7v4mo', // "SC/ Statt. FU"  (vorm. Angebot verschickt)
  SC_STATT_KEINA: 'stat_tFfUQm9SqBlhsDUKXgZh8uF4f0nD011sBrlllLSFih6', // "SC/ Statt. Kein Angebot" (neu)
  SC_ABGESAGT:    'stat_NsGWOzt6zmoYnn0qoY6EnsFU2PdOcRjjfMf1UNcx6hK', // "SC/ Abgesagt"   (vorm. Closing abgesagt)
  SC_NOSHOW:      'stat_xQx98coO1LRHvv2zuPNk80ucRD9MBxMsXltUCFxq9pz', // "SC/ No-Show"    (neu)
  WON:            'stat_QlI71Ac72FHKEIim2ZakEkdn4hRm1ouPNtlZCjE02kO',
  LOST:           'stat_LtXdeBi13jQKLzSqCpaUaKA5ACWNYj7AT2aKPuNnziP',
  BLACKLIST:      'stat_BYmqz7dEWULTFVLmycFDlNst38TyCXkYmkpsTs46bx8',
  // Altstatus — bis 31.08. aktiv genutzt, seither mit Suffix "Inaktiv". Fuer die Historie noetig.
  ALT_CLOSING_NOSHOW: 'stat_D0adTVACBCCJeadQxSszDuHr4sItzpNtnUVV9B7Ieat',
  ALT_HIGHPOT:        'stat_GSwscC9bevmcBcSjyBJ5ARxSUs5s5QiYLQZXsYVlZyw',
  ALT_CC2:            'stat_L6trSYPIfU7exj2fiMohWXHEcevoWW9abeMXkADnZ8W',
  ALT_SOFTCLOSE:      'stat_5DkKmUIYtFQywWmviWREi8m5CHkRXFN9n1Y3tg7gybC',
  ALT_FU_KURZ:        'stat_QRgXnhI0dHCPo9ZE1oCYhLIJhvxgkinAqTV8TbDkjxl',
  ALT_FU_LANG:        'stat_dglO5Vv2dr0AviE3w1GCj4bx62Gk4BQVZ6t6tJuKsrb',
  ALT_FOLLOWUP:       'stat_7ThvPTpIGfBdZc4AmRqWKV9vqnf6xRMO3MZNOzBHx2J',
  ALT_UNQUAL:         'stat_Hha8EV0m7dKMCYTt7Zlxu6eyHUE0gxjMUYiJ0Gqe1Ku',
};

// Welcher Status legt welchen Termin?
const GELEGT = { [S.QC_TERMINIERT]: 'setting', [S.SC_TERMINIERT]: 'closing' };

// Ausgang: der erste dieser Status NACH dem Legen entscheidet.
const NEGATIV = {
  setting: new Set([S.QC_ABGESAGT, S.QC_NOSHOW, S.QC_VERSCHOBEN]),
  closing: new Set([S.SC_ABGESAGT, S.SC_NOSHOW, S.ALT_CLOSING_NOSHOW]),
};
// Beweist, dass der Termin stattgefunden hat (der Prozess ist weitergelaufen).
// Fuers Setting zaehlt jeder SC-Status mit: dass ueberhaupt ein Sales Call angesetzt oder
// bewertet wurde, setzt das stattgefundene QC voraus.
const POSITIV = {
  setting: new Set([S.QC_FOLLOWUP, S.QC_SC_AUSSTEH, S.SC_TERMINIERT, S.SC_STATT_FU, S.SC_STATT_KEINA,
    S.SC_ABGESAGT, S.SC_NOSHOW, S.WON, S.ALT_CLOSING_NOSHOW, S.ALT_HIGHPOT, S.ALT_CC2,
    S.ALT_SOFTCLOSE, S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_FOLLOWUP, S.ALT_UNQUAL]),
  closing: new Set([S.SC_STATT_FU, S.SC_STATT_KEINA, S.WON, S.ALT_HIGHPOT, S.ALT_CC2,
    S.ALT_SOFTCLOSE, S.ALT_FU_KURZ, S.ALT_FU_LANG, S.ALT_UNQUAL]),
};
// Direkt hierhin = kein Rueckschluss auf das Stattfinden -> nicht werten.
const UNKLAR = new Set([S.LOST, S.BLACKLIST]);
const BEKANNT = new Set(Object.values(S));

const kanalAus = (label) => {
  const m = /\baus\s+(MailMarketing|FAX Leads|Post)\b/i.exec(label || '');
  return m ? m[1] : null;
};

// ── (1) Statuswechsel spiegeln ───────────────────────────────────────────────
async function syncStatusEvents({ since, log = () => {} } = {}) {
  const von = since || (await naechsterStart());
  const out = {};
  for (const [typ, pfad] of [['opportunity', '/activity/status_change/opportunity/'],
                             ['lead', '/activity/status_change/lead/']]) {
    const rows = await close.getAll(pfad, { date_created__gte: von }, { max: 50000, limit: 100 });
    log(`  ${typ}: ${rows.length} Events ab ${von}`);
    const cols = 'id,typ,lead_id,opportunity_id,old_status_label,new_status_label,new_status_type,pipeline_name,close_user_id,close_user_name,date_created,old_status_id,new_status_id';
    // DO UPDATE statt DO NOTHING: zieht die status_id auch fuer bereits gespiegelte Zeilen nach.
    const upd = `old_status_label=EXCLUDED.old_status_label, new_status_label=EXCLUDED.new_status_label,
                 old_status_id=EXCLUDED.old_status_id, new_status_id=EXCLUDED.new_status_id`;
    for (const e of rows) {
      const vals = [e.id, typ, e.lead_id ?? null, e.opportunity_id ?? null,
        e.old_status_label ?? null, e.new_status_label ?? null, e.new_status_type ?? null,
        e.new_pipeline_name ?? null, e.user_id ?? null, e.user_name ?? null, e.date_created,
        e.old_status_id ?? null, e.new_status_id ?? null];
      const ph = vals.map((_, i) => P(i + 1)).join(',');
      await db.run(`INSERT INTO close_status_events (${cols}) VALUES (${ph}) ON CONFLICT (id) DO UPDATE SET ${upd}`, vals);
    }
    out[typ] = rows.length;
  }
  return out;
}

async function naechsterStart(tageUeberlappung = 7) {
  const r = await db.get(`SELECT MAX(date_created) m FROM close_status_events`);
  if (!r || !r.m) return process.env.CLOSE_BACKFILL_AB || '2026-06-01';
  const d = new Date(r.m);
  d.setDate(d.getDate() - tageUeberlappung);
  return d.toISOString().slice(0, 10);
}

// ── (2) Opportunities spiegeln (Anlage-Erkennung + Rollenfelder) ─────────────
async function syncOpportunities({ since, log = () => {} } = {}) {
  const von = since || process.env.CLOSE_BACKFILL_AB || '2026-06-01';
  const cf = (await close.get('/custom_field/opportunity/', { _limit: 100 })).data || [];
  const idVon = (name) => (cf.find(f => f.name === name) || {}).id;
  const setterCf = idVon('Setter'), closerCf = idVon('Closer');
  const wert = (o, id) => id ? (o[`custom.${id}`] ?? null) : null;

  const rows = await close.getAll('/opportunity/', { date_updated__gte: von }, { max: 50000, limit: 100 });
  log(`  opportunities: ${rows.length} ab ${von}`);
  const cols = 'id,lead_id,status_id,status_label,pipeline_name,user_id,user_name,created_by,created_by_name,setter_user_id,closer_user_id,date_created,date_updated';
  const upd = cols.split(',').slice(1).map(c => `${c}=EXCLUDED.${c}`).join(', ') + `, synced_at=${NOW()}`;
  for (const o of rows) {
    const vals = [o.id, o.lead_id ?? null, o.status_id ?? null, o.status_label ?? null,
      o.pipeline_name ?? null, o.user_id ?? null, o.user_name ?? null, o.created_by ?? null,
      o.created_by_name ?? null, wert(o, setterCf), wert(o, closerCf), o.date_created, o.date_updated];
    const ph = vals.map((_, i) => P(i + 1)).join(',');
    await db.run(`INSERT INTO close_opportunities (${cols}) VALUES (${ph}) ON CONFLICT (id) DO UPDATE SET ${upd}`, vals);
  }
  return { gesamt: rows.length };
}

// ── (3) Close-User -> employee ───────────────────────────────────────────────
async function syncUserMap({ log = () => {} } = {}) {
  const users = ((await close.get('/user/', { _limit: 200 })).data || [])
    .map(u => ({ id: u.id, name: `${u.first_name || ''} ${u.last_name || ''}`.trim(), email: (u.email || '').toLowerCase() }));
  let neu = 0, auto = 0;
  for (const u of users) {
    const vorhanden = await db.get(`SELECT close_user_id FROM close_user_map WHERE close_user_id=${P(1)}`, [u.id]);
    if (!vorhanden) {
      let empId = null;
      if (u.email) {
        const t = await db.get(`SELECT employee_id FROM users WHERE LOWER(email)=${P(1)} AND employee_id IS NOT NULL`, [u.email]);
        if (t) empId = t.employee_id;
      }
      if (!empId && u.name) {
        const e = await db.get(`SELECT id FROM employees WHERE LOWER(TRIM(name))=${P(1)}`, [u.name.toLowerCase().trim()]);
        if (e) empId = e.id;
      }
      const wahr = pg() ? true : 1, falsch = pg() ? false : 0;
      await db.run(
        `INSERT INTO close_user_map (close_user_id, close_name, close_email, employee_id, auto_zugeordnet) VALUES (${P(1)},${P(2)},${P(3)},${P(4)},${P(5)})`,
        [u.id, u.name || null, u.email || null, empId, empId ? wahr : falsch]);
      neu++; if (empId) auto++;
    } else {
      await db.run(`UPDATE close_user_map SET close_name=${P(1)}, close_email=${P(2)}, updated_at=${NOW()} WHERE close_user_id=${P(3)}`,
        [u.name || null, u.email || null, u.id]);
    }
  }
  log(`  close_user_map: ${users.length} Close-User, ${neu} neu, davon ${auto} automatisch zugeordnet`);
  return { gesamt: users.length, neu, auto };
}

// ── (4) termine ableiten (ueber status_id, inkl. Anlage-Termine) ─────────────
async function deriveTermine({ log = () => {} } = {}) {
  // Untergrenze: Opportunities, die VOR dem Backfill-Start angelegt wurden, haben eine
  // Statushistorie, die wir nicht gespiegelt haben — ihr Ausgang saehe faelschlich "offen" aus.
  // Solche Termine gehoeren nicht in die Auswertung.
  const AB = process.env.CLOSE_BACKFILL_AB || '2026-06-01';
  const opps = await db.all(
    `SELECT id, lead_id, status_id, user_id, user_name, created_by, created_by_name, date_created
       FROM close_opportunities`);
  const evs = await db.all(
    `SELECT id, opportunity_id, lead_id, old_status_id, new_status_id, new_status_label, close_user_id, close_user_name, date_created
       FROM close_status_events WHERE typ='opportunity' ORDER BY opportunity_id, date_created, id`);
  const leadEv = await db.all(
    `SELECT lead_id, new_status_label, date_created FROM close_status_events WHERE typ='lead' ORDER BY lead_id, date_created`);

  const kanaele = {};
  for (const e of leadEv) {
    const k = kanalAus(e.new_status_label);
    if (k) (kanaele[e.lead_id] = kanaele[e.lead_id] || []).push({ am: ymd(e.date_created), k });
  }
  const quelleFuer = (leadId, am) => {
    const l = kanaele[leadId]; if (!l || !l.length) return null;
    let treffer = null;
    for (const x of l) if (x.am <= am) treffer = x.k;
    return treffer || l[0].k;
  };

  const byOpp = {};
  for (const e of evs) (byOpp[e.opportunity_id] = byOpp[e.opportunity_id] || []).push(e);

  const mapRows = await db.all(`SELECT close_user_id, employee_id, ignorieren FROM close_user_map`);
  const empVon = Object.fromEntries(mapRows
    .filter(m => !(m.ignorieren === true || m.ignorieren === 1))
    .map(m => [m.close_user_id, m.employee_id]));

  const unbekannt = {};
  const merkeUnbekannt = (sid, label) => { if (sid && !BEKANNT.has(sid)) unbekannt[sid] = label || sid; };

  // Ausgang bestimmen: erster wertender Status in der Restliste.
  const ausgangVon = (art, rest) => {
    for (const e of rest) {
      if (NEGATIV[art].has(e.new_status_id)) return { status: 'nicht_stattgefunden', e };
      if (POSITIV[art].has(e.new_status_id)) return { status: 'stattgefunden', e };
      if (UNKLAR.has(e.new_status_id))       return { status: 'unklar', e };
    }
    return { status: 'offen', e: null };
  };

  const runTs = new Date().toISOString();
  const cols = 'close_event_id,close_opportunity_id,close_lead_id,art,gelegt_am,monat,close_user_id,gelegt_von_name,employee_id,status,ausgang_status,ausgang_am,quelle,berechnet_am,herkunft,status_id';
  const updSet = `close_opportunity_id=EXCLUDED.close_opportunity_id, close_lead_id=EXCLUDED.close_lead_id,
    art=EXCLUDED.art, gelegt_am=EXCLUDED.gelegt_am, monat=EXCLUDED.monat, close_user_id=EXCLUDED.close_user_id,
    gelegt_von_name=EXCLUDED.gelegt_von_name, employee_id=EXCLUDED.employee_id, status=EXCLUDED.status,
    ausgang_status=EXCLUDED.ausgang_status, ausgang_am=EXCLUDED.ausgang_am, quelle=EXCLUDED.quelle,
    berechnet_am=EXCLUDED.berechnet_am, herkunft=EXCLUDED.herkunft, status_id=EXCLUDED.status_id`;

  let nAnlage = 0, nWechsel = 0;
  const schreibe = async (t) => {
    const vals = [t.eventId, t.oppId, t.leadId, t.art, t.am, t.monat, t.userId, t.userName,
      empVon[t.userId] ?? null, t.status, t.ausgangLabel, t.ausgangAm, t.quelle, runTs, t.herkunft, t.statusId];
    const ph = vals.map((_, i) => P(i + 1)).join(',');
    await db.run(`INSERT INTO termine (${cols}) VALUES (${ph}) ON CONFLICT (close_event_id) DO UPDATE SET ${updSet}`, vals);
  };

  for (const o of opps) {
    const list = byOpp[o.id] || [];
    list.forEach(e => merkeUnbekannt(e.new_status_id, e.new_status_label));
    merkeUnbekannt(o.status_id, null);

    // (a) Anlage: Anfangsstatus = old_status_id des ersten Events, sonst der aktuelle Status.
    const initial = list.length ? list[0].old_status_id : o.status_id;
    if (GELEGT[initial] && ymd(o.date_created) >= AB) {
      const art = GELEGT[initial];
      const a = ausgangVon(art, list);
      const am = ymd(o.date_created);
      await schreibe({ eventId: `create:${o.id}`, oppId: o.id, leadId: o.lead_id, art, am, monat: ym(o.date_created),
        userId: o.user_id || o.created_by, userName: o.user_name || o.created_by_name,
        status: a.status, ausgangLabel: a.e ? (a.e.new_status_label || a.e.new_status_id) : null, ausgangAm: a.e ? ymd(a.e.date_created) : null,
        quelle: quelleFuer(o.lead_id, am), herkunft: 'anlage', statusId: initial });
      nAnlage++;
    }
    // (b) jeder Wechsel IN einen Terminiert-Status
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const art = GELEGT[e.new_status_id];
      if (!art || ymd(e.date_created) < AB) continue;
      const a = ausgangVon(art, list.slice(i + 1));
      const am = ymd(e.date_created);
      await schreibe({ eventId: e.id, oppId: o.id, leadId: e.lead_id || o.lead_id, art, am, monat: ym(e.date_created),
        userId: e.close_user_id, userName: e.close_user_name,
        status: a.status, ausgangLabel: a.e ? (a.e.new_status_label || a.e.new_status_id) : null, ausgangAm: a.e ? ymd(a.e.date_created) : null,
        quelle: quelleFuer(e.lead_id || o.lead_id, am), herkunft: 'wechsel', statusId: e.new_status_id });
      nWechsel++;
    }
  }
  await db.run(`DELETE FROM termine WHERE berechnet_am < ${P(1)}`, [runTs]);
  const u = Object.keys(unbekannt).length;
  log(`  termine: ${nAnlage + nWechsel} (${nAnlage} aus Anlage, ${nWechsel} aus Statuswechsel)${u ? ` · ⚠️ ${u} unbekannte Status` : ''}`);
  return { abgeleitet: nAnlage + nWechsel, ausAnlage: nAnlage, ausWechsel: nWechsel, unbekannteStatus: Object.keys(unbekannt) };
}

async function runSync({ since, log = console.log } = {}) {
  const t0 = Date.now();
  log('[close-sync] Start' + (since ? ` (ab ${since})` : ' (inkrementell)'));
  const events = await syncStatusEvents({ since, log });
  const opportunities = await syncOpportunities({ since, log });
  const map = await syncUserMap({ log });
  const termine = await deriveTermine({ log });
  const dauer = ((Date.now() - t0) / 1000).toFixed(1);
  log(`[close-sync] Fertig in ${dauer}s`);
  return { events, opportunities, map, termine, dauerSek: Number(dauer) };
}

module.exports = { runSync, syncStatusEvents, syncOpportunities, syncUserMap, deriveTermine,
  S, GELEGT, NEGATIV, POSITIV, UNKLAR, BEKANNT, kanalAus };
