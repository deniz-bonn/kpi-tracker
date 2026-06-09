-- Migration 005: Globale Monatsziele für Dashboard
CREATE TABLE IF NOT EXISTS monthly_targets (
  monat TEXT PRIMARY KEY,
  ziel_gesamt REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
