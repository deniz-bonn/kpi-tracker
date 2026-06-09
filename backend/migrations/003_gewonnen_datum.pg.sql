-- Migration 003: Gewonnen-Datum (PostgreSQL)
-- Uses ADD COLUMN IF NOT EXISTS — safe no-op on fresh installs (001 already has these columns)

ALTER TABLE deals_nk ADD COLUMN IF NOT EXISTS gewonnen_datum DATE;
ALTER TABLE deals_nk ADD COLUMN IF NOT EXISTS gewonnen_monat CHAR(7);

ALTER TABLE deals_bk ADD COLUMN IF NOT EXISTS gewonnen_datum DATE;
ALTER TABLE deals_bk ADD COLUMN IF NOT EXISTS gewonnen_monat CHAR(7);

ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS gewonnen_datum DATE;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS gewonnen_monat CHAR(7);

UPDATE deals_nk SET gewonnen_datum = datum::DATE, gewonnen_monat = monat WHERE status = 'Gewonnen' AND gewonnen_monat IS NULL;
UPDATE deals_bk SET gewonnen_datum = datum::DATE, gewonnen_monat = monat WHERE status = 'Gewonnen' AND gewonnen_monat IS NULL;
UPDATE deals_vl SET gewonnen_datum = datum::DATE, gewonnen_monat = monat WHERE status = 'Gewonnen' AND gewonnen_monat IS NULL;

CREATE INDEX IF NOT EXISTS idx_deals_nk_gewonnen_monat ON deals_nk(gewonnen_monat);
CREATE INDEX IF NOT EXISTS idx_deals_bk_gewonnen_monat ON deals_bk(gewonnen_monat);
CREATE INDEX IF NOT EXISTS idx_deals_vl_gewonnen_monat ON deals_vl(gewonnen_monat)
