-- Migration 103: Lauf-Protokoll des Close-Syncs (SQLite — siehe .pg.sql fuer die Begruendung).
-- SQLite kennt kein TIMESTAMPTZ und kein partielles Index-WHERE in dieser Form -> TEXT + Volltext-Index.
CREATE TABLE IF NOT EXISTS close_sync_runs (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  gestartet_am   TEXT    NOT NULL DEFAULT (datetime('now')),
  beendet_am     TEXT,
  ausgeloest_von TEXT    NOT NULL,                -- 'cron' | 'manuell'
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_name      TEXT,
  status         TEXT    NOT NULL,                -- 'laeuft' | 'ok' | 'fehler' | 'abgebrochen'
  dauer_sek      REAL,
  since          TEXT,
  events         INTEGER,                  -- geholte Statuswechsel-Events (Upsert, siehe .pg.sql)
  opportunities  INTEGER,
  termine        INTEGER,
  fehler         TEXT
);

CREATE INDEX IF NOT EXISTS idx_close_sync_runs_gestartet ON close_sync_runs (gestartet_am DESC);
CREATE INDEX IF NOT EXISTS idx_close_sync_runs_status    ON close_sync_runs (status, beendet_am DESC);
