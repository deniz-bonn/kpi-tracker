-- Migration 052: Neues Feld "Direkter Close" in activity_logs
ALTER TABLE activity_logs ADD COLUMN beratungen_direkter_close INTEGER NOT NULL DEFAULT 0;
