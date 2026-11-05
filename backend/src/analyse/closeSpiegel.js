// Erweiterung des Close-Spiegels fuer die Wochenanalyse: Anrufe, Aufgaben, Lead-Domains.
// READ-ONLY gegenueber Close (einzige Zugriffsschicht: utils/closeClient.js, nur GET).
// Gespeichert werden NUR Metadaten — keine Transkripte, keine Notizen, keine Mailadressen.
const close = require('../utils/closeClient');
const { db, P, PH, NOW, B, ymd, tsParam, upsert, sleep } = require('./basis');

const FREEMAIL = /^(gmail|googlemail|gmx|web|outlook|hotmail|t-online|yahoo|icloud|freenet|aol|live|me)\./i;

/**
 * Anrufe der angegebenen Close-Benutzer im Zeitraum spiegeln.
 * von/bis: 'YYYY-MM-DD' (Berlin, bis inklusive). Liefert die gespiegelten Zeilen.
 */
async function spiegleCalls({ von, bis, userIds, log = () => {} }) {
  // Close filtert in UTC; ein Tag Rand auf beiden Seiten, danach exakt auf Berlin-Datum schneiden.
  const vonUtc = new Date(Date.parse(von + 'T00:00:00Z') - 864e5).toISOString().slice(0, 10);
  const bisUtc = new Date(Date.parse(bis + 'T00:00:00Z') + 2 * 864e5).toISOString().slice(0, 10);
  const out = [];
  for (const uid of userIds) {
    const rows = await close.getAll('/activity/call/', {
      user_id: uid, date_created__gte: vonUtc, date_created__lt: bisUtc,
      _fields: 'id,lead_id,user_id,user_name,duration,direction,date_created,activity_at,recording_url',
    }, { max: 20000, limit: 100 });
    for (const c of rows) {
      const beginn = c.activity_at || c.date_created;
      const datum = ymd(beginn);
      if (datum < von || datum > bis) continue;
      const z = { id: c.id, lead_id: c.lead_id || null, user_id: c.user_id || null, user_name: c.user_name || null,
        dauer_sek: Math.round(Number(c.duration) || 0), richtung: c.direction || null, beginn, datum,
        hat_aufnahme: !!c.recording_url };
      await upsert('close_calls',
        ['id', 'lead_id', 'user_id', 'user_name', 'dauer_sek', 'richtung', 'beginn', 'datum', 'hat_aufnahme'],
        [z.id, z.lead_id, z.user_id, z.user_name, z.dauer_sek, z.richtung, tsParam(z.beginn), z.datum, B(z.hat_aufnahme)], ['id']);
      out.push(z);
    }
    await sleep(200);
  }
  log(`  close_calls: ${out.length} Anrufe ${von}–${bis} (${userIds.length} Benutzer)`);
  return out;
}

/** Aufgaben je Lead spiegeln (vollstaendig je Lead: in Close geloeschte Aufgaben fallen heraus). */
async function spiegleTasks({ leadIds, log = () => {} }) {
  let n = 0;
  const fehler = [];
  const ids = [...new Set(leadIds.filter(Boolean))];
  let i = 0;
  const worker = async () => {
    while (i < ids.length) {
      const lid = ids[i++];
      let rows;
      try {
        rows = await close.getAll('/task/', { lead_id: lid, _fields: 'id,lead_id,text,date,is_complete,assigned_to,_type' },
          { max: 2000, limit: 100 });
      } catch (e) { fehler.push(lid); continue; }   // Netzfehler: alter Stand bleibt, Lauf geht weiter
      const gesehen = [];
      for (const t of rows) {
        gesehen.push(t.id);
        await upsert('close_tasks', ['id', 'lead_id', 'text', 'faellig_datum', 'erledigt', 'assigned_to'],
          [t.id, t.lead_id || lid, (t.text || '').slice(0, 300), t.date ? ymd(t.date) : null, B(!!t.is_complete), t.assigned_to || null], ['id']);
        n++;
      }
      if (gesehen.length) await db.run(`DELETE FROM close_tasks WHERE lead_id=${P(1)} AND id NOT IN (${PH(gesehen.length, 2)})`, [lid, ...gesehen]);
      else await db.run(`DELETE FROM close_tasks WHERE lead_id=${P(1)}`, [lid]);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  log(`  close_tasks: ${n} Aufgaben auf ${ids.length} Leads${fehler.length ? `, ${fehler.length} Leads nicht abrufbar (alter Stand)` : ''}`);
  if (fehler.length > Math.max(20, ids.length * 0.2)) throw new Error(`Close-Aufgaben: ${fehler.length} von ${ids.length} Leads nicht abrufbar`);
  return n;
}

/**
 * Aufgaben inkrementell spiegeln: alle Lead-Aufgaben, die seit dem letzten Abgleich geaendert wurden
 * (date_updated, 2 Tage Ueberlappung). Erster Lauf ab CLOSE_BACKFILL_AB. Deutlich schneller als je Lead.
 * In Close geloeschte Aufgaben bleiben stehen — dafuer gibt es spiegleTasks() je Lead.
 */
async function spiegleTasksInkrementell({ log = () => {} } = {}) {
  const { setting, setzeSetting } = require('./basis');
  const letzter = await setting('tasks_sync_ab', null);
  const von = letzter ? new Date(Date.parse(letzter) - 2 * 864e5).toISOString().slice(0, 10) : (process.env.CLOSE_BACKFILL_AB || '2026-06-01');
  const start = new Date().toISOString();
  const rows = await close.getAll('/task/', { _type: 'lead', date_updated__gte: von, _fields: 'id,lead_id,text,date,is_complete,assigned_to' },
    { max: 100000, limit: 100 });
  for (const t of rows) {
    await upsert('close_tasks', ['id', 'lead_id', 'text', 'faellig_datum', 'erledigt', 'assigned_to'],
      [t.id, t.lead_id || null, (t.text || '').slice(0, 300), t.date ? ymd(t.date) : null, B(!!t.is_complete), t.assigned_to || null], ['id']);
  }
  await setzeSetting('tasks_sync_ab', start, 'analyse');
  log(`  close_tasks: ${rows.length} Aufgaben geaendert seit ${von}`);
  return rows.length;
}

/** Kunden-Domains je Lead (fuer die Fireflies-Zuordnung). Cache 7 Tage; keine Mailadressen gespeichert. */
async function leadDomains(leadIds) {
  const ids = [...new Set(leadIds.filter(Boolean))];
  const res = {};
  if (!ids.length) return res;
  const vorhanden = await db.all(`SELECT id, display_name, domains, abgerufen_am FROM close_leads WHERE id IN (${PH(ids.length)})`, ids);
  const frisch = Date.now() - 7 * 864e5;
  for (const r of vorhanden) {
    if (new Date(r.abgerufen_am instanceof Date ? r.abgerufen_am : String(r.abgerufen_am).replace(' ', 'T') + (String(r.abgerufen_am).includes('T') ? '' : 'Z')).getTime() >= frisch) {
      res[r.id] = { name: r.display_name, domains: (r.domains || '').split(',').filter(Boolean) };
    }
  }
  const fehlen = ids.filter(id => !res[id]);
  let i = 0;
  const worker = async () => {
    while (i < fehlen.length) {
      const id = fehlen[i++];
      try {
        const l = await close.get(`/lead/${id}/`, { _fields: 'id,display_name,url,contacts' });
        const doms = new Set();
        for (const c of (l.contacts || [])) for (const e of (c.emails || [])) {
          const d = (e.email || '').split('@')[1];
          if (d && !FREEMAIL.test(d)) doms.add(d.toLowerCase());
        }
        if (l.url) { const m = /^(?:https?:\/\/)?(?:www\.)?([^/]+)/i.exec(l.url); if (m) doms.add(m[1].toLowerCase()); }
        res[id] = { name: l.display_name, domains: [...doms] };
        await upsert('close_leads', ['id', 'display_name', 'domains'], [id, l.display_name || null, [...doms].join(',')], ['id']);
        await db.run(`UPDATE close_leads SET abgerufen_am=${NOW()} WHERE id=${P(1)}`, [id]);
      } catch (e) { res[id] = { name: null, domains: [], fehler: e.message.slice(0, 80) }; }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return res;
}

/** Kalendertermine (Close-Meetings) je Lead, nur Datum — fuer "Kalendertermin vergangen". Nicht gespeichert. */
async function kalenderTermine(leadIds) {
  const out = {};
  const ids = [...new Set(leadIds.filter(Boolean))];
  let i = 0;
  const worker = async () => {
    while (i < ids.length) {
      const id = ids[i++];
      try {
        const rows = await close.getAll('/activity/meeting/', { lead_id: id, _fields: 'id,lead_id,starts_at,status' }, { max: 500, limit: 100 });
        out[id] = rows.filter(m => m.starts_at && m.status !== 'canceled').map(m => ({ datum: ymd(m.starts_at), ts: m.starts_at }));
      } catch { out[id] = []; }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  return out;
}

/** Transkript eines Close-Anrufs (nur im Speicher). null = kein Transkript. Wie lib.js der Oktober-Analyse. */
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
async function closeTranskript(callId) {
  const r = await close.get(`/activity/call/${callId}/`, { _fields: 'id,recording_transcript,user_name,duration' });
  const t = r.recording_transcript;
  if (!t || !t.utterances || !t.utterances.length) return null;
  const maSp = (t.speakers || []).find(s => s.speaker_side === 'close-user');
  const kundenNamen = [...new Set(t.utterances.filter(u => u.speaker_side !== 'close-user').map(u => u.speaker_label).filter(Boolean))];
  const zeilen = t.utterances.map(u => [u.speaker_side === 'close-user' ? 'MA' : 'Kunde', u.text]);
  return { zeilen, summary: t.summary_text || '', ma: r.user_name, redeanteil: maSp ? Math.round(maSp.talk_percentage * 1000) / 10 : null,
    dauerSek: Number(r.duration) || 0, kundenNamen };
}

module.exports = { spiegleCalls, spiegleTasks, spiegleTasksInkrementell, leadDomains, kalenderTermine, closeTranskript, mmss };
