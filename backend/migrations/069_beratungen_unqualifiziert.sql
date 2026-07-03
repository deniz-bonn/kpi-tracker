-- Migration 069: Neues Feld "Unqualifiziert" in activity_logs (Beratungsgespräche-Tracking)
ALTER TABLE activity_logs ADD COLUMN beratungen_unqualifiziert INTEGER NOT NULL DEFAULT 0;
