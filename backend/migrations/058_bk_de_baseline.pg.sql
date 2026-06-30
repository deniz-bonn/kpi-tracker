-- Migration 058: bk_de_ae-Spalte für BK Bonn+Braunschweig Baselines (PostgreSQL)

ALTER TABLE ae_gesamt_monthly ADD COLUMN IF NOT EXISTS bk_de_ae NUMERIC(12,2) NOT NULL DEFAULT 0;

UPDATE ae_gesamt_monthly SET bk_de_ae = 96500,  updated_at = NOW() WHERE monat = '2026-01';
UPDATE ae_gesamt_monthly SET bk_de_ae = 184795, updated_at = NOW() WHERE monat = '2026-02';
UPDATE ae_gesamt_monthly SET bk_de_ae = 97270,  updated_at = NOW() WHERE monat = '2026-03';
UPDATE ae_gesamt_monthly SET bk_de_ae = 607700, updated_at = NOW() WHERE monat = '2026-04';
UPDATE ae_gesamt_monthly SET bk_de_ae = 365500, updated_at = NOW() WHERE monat = '2026-05';
UPDATE ae_gesamt_monthly SET bk_de_ae = 523000, updated_at = NOW() WHERE monat = '2026-06';
