-- Korrektur AE-Werte Mai/Juni 2026
UPDATE ae_gesamt_monthly SET vl_de_ae = 280250, updated_at = NOW() WHERE monat = '2026-05';
UPDATE ae_gesamt_monthly SET vl_de_ae = 543400, nk_bs_ae  = 756100, updated_at = NOW() WHERE monat = '2026-06';
