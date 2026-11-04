-- Migration 117: Live-Board (SQLite) — fachlich identisch zur .pg.sql.
CREATE TABLE IF NOT EXISTS employee_fotos (
  employee_id  INTEGER PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
  mime         TEXT NOT NULL,
  daten        TEXT NOT NULL,
  bytes        INTEGER NOT NULL,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by   INTEGER
);

CREATE TABLE IF NOT EXISTS board_ziele (
  employee_id  INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  kennzahl     TEXT NOT NULL CHECK (kennzahl IN ('settings','sales_calls','ae')),
  ziel_tag     NUMERIC,
  ziel_monat   NUMERIC,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by   INTEGER,
  PRIMARY KEY (employee_id, kennzahl)
);
