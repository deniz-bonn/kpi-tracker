-- Migration 116: Externe API (Postgres) — Tokens, Idempotenz, Herkunft an Verlaengerungen.
--
-- api_tokens: Skripte melden sich mit einem Token an, nicht mit einem Passwort. Gespeichert wird
-- nur der SHA-256-Hash des Geheimnisses (32 Zufallsbytes — kein bcrypt noetig); das Praefix dient
-- der Wiedererkennung in der Liste. scopes: kommagetrennt ('vl:read,vl:write'). standorte: leer/NULL
-- = alle Standorte, sonst kommagetrennt — der Standort eines VL-Deals ist der seines KAM.
CREATE TABLE IF NOT EXISTS api_tokens (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  praefix         TEXT NOT NULL,
  token_hash      TEXT NOT NULL UNIQUE,
  scopes          TEXT NOT NULL DEFAULT '',
  standorte       TEXT,
  aktiv           BOOLEAN NOT NULL DEFAULT TRUE,
  erstellt_von    INTEGER REFERENCES users(id),
  erstellt_am     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  widerrufen_am   TIMESTAMPTZ,
  zuletzt_benutzt TIMESTAMPTZ
);

-- Idempotency-Key: dieselbe Anfrage (Token + Key) liefert die erste Antwort erneut, statt ein
-- zweites Mal anzulegen. anfrage_hash erkennt denselben Key mit anderem Inhalt (-> 422).
CREATE TABLE IF NOT EXISTS api_idempotency (
  token_id      INTEGER NOT NULL REFERENCES api_tokens(id),
  schluessel    TEXT NOT NULL,
  anfrage_hash  TEXT NOT NULL,
  status        INTEGER NOT NULL,
  antwort       TEXT NOT NULL,
  erstellt_am   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (token_id, schluessel)
);

-- Herkunft einer Verlaengerung: 'api' = per externer API angelegt (Badge in der VL-Liste),
-- api_token_id = welcher Token. Bestand bleibt NULL.
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS herkunft TEXT;
-- Bewusst OHNE Fremdschluessel: api_tokens steht nicht in der Datensicherung (Hashes), ein Restore
-- in eine leere Datenbank scheiterte sonst an jeder API-Anlage.
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS api_token_id INTEGER;
