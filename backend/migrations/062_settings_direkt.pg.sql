-- Migration 062: Direkte Settings + Beratung vereinbart direkt (PostgreSQL)

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS settings_direkt            INTEGER NOT NULL DEFAULT 0;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS beratung_vereinbart_direkt  INTEGER NOT NULL DEFAULT 0;
