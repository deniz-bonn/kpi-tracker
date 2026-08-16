-- Migration 093: Altbestand (siehe .pg.sql). SQLite: BOOLEAN als INTEGER 0/1.
-- Lokale/Test-DBs enthalten diese Prod-IDs i.d.R. nicht -> UPDATE trifft 0 Zeilen (unschaedlich).
UPDATE deals_nk SET angebot_erstellt = 0, kein_angebot_grund = 'altbestand'
 WHERE id IN (16016, 16018, 16020, 16035, 16545)
   AND status = 'Verloren' AND (angebotswert IS NULL OR angebotswert = 0) AND angebot_erstellt = 1;
