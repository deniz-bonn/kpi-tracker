-- Migration 116: Externe API (SQLite) — fachlich identisch zur .pg.sql.
-- Dialekt: SERIAL -> INTEGER PRIMARY KEY AUTOINCREMENT, BOOLEAN -> INTEGER 0/1,
-- TIMESTAMPTZ/NOW() -> TEXT/datetime('now'), kein IF NOT EXISTS bei ADD COLUMN.
CREATE TABLE IF NOT EXISTS api_tokens (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  praefix         TEXT NOT NULL,
  token_hash      TEXT NOT NULL UNIQUE,
  scopes          TEXT NOT NULL DEFAULT '',
  standorte       TEXT,
  aktiv           INTEGER NOT NULL DEFAULT 1,
  erstellt_von    INTEGER REFERENCES users(id),
  erstellt_am     TEXT NOT NULL DEFAULT (datetime('now')),
  widerrufen_am   TEXT,
  zuletzt_benutzt TEXT
);

CREATE TABLE IF NOT EXISTS api_idempotency (
  token_id      INTEGER NOT NULL REFERENCES api_tokens(id),
  schluessel    TEXT NOT NULL,
  anfrage_hash  TEXT NOT NULL,
  status        INTEGER NOT NULL,
  antwort       TEXT NOT NULL,
  erstellt_am   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (token_id, schluessel)
);

ALTER TABLE deals_vl ADD COLUMN herkunft TEXT;
-- Bewusst OHNE Fremdschluessel (api_tokens ist nicht Teil der Datensicherung, siehe .pg.sql).
ALTER TABLE deals_vl ADD COLUMN api_token_id INTEGER;
