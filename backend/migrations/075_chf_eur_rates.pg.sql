-- Migration 075: Monatliche CHF→EUR-Wechselkurse. rate = EUR pro 1 CHF.
-- Gültigkeit pro Monat, damit spätere Kursänderungen alte Monate nicht rückwirkend verändern.
-- Initialkurs 1,08 (Vorgabe) für 2026-06 bis 2026-12 — pro Monat in Einstellungen pflegbar.
CREATE TABLE IF NOT EXISTS chf_eur_rates (
  monat      CHAR(7) PRIMARY KEY,
  rate       NUMERIC(10,4) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO chf_eur_rates (monat, rate) VALUES
  ('2026-06', 1.08), ('2026-07', 1.08), ('2026-08', 1.08), ('2026-09', 1.08),
  ('2026-10', 1.08), ('2026-11', 1.08), ('2026-12', 1.08)
ON CONFLICT (monat) DO NOTHING;
