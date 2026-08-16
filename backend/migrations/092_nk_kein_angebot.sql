-- Migration 092: NK "Kein Angebot erstellt"-Tracking — SQLite
-- Siehe .pg.sql. SQLite kennt kein BOOLEAN -> INTEGER 0/1, Default 1 (= mit Angebot, Bestand gueltig).
ALTER TABLE deals_nk ADD COLUMN angebot_erstellt INTEGER NOT NULL DEFAULT 1;
ALTER TABLE deals_nk ADD COLUMN kein_angebot_grund TEXT;
ALTER TABLE deals_nk ADD COLUMN kein_angebot_grund_text TEXT;
