-- Migration 099 (SQLite): Personenscharfe Feature-Freischaltung (additiv zur Rollen-Logik).
-- Siehe 099_feature_flag_users.pg.sql für die Semantik. PK (feature, user_id) = idempotent,
-- ON DELETE CASCADE räumt Einträge beim Löschen eines Users ab (greift bei PRAGMA foreign_keys=ON).
CREATE TABLE IF NOT EXISTS feature_flag_users (
  feature    TEXT    NOT NULL,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  created_by INTEGER,
  PRIMARY KEY (feature, user_id)
);
