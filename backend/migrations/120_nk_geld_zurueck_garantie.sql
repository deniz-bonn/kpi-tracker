-- Migration 120 (SQLite): fachlich identisch zur .pg.sql.
ALTER TABLE deals_nk ADD COLUMN geld_zurueck_garantie TEXT CHECK (geld_zurueck_garantie IN ('Ja','Nein'));
