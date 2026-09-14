// Job-Schicht um runSync(): Lock, Cooldown, Lauf-Protokoll und Fortschritt.
//
// Warum ueberhaupt eine Schicht: runSync() dauert beim Voll-Backfill ~70 s. Synchron beantwortet
// lief der erste manuelle Lauf in den Frontend-Timeout (20 s) — die UI meldete "fehlgeschlagen",
// waehrend der Sync im Hintergrund weiterlief. Das erzeugt Doppel-Klicks und Support-Rauschen.
// Deshalb: POST startet und antwortet sofort 202, die UI pollt den Status.
//
// Der Lock ist bewusst prozesslokal (die App laeuft als eine Railway-Instanz). Er schuetzt gegen
// Doppel-Klicks und gegen "zwei Leute gleichzeitig"; er ist KEIN verteiltes Lock. Skaliert die App
// je auf mehrere Instanzen, muss der Lock in die DB wandern — der Kommentar bleibt als Marker.
const db = require('../db');
const { runSync } = require('./closeSync');

const COOLDOWN_MIN   = Number(process.env.CLOSE_SYNC_COOLDOWN_MIN || 10);
// Ein Lauf, der laenger als das braucht, gilt als abgestuerzt (Prozess-Neustart mitten im Sync).
const STALE_MIN      = Number(process.env.CLOSE_SYNC_STALE_MIN || 30);
const MAX_SCHRITTE   = 60;   // Fortschrittszeilen, die wir im Speicher halten

const P = (i) => (db.dialect === 'postgres' ? `$${i}` : '?');
const NOW = () => (db.dialect === 'postgres' ? 'NOW()' : "datetime('now')");

// Laufender Job (in-memory). null = kein Lauf aktiv.
let aktiv = null;

/** Verwaiste 'laeuft'-Zeilen aufraeumen: Prozess-Neustart mitten im Sync. Beim Start aufrufen. */
async function aufraeumen() {
  const sql = db.dialect === 'postgres'
    ? `UPDATE close_sync_runs SET status='abgebrochen', beendet_am=NOW(),
         fehler='Prozess wurde waehrend des Laufs beendet'
       WHERE status='laeuft' AND gestartet_am < NOW() - INTERVAL '${STALE_MIN} minutes'`
    : `UPDATE close_sync_runs SET status='abgebrochen', beendet_am=datetime('now'),
         fehler='Prozess wurde waehrend des Laufs beendet'
       WHERE status='laeuft' AND gestartet_am < datetime('now', '-${STALE_MIN} minutes')`;
  try { await db.run(sql); } catch { /* Tabelle existiert noch nicht (Migration laeuft spaeter) */ }
}

async function letzterErfolg() {
  return db.get(`SELECT * FROM close_sync_runs WHERE status='ok' ORDER BY beendet_am DESC LIMIT 1`);
}

/** Verbleibende Cooldown-Sekunden (0 = frei). Rechnet serverseitig, nie im Client. */
async function cooldownRest() {
  if (COOLDOWN_MIN <= 0) return 0;
  const r = db.dialect === 'postgres'
    ? await db.get(`SELECT EXTRACT(EPOCH FROM (NOW() - beendet_am)) AS alter_sek
                      FROM close_sync_runs WHERE status='ok' ORDER BY beendet_am DESC LIMIT 1`)
    : await db.get(`SELECT (julianday('now') - julianday(beendet_am)) * 86400 AS alter_sek
                      FROM close_sync_runs WHERE status='ok' ORDER BY beendet_am DESC LIMIT 1`);
  if (!r || r.alter_sek == null) return 0;
  return Math.max(0, Math.ceil(COOLDOWN_MIN * 60 - Number(r.alter_sek)));
}

/**
 * Startet einen Sync, wenn erlaubt.
 * @returns {{ ok: true, runId, gestartetAm }} oder {{ ok: false, grund: 'laeuft'|'cooldown', ... }}
 */
async function starten({ since = null, ausgeloestVon = 'manuell', user = null, cooldownUmgehen = false } = {}) {
  if (aktiv) {
    return { ok: false, grund: 'laeuft', runId: aktiv.runId, gestartetAm: aktiv.gestartetAm };
  }
  if (!cooldownUmgehen) {
    const rest = await cooldownRest();
    if (rest > 0) {
      const letzter = await letzterErfolg();
      return { ok: false, grund: 'cooldown', restSek: rest, letzterLauf: letzter?.beendet_am || null };
    }
  }

  const userName = user?.name || user?.email || null;
  const werte = [ausgeloestVon, user?.id ?? null, userName, since];
  const spalten = 'gestartet_am, ausgeloest_von, user_id, user_name, status, since';
  let runId;
  if (db.dialect === 'postgres') {
    const row = await db.get(
      `INSERT INTO close_sync_runs (${spalten}) VALUES (NOW(), $1, $2, $3, 'laeuft', $4) RETURNING id`, werte);
    runId = row.id;
  } else {
    // SQLite-Pfad wie ueberall im Repo: kein RETURNING, id aus lastInsertRowid.
    const r = db.run(
      `INSERT INTO close_sync_runs (${spalten}) VALUES (datetime('now'), ?, ?, ?, 'laeuft', ?)`, werte);
    runId = r.lastInsertRowid;
  }

  const gestartetAm = new Date().toISOString();
  aktiv = { runId, gestartetAm, ausgeloestVon, userName, schritte: [] };

  // Bewusst NICHT awaited: der Aufrufer antwortet sofort mit 202.
  (async () => {
    const t0 = Date.now();
    try {
      const r = await runSync({
        since,
        log: (m) => {
          console.log(m);
          if (aktiv) {
            aktiv.schritte.push(String(m));
            if (aktiv.schritte.length > MAX_SCHRITTE) aktiv.schritte.shift();
          }
        },
      });
      const dauer = (Date.now() - t0) / 1000;
      // syncStatusEvents liefert { opportunity: n, lead: n } -> Summe. syncOpportunities { gesamt },
      // deriveTermine { abgeleitet }. Bewusst defensiv: aendert sich eine Form, bleibt der Lauf 'ok'.
      const events = r.events && typeof r.events === 'object'
        ? Object.values(r.events).reduce((s, v) => s + (Number(v) || 0), 0) : null;
      await db.run(
        `UPDATE close_sync_runs SET status='ok', beendet_am=${NOW()}, dauer_sek=${P(1)},
           events=${P(2)}, opportunities=${P(3)}, termine=${P(4)} WHERE id=${P(5)}`,
        [dauer, events, r.opportunities?.gesamt ?? null, r.termine?.abgeleitet ?? null, runId]
      );
    } catch (e) {
      console.error('[close-sync] Fehlgeschlagen:', e.message);
      // try/catch statt .catch(): der SQLite-Wrapper ist synchron und liefert kein Promise.
      try {
        await db.run(
          `UPDATE close_sync_runs SET status='fehler', beendet_am=${NOW()}, dauer_sek=${P(1)}, fehler=${P(2)}
             WHERE id=${P(3)}`,
          [(Date.now() - t0) / 1000, String(e.message).slice(0, 500), runId]
        );
      } catch (e2) {
        console.error('[close-sync] Lauf-Protokoll konnte nicht geschrieben werden:', e2.message);
      }
    } finally {
      aktiv = null;
    }
  })();

  return { ok: true, runId, gestartetAm };
}

/** Aktueller Zustand fuer das Polling der UI. */
async function status({ historie = 10 } = {}) {
  const laufend = aktiv
    ? { runId: aktiv.runId, gestartetAm: aktiv.gestartetAm, ausgeloestVon: aktiv.ausgeloestVon,
        userName: aktiv.userName, schritte: aktiv.schritte.slice(-8) }
    : null;
  const letzter = await letzterErfolg();
  const laeufe  = await db.all(
    `SELECT id, gestartet_am, beendet_am, ausgeloest_von, user_name, status, dauer_sek,
            since, events, opportunities, termine, fehler
       FROM close_sync_runs ORDER BY gestartet_am DESC LIMIT ${Number(historie) || 10}`
  );
  return {
    laeuft: !!aktiv,
    laufend,
    letzterErfolg: letzter || null,
    cooldownSek: await cooldownRest(),
    cooldownMin: COOLDOWN_MIN,
    laeufe,
  };
}

module.exports = { starten, status, aufraeumen, cooldownRest, letzterErfolg, COOLDOWN_MIN };
