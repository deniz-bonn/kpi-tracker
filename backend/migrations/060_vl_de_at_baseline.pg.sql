-- Migration 060: vl_de_ae + vl_at_ae Baselines Jan–Jun 2026 (PostgreSQL)

ALTER TABLE ae_gesamt_monthly ADD COLUMN IF NOT EXISTS vl_de_ae NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE ae_gesamt_monthly ADD COLUMN IF NOT EXISTS vl_at_ae NUMERIC(12,2) NOT NULL DEFAULT 0;

UPDATE ae_gesamt_monthly SET vl_de_ae = 102600,  vl_at_ae = 100750, updated_at = NOW() WHERE monat = '2026-01';
UPDATE ae_gesamt_monthly SET vl_de_ae = 222400,  vl_at_ae = 36800,  updated_at = NOW() WHERE monat = '2026-02';
UPDATE ae_gesamt_monthly SET vl_de_ae = 87600,   vl_at_ae = 117380, updated_at = NOW() WHERE monat = '2026-03';
UPDATE ae_gesamt_monthly SET vl_de_ae = 231850,  vl_at_ae = 126350, updated_at = NOW() WHERE monat = '2026-04';
UPDATE ae_gesamt_monthly SET vl_de_ae = 549400,  vl_at_ae = 85600,  updated_at = NOW() WHERE monat = '2026-05';
UPDATE ae_gesamt_monthly SET vl_de_ae = 160100,  vl_at_ae = 170200, updated_at = NOW() WHERE monat = '2026-06';
