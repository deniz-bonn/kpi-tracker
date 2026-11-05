// Fireflies: Metadaten abrufen, nach Titel klassifizieren, Close-Lead zuordnen, Transkript im Speicher holen.
// Portiert aus backend/analyse/oktober-2026/transkript/ff/{meta,classify,match}.js und lib.js.
// Nur lesend. Gespeichert werden nur Klasse, Zuordnung und Metadaten (kein Titel, kein Transkript).
const { TEAM, ymd, upsert, tsParam, sleep, kalendertage } = require('./basis');

const URL = 'https://api.fireflies.ai/graphql';

async function gql(query, variables) {
  const key = process.env.FIREFLIES_API_KEY;
  if (!key) throw new Error('FIREFLIES_API_KEY nicht gesetzt');
  for (let a = 0; a < 6; a++) {
    const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ query, variables }) });
    const j = await r.json().catch(() => ({}));
    if (r.status === 429 || (j.errors && /too many|rate/i.test(JSON.stringify(j.errors)))) { await sleep(3000 * (a + 1)); continue; }
    if (!r.ok || j.errors) throw new Error('Fireflies HTTP ' + r.status + ' ' + JSON.stringify(j.errors || j).slice(0, 200));
    return j.data;
  }
  throw new Error('Fireflies: Rate-Limit nach 6 Versuchen');
}

const Q_META = `query($from: DateTime, $to: DateTime, $limit: Int, $skip: Int) {
  transcripts(fromDate: $from, toDate: $to, limit: $limit, skip: $skip) {
    id title date dateString duration host_email organizer_email participants
    meeting_attendees { email }
  } }`;

/** Meetings im Zeitraum (Berlin-Tage, bis inklusive). */
async function meetings(von, bis) {
  const from = new Date(Date.parse(von + 'T00:00:00Z') - 864e5).toISOString();
  const to = new Date(Date.parse(bis + 'T00:00:00Z') + 2 * 864e5).toISOString();
  const alle = [];
  for (let skip = 0; ; skip += 50) {
    const d = await gql(Q_META, { from, to, limit: 50, skip });
    const rows = d.transcripts || [];
    alle.push(...rows);
    if (rows.length < 50) break;
    await sleep(600);
  }
  return alle.map(x => ({ ...x, beginn: x.date ? new Date(Number(x.date) || x.date).toISOString() : x.dateString }))
    .map(x => ({ ...x, datum: ymd(x.beginn) }))
    .filter(x => x.datum >= von && x.datum <= bis);
}

const internDomRe = new RegExp('@(' + TEAM.intern_domains.map(d => d.replace(/\./g, '\\.')).join('|') + ')$', 'i');
const mails = (x) => [...new Set([x.host_email, x.organizer_email, ...(x.participants || []), ...((x.meeting_attendees || []).map(a => a.email))]
  .filter(Boolean).map(e => String(e).toLowerCase()))];

/** Klasse wie Oktober: SC | intern | Zweifel; Zweifel_SC = Zweifel, der trotzdem codiert wird (Tobias-Host, extern, kein Willkommen). */
function klassifiziere(x) {
  const t = String(x.title || '').toLowerCase();
  const em = mails(x);
  const ext = em.filter(e => !internDomRe.test(e));
  const host = String(x.host_email || x.organizer_email || '').split('@')[0];
  const F = TEAM.fireflies_titel;
  let klasse;
  if (F.sc.some(re => new RegExp(re, 'i').test(t))) klasse = 'SC';
  else if (F.intern.some(re => new RegExp(re, 'i').test(t))) klasse = 'intern';
  else klasse = 'Zweifel';
  if (klasse === 'Zweifel' && host === F.zweifel_host && ext.length > 0 && !new RegExp(F.zweifel_ausschluss, 'i').test(t)) klasse = 'Zweifel_SC';
  return { klasse, host, extDomains: [...new Set(ext.map(e => e.split('@')[1]))], titelFirma: /einstellungsgarantie/i.test(t) ? '' : String(x.title || '').replace(/^hioffice\s*(cloud)?\s*[-–|]\s*/i, '') };
}

const STOP = new Set(['gmbh', 'co', 'kg', 'ag', 'mbh', 'ug', 'ek', 'e', 'k', 'und', 'the', 'group', 'holding', 'gruppe', 'hioffice', 'cloud',
  'einstellungsgarantie', 'deutschland', 'service', 'services', 'verwaltung', 'beteiligungs', 'ohg', 'gbr', 'der', 'die', 'das', 'von', 'mit', 'bei']);
const toks = (s) => (s || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(t => t.length >= 3 && !STOP.has(t));
const nameMatch = (a, b) => { const A = new Set(toks(a)), Bs = new Set(toks(b)); if (!A.size || !Bs.size) return 0; let c = 0; for (const t of A) if (Bs.has(t)) c++; return c / Math.min(A.size, Bs.size); };
const dm = (a, b) => a === b || a.endsWith('.' + b) || b.endsWith('.' + a);

/**
 * Zuordnung Meeting -> Close-Lead (match.js): Domain oder Firmenname im Titel, Datum gegen SC-Aufgabe
 * bzw. SC-Ausgang (±ff_zuordnung_tage). kandidaten: [{ id, name, domains, scDates:[ymd], scAusgaenge:[ymd] }]
 */
function ordneZu(meeting, k, kandidaten) {
  const tol = TEAM.regeln.ff_zuordnung_tage;
  const cands = [];
  for (const L of kandidaten) {
    const dom = k.extDomains.some(d => L.domains.some(x => dm(d, x)));
    const nm = k.titelFirma ? nameMatch(k.titelFirma, L.name) : 0;
    if (!dom && nm < 0.6) continue;
    const dd = L.scDates.length ? Math.min(...L.scDates.map(x => Math.abs(kalendertage(x, meeting.datum)))) : 99;
    const dd2 = L.scAusgaenge.length ? Math.min(...L.scAusgaenge.map(x => Math.abs(kalendertage(x, meeting.datum)))) : 99;
    const datum = dd <= tol ? 'SC-Aufgabe' : dd2 <= tol ? 'SC-Ausgang' : null;
    cands.push({ L, dom, nm, datum, score: (dom ? 3 : 0) + (nm >= 0.6 ? 2 : 0) + (datum ? 2 : 0) });
  }
  cands.sort((a, b) => b.score - a.score);
  const best = cands[0], second = cands[1];
  if (!best) return { zuordnung: 'keine', leadId: null };
  if (second && second.score === best.score && second.L.id !== best.L.id) return { zuordnung: 'mehrdeutig', leadId: null };
  return { zuordnung: best.datum ? 'sicher' : 'wahrscheinlich', leadId: best.L.id };
}

async function speichere(m, k, z) {
  await upsert('ff_meetings', ['id', 'beginn', 'datum', 'dauer_min', 'host', 'klasse', 'zuordnung', 'close_lead_id'],
    [m.id, tsParam(m.beginn), m.datum, m.duration != null ? Number(m.duration) : null, k.host, k.klasse, z ? z.zuordnung : null, z ? z.leadId : null],
    ['id'], { update: ['beginn', 'datum', 'dauer_min', 'host', 'klasse', 'zuordnung', 'close_lead_id'] });
}

/** Transkript eines Meetings (nur im Speicher). internRe/personZuSprecher kommen aus team.js. */
async function ffTranskript(id, team) {
  const d = await gql(`query($id:String!){ transcript(id:$id){ duration sentences{speaker_name text start_time end_time} summary{short_summary overview} } }`, { id });
  const f = d.transcript;
  if (!f || !f.sentences || !f.sentences.length) return null;
  const clean = (n) => (n || '').replace(/[‎‏]/g, '').trim();
  const zeitJe = {};
  for (const s of f.sentences) zeitJe[clean(s.speaker_name)] = (zeitJe[clean(s.speaker_name)] || 0) + Math.max(0, (s.end_time || 0) - (s.start_time || 0));
  const tot = Object.values(zeitJe).reduce((a, b) => a + b, 0) || 1;
  const istMA = (n) => team.internRe.test(n);
  const kundenNamen = Object.keys(zeitJe).filter(n => !istMA(n));
  const maSprecher = Object.entries(zeitJe).filter(([n]) => istMA(n)).sort((a, b) => b[1] - a[1]);
  const haupt = maSprecher.length ? team.personZuSprecher(maSprecher[0][0]) : null;
  const mitsprecher = maSprecher.slice(1).map(([n, v]) => ({ name: (team.personZuSprecher(n) || {}).vorname || 'intern', anteil: Math.round(v / tot * 100) }));
  return {
    zeilen: f.sentences.map(s => [istMA(clean(s.speaker_name)) ? 'MA' : 'Kunde', s.text]),
    summary: (f.summary && (f.summary.overview || f.summary.short_summary)) || '',
    person: haupt, mitsprecher,
    redeanteil: Math.round(maSprecher.reduce((a, [, v]) => a + v, 0) / tot * 1000) / 10,
    dauerSek: Math.round((Number(f.duration) || 0) * 60),            // Fireflies liefert Minuten
    kundenNamen,
  };
}

module.exports = { gql, meetings, klassifiziere, ordneZu, speichere, ffTranskript };
