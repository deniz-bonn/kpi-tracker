-- Migration 055: Startwerte Juni 2026 für NK Bonn und Braunschweig
-- Bonn:          239.830 €
-- Braunschweig:  693.100 €
-- nk_gesamt und gesamt werden aus den Teilen neu berechnet.
-- Weitere Standorte (nk_at_ae, nk_ch_ae) und BK/VL-Werte bleiben unverändert.

UPDATE ae_gesamt_monthly
SET
  nk_bonn_ae = 239830,
  nk_bs_ae   = 693100,
  nk_gesamt  = 239830 + 693100 + nk_at_ae + nk_ch_ae,
  gesamt     = 239830 + 693100 + nk_at_ae + nk_ch_ae + bk_gesamt + vl_gesamt,
  updated_at = NOW()
WHERE monat = '2026-06';
