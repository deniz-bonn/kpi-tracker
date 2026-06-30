-- Migration 056: NK-Korrekturen Juni 2026 (SQLite)
-- Bonn:         26 Neukunden
-- Braunschweig: 58 Neukunden
-- Österreich:   351.245 € / 70 Neukunden

UPDATE ae_gesamt_monthly
SET
  nk_bonn_anz = 26,
  nk_bs_anz   = 58,
  nk_at_ae    = 351245,
  nk_at_anz   = 70,
  nk_gesamt   = nk_bonn_ae + nk_bs_ae + 351245 + nk_ch_ae,
  gesamt      = nk_bonn_ae + nk_bs_ae + 351245 + nk_ch_ae + bk_gesamt + vl_gesamt,
  updated_at  = datetime('now')
WHERE monat = '2026-06';
