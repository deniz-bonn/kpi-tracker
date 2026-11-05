-- Migration 122: siehe .pg.sql
ALTER TABLE close_opportunities ADD COLUMN geloescht_am TEXT;
