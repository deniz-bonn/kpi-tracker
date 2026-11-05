// Slack-Versand der Wochenanalyse (Web API per fetch, Bot-Token aus SLACK_BOT_TOKEN).
// Benoetigte Bot-Rechte: chat:write, files:write, im:write, users:read, users:read.email
// (Manifest: docs/wochenanalyse-slack-app.yml). Live: privater Kanal SLACK_KANAL_ID (Bot muss Mitglied sein).
// Test und Fehler: Direktnachricht an die Personen aus team.json versand.slack.
const API = 'https://slack.com/api/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function token() {
  const t = process.env.SLACK_BOT_TOKEN;
  if (!t) throw new Error('SLACK_BOT_TOKEN ist nicht gesetzt');
  return t;
}

/** Aufruf der Web API mit Retry bei Rate-Limit. form=true sendet application/x-www-form-urlencoded. */
async function api(methode, daten, { form = false } = {}) {
  for (let versuch = 0; versuch < 5; versuch++) {
    const r = await fetch(API + methode, {
      method: 'POST',
      headers: form
        ? { Authorization: 'Bearer ' + token(), 'Content-Type': 'application/x-www-form-urlencoded' }
        : { Authorization: 'Bearer ' + token(), 'Content-Type': 'application/json; charset=utf-8' },
      body: form ? new URLSearchParams(daten).toString() : JSON.stringify(daten),
    });
    if (r.status === 429) { await sleep((Number(r.headers.get('retry-after')) || 2) * 1000); continue; }
    const j = await r.json().catch(() => ({ ok: false, error: 'HTTP ' + r.status }));
    if (!j.ok) {
      const e = new Error(`Slack ${methode}: ${j.error}${j.needed ? ' (fehlendes Recht: ' + j.needed + ')' : ''}`);
      e.slack = j.error;
      throw e;
    }
    return j;
  }
  throw new Error(`Slack ${methode}: Rate-Limit nach 5 Versuchen`);
}

/** Direktnachrichten-Kanal zu einer Person (ueber ihre Slack-Mailadresse). Erste gefundene Adresse gewinnt. */
async function dmKanal(emails) {
  const fehler = [];
  for (const email of emails) {
    try {
      const u = await api('users.lookupByEmail', { email }, { form: true });
      const c = await api('conversations.open', { users: u.user.id });
      return c.channel.id;
    } catch (e) { fehler.push(`${email}: ${e.slack || e.message}`); }
  }
  throw new Error('Slack-Nutzer nicht gefunden (' + fehler.join('; ') + ')');
}

/** Lange Texte an Absatzgrenzen in Stuecke < max teilen (Slack zeigt lange Beitraege gekuerzt). */
function teile(text, max = 3800) {
  const out = [];
  let rest = text;
  while (rest.length > max) {
    let i = rest.lastIndexOf('\n\n', max);
    if (i < max / 2) i = rest.lastIndexOf('\n', max);
    if (i < max / 2) i = max;
    out.push(rest.slice(0, i));
    rest = rest.slice(i).replace(/^\n+/, '');
  }
  if (rest.trim()) out.push(rest);
  // Codebloecke nicht offen lassen: Teil mit ungerader Zahl ``` schliessen und im naechsten wieder oeffnen.
  for (let i = 0; i < out.length; i++) {
    if (((out[i].match(/```/g) || []).length) % 2 === 1) {
      out[i] += '\n```';
      if (out[i + 1] !== undefined) out[i + 1] = '```\n' + out[i + 1];
    }
  }
  return out;
}

async function post(channel, text, threadTs = null) {
  let ts = null;
  for (const teil of teile(text)) {
    const r = await api('chat.postMessage', { channel, text: teil, thread_ts: threadTs || undefined, unfurl_links: false, unfurl_media: false });
    if (!ts) ts = r.ts;
  }
  return ts;
}

/** Datei hochladen und im Kanal/Thread teilen (files.getUploadURLExternal + completeUploadExternal). */
async function datei(channel, { filename, content, title }, threadTs = null, kommentar = null) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content);
  const u = await api('files.getUploadURLExternal', { filename, length: String(buf.length) }, { form: true });
  const r = await fetch(u.upload_url, { method: 'POST', body: buf });
  if (!r.ok) throw new Error(`Slack-Upload ${filename}: HTTP ${r.status}`);
  await api('files.completeUploadExternal', {
    files: [{ id: u.file_id, title: title || filename }], channel_id: channel,
    ...(threadTs ? { thread_ts: threadTs } : {}), ...(kommentar ? { initial_comment: kommentar } : {}),
  });
}

/** Report senden: Hauptbeitrag, je Person ein Thread-Beitrag, Dateien in den Thread. Rueckgabe: Ziel-Beschreibung. */
async function sendeReport({ ziel, haupt, personen, dateien }) {
  const channel = ziel.kanal || await dmKanal(ziel.emails);
  const ts = await post(channel, haupt);
  for (const p of personen) await post(channel, p, ts);
  for (const f of dateien) await datei(channel, f, ts);
  return { channel, ts };
}

/** Kompakter Versand: eine Nachricht mit Text und mehreren Dateien (PDF + Excel). */
async function sendeDateien({ ziel, text, dateien }) {
  const channel = ziel.kanal || await dmKanal(ziel.emails);
  const ids = [];
  for (const f of dateien) {
    const buf = Buffer.isBuffer(f.content) ? f.content : Buffer.from(f.content);
    const u = await api('files.getUploadURLExternal', { filename: f.filename, length: String(buf.length) }, { form: true });
    const r = await fetch(u.upload_url, { method: 'POST', body: buf });
    if (!r.ok) throw new Error(`Slack-Upload ${f.filename}: HTTP ${r.status}`);
    ids.push({ id: u.file_id, title: f.title || f.filename });
  }
  await api('files.completeUploadExternal', { files: ids, channel_id: channel, initial_comment: text });
  return { channel };
}

async function sendeFehler(emails, text) {
  const channel = await dmKanal(emails);
  await post(channel, text);
}

const konfiguriert = () => !!process.env.SLACK_BOT_TOKEN;

module.exports = { api, dmKanal, post, datei, sendeReport, sendeDateien, sendeFehler, teile, konfiguriert };
