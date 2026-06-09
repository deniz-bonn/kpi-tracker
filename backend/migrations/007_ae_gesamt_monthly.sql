-- Migration 007: ae_gesamt_monthly table
-- Stores authoritative monthly totals from the AE Gesamt sheet in Excel.
-- The Dashboard uses these values as the primary source for completed months;
-- future months fall back to computing from deal data.

CREATE TABLE IF NOT EXISTS ae_gesamt_monthly (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  monat      TEXT UNIQUE NOT NULL,          -- YYYY-MM
  nk_bonn_anz INTEGER NOT NULL DEFAULT 0,
  nk_bonn_ae  REAL    NOT NULL DEFAULT 0,
  nk_bs_anz   INTEGER NOT NULL DEFAULT 0,
  nk_bs_ae    REAL    NOT NULL DEFAULT 0,
  nk_at_anz   INTEGER NOT NULL DEFAULT 0,
  nk_at_ae    REAL    NOT NULL DEFAULT 0,
  nk_ch_anz   INTEGER NOT NULL DEFAULT 0,
  nk_ch_ae    REAL    NOT NULL DEFAULT 0,
  nk_gesamt   REAL    NOT NULL DEFAULT 0,
  bk_gesamt   REAL    NOT NULL DEFAULT 0,
  vl_gesamt   REAL    NOT NULL DEFAULT 0,
  gesamt      REAL    NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ae_gesamt_monat ON ae_gesamt_monthly(monat);
