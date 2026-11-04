-- Migration 117: Live-Board (/board) — Mitarbeiterfotos und Tagesziele je Person.
-- Display-Sessions brauchen keine eigene Tabelle: sie sind api_tokens mit dem Scope 'board:read'
-- (Migration 116), damit Widerruf, Hash-Speicherung und "zuletzt benutzt" nur EINMAL existieren.

-- Fotos: quadratisch, im Browser auf 256 px verkleinert; der Server nimmt hoechstens 500 KB an.
-- Base64 in TEXT statt BYTEA, damit die JSON-Datensicherung die Zeile ohne Sonderbehandlung traegt.
CREATE TABLE IF NOT EXISTS employee_fotos (
  employee_id  INTEGER PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
  mime         TEXT NOT NULL,
  daten        TEXT NOT NULL,
  bytes        INTEGER NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by   INTEGER
);

-- Tagesziele je Person und Kennzahl. Monatsziel wird EINGETRAGEN, nie aus Arbeitstagen abgeleitet
-- (Vorgabe Vertriebsleitung, wie bei den fixen Teamzielen). NULL = kein Ziel in dieser Kennzahl.
--   settings    -> termine art='setting', gelegt (Anzahl)
--   sales_calls -> termine art='closing', gelegt (Anzahl)
--   ae          -> deals_nk gewonnen als Closer (EUR)
CREATE TABLE IF NOT EXISTS board_ziele (
  employee_id  INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  kennzahl     TEXT NOT NULL CHECK (kennzahl IN ('settings','sales_calls','ae')),
  ziel_tag     NUMERIC(12,2),
  ziel_monat   NUMERIC(12,2),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by   INTEGER,
  PRIMARY KEY (employee_id, kennzahl)
);
