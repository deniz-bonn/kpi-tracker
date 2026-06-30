-- Migration 057: bk_at_ae-Spalte für ae_gesamt_monthly (PostgreSQL)
-- Erlaubt einen expliziten Österreich-BK-Startwert unabhängig von deals_bk.
-- Startwert Juni 2026: 236.060 €

ALTER TABLE ae_gesamt_monthly ADD COLUMN IF NOT EXISTS bk_at_ae NUMERIC(12,2) NOT NULL DEFAULT 0;

UPDATE ae_gesamt_monthly
SET bk_at_ae  = 236060,
    updated_at = NOW()
WHERE monat = '2026-06';
