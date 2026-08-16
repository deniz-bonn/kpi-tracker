-- Migration 092: NK "Kein Angebot erstellt"-Tracking — Postgres
-- angebot_erstellt=false = dokumentierter Closing Call OHNE Angebot (Status Verloren, kein ae_wert).
-- Default TRUE haelt den gesamten Bestand unveraendert gueltig (alle Alt-Deals = mit Angebot).
-- kein_angebot_grund haelt den Grund-Key (Konstante im Frontend), _text nur bei "Sonstiges".
ALTER TABLE deals_nk ADD COLUMN IF NOT EXISTS angebot_erstellt BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE deals_nk ADD COLUMN IF NOT EXISTS kein_angebot_grund TEXT;
ALTER TABLE deals_nk ADD COLUMN IF NOT EXISTS kein_angebot_grund_text TEXT;
