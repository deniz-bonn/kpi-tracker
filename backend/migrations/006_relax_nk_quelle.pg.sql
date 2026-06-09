-- Migration 006: Relax quelle constraint on deals_nk (PostgreSQL)
-- Removes the NOT NULL constraint and CHECK constraint on quelle so null/free-text values are allowed.
-- DROP CONSTRAINT IF EXISTS and DROP NOT NULL are idempotent — safe no-op on fresh installs
-- where 001 already defines quelle as TEXT (nullable, no constraint).

ALTER TABLE deals_nk DROP CONSTRAINT IF EXISTS deals_nk_quelle_check;
ALTER TABLE deals_nk ALTER COLUMN quelle DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deals_nk_monat   ON deals_nk(monat);
CREATE INDEX IF NOT EXISTS idx_deals_nk_company ON deals_nk(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_closer  ON deals_nk(closer_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_status  ON deals_nk(status)
