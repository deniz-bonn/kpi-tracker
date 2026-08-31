// Close-Sync fuer die Show-Rates (Opener/Setter). READ-ONLY gegenueber Close.
//
// Datenquelle sind die Status-Historien, NICHT Custom Activities (siehe docs/close-discovery.md Rev. 2):
//   /activity/status_change/opportunity/  -> Detail-Funnel (Pipeline "Sales", inkl. No-Show/Abgesagt)
//   /activity/status_change/lead/         -> Kanal/Quelle ("… aus MailMarketing/FAX Leads/Post")
//
// Ablauf: (1) Rohdaten append-only in close_status_events, (2) close_user_map pflegen/vorschlagen,
// (3) termine daraus neu ableiten. Weil die Rohdaten lokal vollstaendig liegen, koennen spaet
// nachgetragene Ausgaenge jederzeit korrekt neu bewertet werden.
const db = require('../db');
const close = require('./closeClient');

const pg = () => db.dialect === 'postgres';
const P = (i) => pg() ? `$${i}` : '?';
const NOW = () => pg() ? 'NOW()' : `datetime('now')`;
// Datums-Normalisierung. ACHTUNG Dialekt-Falle: Postgres liefert TIMESTAMPTZ als JS-Date,
// SQLite als ISO-String. Und toISOString() waere falsch — ein Statuswechsel um 00:30 Berliner Zeit
// wuerde in UTC in den Vormonat rutschen. Deshalb explizit in Europe/Berlin formatieren
// ('sv-SE' liefert YYYY-MM-DD), DST-sicher und fuer beide Dialekte identisch.
const BERLIN = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' });
const ymd = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? String(v).slice(0, 10) : BERLIN.format(d);
};
const ym = (v) => { const s = ymd(v); return s ? s.slice(0, 7) : null; };

// ── Fachlogik: Wann gilt ein Termin als gelegt / stattgefunden? ──────────────
const GELEGT = { 'Setting terminiert': 'setting', 'Closing terminiert': 'closing' };
const NEGATIV = {
  setting: new Set(['Setting No-Show', 'Setting abgesagt']),
  closing: new Set(['Closing No-Show / Absagen', 'Closing abgesagt']),
};
// Status, die BEWEISEN, dass der Termin stattgefunden hat (der Prozess ist weitergelaufen).
const POSITIV = {
  setting: new Set(['Closing-Termin ausstehend', 'Closing terminiert', 'Setting Follow-Up (Kurzfristig)',
    'Follow-Up', 'Angebot verschickt', 'Closing #High Potentials', 'Closing Call #2 terminiert',
    'Soft-Close (Onboarding)', 'Closing Follow-Up (Kurzfristig)', 'Closing Follow-Up (Langfristig)',
    'Won', 'Unqualifiziert']),
  closing: new Set(['Angebot verschickt', 'Closing #High Potentials', 'Closing Call #2 terminiert',
    'Soft-Close (Onboarding)', 'Closing Follow-Up (Kurzfristig)', 'Closing Follow-Up (Langfristig)',
    'Won', 'Unqualifiziert']),
};
// Direkt hierhin = kein Rueckschluss auf das Stattfinden moeglich -> nicht werten.
const UNKLAR = new Set(['Lost', 'Blacklist']);
// Kanal aus dem Lead-Status ("Setting terminiert aus MailMarketing" -> "MailMarketing")
const kanalAus = (label) => {
  const m = /\baus\s+(MailMarketing|FAX Leads|Post)\b/i.exec(label || '');
  return m ? m[1] : null;
};

// ── (1) Rohdaten holen ───────────────────────────────────────────────────────
async function syncStatusEvents({ since, log = () => {} } = {}) {
  const von = since || (await naechsterStart());
  const eingefuegt = { opportunity: 0, lead: 0 };
  for (const [typ, pfad] of [['opportunity', '/activity/status_change/opportunity/'],
                             ['lead', '/activity/status_change/lead/']]) {
    const rows = await close.getAll(pfad, { date_created__gte: von }, { max: 50000, limit: 100 });
    log(`  ${typ}: ${rows.length} Events ab ${von}`);
    for (const e of rows) {
      const vals = [e.id, typ, e.lead_id ?? null, e.opportunity_id ?? null,
        e.old_status_label ?? null, e.new_status_label ?? null, e.new_status_type ?? null,
        e.new_pipeline_name ?? null, e.user_id ?? null, e.user_name ?? null, e.date_created];
      const cols = 'id,typ,lead_id,opportunity_id,old_status_label,new_status_label,new_status_type,pipeline_name,close_user_id,close_user_name,date_created';
      const ph = vals.map((_, i) => P(i + 1)).join(',');
      if (pg()) await db.run(`INSERT INTO close_status_events (${cols}) VALUES (${ph}) ON CONFLICT (id) DO NOTHING`, vals);
      else      db.run(`INSERT OR IGNORE INTO close_status_events (${cols}) VALUES (${ph})`, vals);
      eingefuegt[typ]++;
    }
  }
  return eingefuegt;
}

// Inkrementell ab dem juengsten bekannten Event minus Sicherheitsfenster (spaete Nachtraege).
async function naechsterStart(tageUeberlappung = 7) {
  const r = await db.get(`SELECT MAX(date_created) m FROM close_status_events`);
  if (!r || !r.m) return process.env.CLOSE_BACKFILL_AB || '2026-06-01';
  const d = new Date(r.m);
  d.setDate(d.getDate() - tageUeberlappung);
  return d.toISOString().slice(0, 10);
}

// ── (2) Close-User -> employee ───────────────────────────────────────────────
// Auto-Vorschlag ueber die vorhandene Bruecke users.email -> users.employee_id -> employees.
// Bestehende manuelle Zuordnungen werden NIE ueberschrieben.
async function syncUserMap({ log = () => {} } = {}) {
  const users = ((await close.get('/user/', { _limit: 200 })).data || [])
    .map(u => ({ id: u.id, name: `${u.first_name || ''} ${u.last_name || ''}`.trim(), email: (u.email || '').toLowerCase() }));
  let neu = 0, auto = 0;
  for (const u of users) {
    const vorhanden = await db.get(`SELECT close_user_id, employee_id FROM close_user_map WHERE close_user_id=${P(1)}`, [u.id]);
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

// ── (3) termine aus den Rohdaten ableiten ────────────────────────────────────
async function deriveTermine({ log = () => {} } = {}) {
  const opp = await db.all(
    `SELECT id, opportunity_id, lead_id, new_status_label, close_user_id, close_user_name, date_created
       FROM close_status_events WHERE typ='opportunity' ORDER BY opportunity_id, date_created, id`);
  const leadEv = await db.all(
    `SELECT lead_id, new_status_label, date_created FROM close_status_events
      WHERE typ='lead' ORDER BY lead_id, date_created`);

  // Kanal je Lead ueber die Zeit (fuer die Quelle-Dimension)
  const kanaele = {};
  for (const e of leadEv) {
    const k = kanalAus(e.new_status_label);
    if (k) (kanaele[e.lead_id] = kanaele[e.lead_id] || []).push({ am: ymd(e.date_created), k });
  }
  const quelleFuer = (leadId, am) => {
    const l = kanaele[leadId]; if (!l || !l.length) return null;
    let treffer = null;
    for (const x of l) { if (x.am <= am) treffer = x.k; }
    return treffer || l[0].k;
  };

  // Zeitachse je Opportunity
  const byOpp = {};
  for (const e of opp) (byOpp[e.opportunity_id] = byOpp[e.opportunity_id] || []).push(e);

  const mapRows = await db.all(`SELECT close_user_id, employee_id, ignorieren FROM close_user_map`);
  const empVon = Object.fromEntries(mapRows
    .filter(m => !(m.ignorieren === true || m.ignorieren === 1))
    .map(m => [m.close_user_id, m.employee_id]));

  const runTs = new Date().toISOString();
  let n = 0;
  for (const list of Object.values(byOpp)) {
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const art = GELEGT[e.new_status_label];
      if (!art) continue;
      let status = 'offen', ausgang = null, ausgangAm = null;
      for (let j = i + 1; j < list.length; j++) {
        const lbl = list[j].new_status_label;
        if (NEGATIV[art].has(lbl)) { status = 'nicht_stattgefunden'; ausgang = lbl; ausgangAm = ymd(list[j].date_created); break; }
        if (POSITIV[art].has(lbl)) { status = 'stattgefunden';       ausgang = lbl; ausgangAm = ymd(list[j].date_created); break; }
        if (UNKLAR.has(lbl))       { status = 'unklar';              ausgang = lbl; ausgangAm = ymd(list[j].date_created); break; }
      }
      const am = ymd(e.date_created);
      const vals = [e.id, e.opportunity_id, e.lead_id, art, am, ym(e.date_created), e.close_user_id,
        e.close_user_name, empVon[e.close_user_id] ?? null, status, ausgang, ausgangAm,
        quelleFuer(e.lead_id, am), runTs];
      const cols = 'close_event_id,close_opportunity_id,close_lead_id,art,gelegt_am,monat,close_user_id,gelegt_von_name,employee_id,status,ausgang_status,ausgang_am,quelle,berechnet_am';
      const ph = vals.map((_, k) => P(k + 1)).join(',');
      const upd = `close_opportunity_id=EXCLUDED.close_opportunity_id, close_lead_id=EXCLUDED.close_lead_id,
        art=EXCLUDED.art, gelegt_am=EXCLUDED.gelegt_am, monat=EXCLUDED.monat, close_user_id=EXCLUDED.close_user_id,
        gelegt_von_name=EXCLUDED.gelegt_von_name, employee_id=EXCLUDED.employee_id, status=EXCLUDED.status,
        ausgang_status=EXCLUDED.ausgang_status, ausgang_am=EXCLUDED.ausgang_am, quelle=EXCLUDED.quelle,
        berechnet_am=EXCLUDED.berechnet_am`;
      await db.run(`INSERT INTO termine (${cols}) VALUES (${ph}) ON CONFLICT (close_event_id) DO UPDATE SET ${upd}`, vals);
      n++;
    }
  }
  // Termine, deren Quell-Event verschwunden ist (z. B. Opportunity in Close geloescht), entfernen.
  const del = await db.run(`DELETE FROM termine WHERE berechnet_am < ${P(1)}`, [runTs]);
  log(`  termine: ${n} abgeleitet${del?.rowCount ? `, ${del.rowCount} verwaiste entfernt` : ''}`);
  return { abgeleitet: n };
}

// ── Orchestrierung ───────────────────────────────────────────────────────────
async function runSync({ since, log = console.log } = {}) {
  const t0 = Date.now();
  log('[close-sync] Start' + (since ? ` (ab ${since})` : ' (inkrementell)'));
  const events = await syncStatusEvents({ since, log });
  const map = await syncUserMap({ log });
  const termine = await deriveTermine({ log });
  const dauer = ((Date.now() - t0) / 1000).toFixed(1);
  log(`[close-sync] Fertig in ${dauer}s`);
  return { events, map, termine, dauerSek: Number(dauer) };
}

module.exports = { runSync, syncStatusEvents, syncUserMap, deriveTermine, GELEGT, NEGATIV, POSITIV, UNKLAR, kanalAus };
