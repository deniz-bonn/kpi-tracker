-- Migration 099: Personenscharfe Feature-Freischaltung (additiv zur Rollen-Logik).
-- Semantik: Zugriff hat, wer (a) eine in feature_flags freigeschaltete Rolle hat ODER
-- (b) hier einzeln eingetragen ist. Superadmin sieht ohnehin alles. Kein Deny in dieser Stufe.
-- PK (feature, user_id) macht doppeltes Hinzufügen idempotent; ON DELETE CASCADE räumt
-- Einträge beim Löschen eines Users automatisch ab.
CREATE TABLE IF NOT EXISTS feature_flag_users (
  feature    TEXT    NOT NULL,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by INTEGER,
  PRIMARY KEY (feature, user_id)
);
