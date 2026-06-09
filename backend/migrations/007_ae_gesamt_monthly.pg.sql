-- Migration 007: ae_gesamt_monthly table (PostgreSQL)
-- Stores authoritative monthly totals imported from the AE Gesamt Excel sheet.

CREATE TABLE IF NOT EXISTS ae_gesamt_monthly (
  id          SERIAL PRIMARY KEY,
  monat       CHAR(7) UNIQUE NOT NULL,
  nk_bonn_anz INTEGER NOT NULL DEFAULT 0,
  nk_bonn_ae  NUMERIC(12,2) NOT NULL DEFAULT 0,
  nk_bs_anz   INTEGER NOT NULL DEFAULT 0,
  nk_bs_ae    NUMERIC(12,2) NOT NULL DEFAULT 0,
  nk_at_anz   INTEGER NOT NULL DEFAULT 0,
  nk_at_ae    NUMERIC(12,2) NOT NULL DEFAULT 0,
  nk_ch_anz   INTEGER NOT NULL DEFAULT 0,
  nk_ch_ae    NUMERIC(12,2) NOT NULL DEFAULT 0,
  nk_gesamt   NUMERIC(12,2) NOT NULL DEFAULT 0,
  bk_gesamt   NUMERIC(12,2) NOT NULL DEFAULT 0,
  vl_gesamt   NUMERIC(12,2) NOT NULL DEFAULT 0,
  gesamt      NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ae_gesamt_monat ON ae_gesamt_monthly(monat)
