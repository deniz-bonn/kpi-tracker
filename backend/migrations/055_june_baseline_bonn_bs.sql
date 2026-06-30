-- Migration 055: Startwerte Juni 2026 für NK Bonn und Braunschweig (SQLite)

UPDATE ae_gesamt_monthly
SET
  nk_bonn_ae = 239830,
  nk_bs_ae   = 693100,
  nk_gesamt  = 239830 + 693100 + nk_at_ae + nk_ch_ae,
  gesamt     = 239830 + 693100 + nk_at_ae + nk_ch_ae + bk_gesamt + vl_gesamt,
  updated_at = datetime('now')
WHERE monat = '2026-06';
