-- Migration 064: unqualifiziert_direkt + follow_up_direkt (SQLite)

ALTER TABLE activity_logs ADD COLUMN unqualifiziert_direkt INTEGER NOT NULL DEFAULT 0;
ALTER TABLE activity_logs ADD COLUMN follow_up_direkt      INTEGER NOT NULL DEFAULT 0;
