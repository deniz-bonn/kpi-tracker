-- Migration 059: bk_at_ae Baselines Jan–Mai 2026 (PostgreSQL)

UPDATE ae_gesamt_monthly SET bk_at_ae = 117000,  updated_at = NOW() WHERE monat = '2026-01';
UPDATE ae_gesamt_monthly SET bk_at_ae = 336690,  updated_at = NOW() WHERE monat = '2026-02';
UPDATE ae_gesamt_monthly SET bk_at_ae = 188650,  updated_at = NOW() WHERE monat = '2026-03';
UPDATE ae_gesamt_monthly SET bk_at_ae = 107480,  updated_at = NOW() WHERE monat = '2026-04';
UPDATE ae_gesamt_monthly SET bk_at_ae = 121512,  updated_at = NOW() WHERE monat = '2026-05';
