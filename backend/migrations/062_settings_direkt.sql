-- Migration 062: Direkte Settings + Beratung vereinbart direkt (SQLite)

ALTER TABLE activity_logs ADD COLUMN settings_direkt           INTEGER NOT NULL DEFAULT 0;
ALTER TABLE activity_logs ADD COLUMN beratung_vereinbart_direkt INTEGER NOT NULL DEFAULT 0;
