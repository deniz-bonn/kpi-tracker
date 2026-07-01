-- Migration 064: unqualifiziert_direkt + follow_up_direkt (PostgreSQL)

ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS unqualifiziert_direkt INTEGER NOT NULL DEFAULT 0;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS follow_up_direkt      INTEGER NOT NULL DEFAULT 0;
