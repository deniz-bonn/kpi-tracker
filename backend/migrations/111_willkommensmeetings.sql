-- Migration 111: Bereich "Willkommensmeetings" (WM) — SQLite
--
-- Fachlich identisch zur .pg.sql; Dialekt-Unterschiede: SERIAL -> INTEGER PRIMARY KEY AUTOINCREMENT,
-- TIMESTAMPTZ/NOW() -> TEXT/datetime('now'), kein "IF NOT EXISTS" bei ADD COLUMN, und der
-- Teilindex (WHERE herkunft IS NOT NULL) entfaellt — SQLite kann ihn, aber er braeuchte hier
-- keine Sonderbehandlung und bleibt zur besseren Vergleichbarkeit ein normaler Index.
--
-- REFERENZ STATT KOPIE: Das Angebot existiert genau EINMAL, naemlich als regulaerer deals_bk-Deal.
-- Das Meeting haelt nur die Verknuepfung — keine eigene Angebots-/Wert-/Status-Spalte, sonst
-- entstuenden zwei Staende desselben Angebots.
--
-- WARUM EIGENE TABELLE UND NICHT `termine`: Die Tabelle termine (Migration 100) ist aus Close
-- abgeleitet — close_event_id ist NOT NULL UNIQUE und traegt die Idempotenz des Sync, und
-- art hat einen CHECK auf ('setting','closing'). Ein manuell erfasstes Willkommensmeeting hat
-- kein Close-Event.

CREATE TABLE IF NOT EXISTS willkommensmeetings (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  datum             DATE NOT NULL,
  -- Kohorten-Achse: das Meeting gehoert in SEINEN Monat. Die AE-Zaehlung des Deals folgt
  -- unveraendert gewonnen_monat — eine ANDERE Achse, die am Deal bleibt.
  monat             CHAR(7) NOT NULL,
  kunde             TEXT NOT NULL,
  gefuehrt_von      INTEGER NOT NULL REFERENCES employees(id),
  -- Angebots-Typ am MEETING, nicht am Deal: deals_bk.dienstleistung kennt weder "Jahresbetreuung"
  -- noch "Jahresvertrag" und ist verschmutzt ("Kontingente " neben "Kontingente").
  angebots_typ      TEXT,
  aufzeichnung_url  TEXT,
  notiz             TEXT,
  -- UNIQUE: ein Deal haengt an hoechstens EINEM Meeting. ON DELETE SET NULL: wird der Deal in BK
  -- geloescht, bleibt das Meeting bestehen und verliert nur seinen Angebotsbezug.
  deal_bk_id        INTEGER UNIQUE REFERENCES deals_bk(id) ON DELETE SET NULL,
  -- Unterscheidet "nie ein Angebot platziert" (zaehlt gegen die Quote) von "Angebot nachtraeglich
  -- entfernt" (soll sichtbar bleiben). Die Route setzt es vor dem Loeschen.
  deal_entfernt     INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_wm_monat   ON willkommensmeetings (monat);
CREATE INDEX IF NOT EXISTS idx_wm_person  ON willkommensmeetings (gefuehrt_von);
CREATE INDEX IF NOT EXISTS idx_wm_deal    ON willkommensmeetings (deal_bk_id);

-- Herkunfts-Kennzeichen am Deal. NULL = wie bisher; gesetzt wird ausschliesslich 'willkommensmeeting'.
ALTER TABLE deals_bk ADD COLUMN herkunft TEXT;
CREATE INDEX IF NOT EXISTS idx_bk_herkunft ON deals_bk (herkunft);
