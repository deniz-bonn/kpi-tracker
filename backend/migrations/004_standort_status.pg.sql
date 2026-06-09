-- Migration 004: Standort für Mitarbeiter (PostgreSQL)
-- In PostgreSQL we can ALTER TABLE directly — no table recreation needed.
-- ADD COLUMN IF NOT EXISTS is a safe no-op on fresh installs (001 already has standort).

ALTER TABLE employees ADD COLUMN IF NOT EXISTS standort TEXT;

-- deals_nk: ensure laufzeit_monate is NUMERIC (already correct in 001 pg schema)
-- No table recreation needed in PostgreSQL.

CREATE INDEX IF NOT EXISTS idx_deals_nk_monat   ON deals_nk(monat);
CREATE INDEX IF NOT EXISTS idx_deals_nk_company ON deals_nk(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_closer  ON deals_nk(closer_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_status  ON deals_nk(status)
