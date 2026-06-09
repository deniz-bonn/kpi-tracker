-- Migration 003: Gewonnen-Datum für korrekte Monats-Zuordnung des AE
-- Ein Angebot vom Mai, das im Juni gewonnen wird, zählt als Juni-AE

ALTER TABLE deals_nk ADD COLUMN gewonnen_datum TEXT;
ALTER TABLE deals_nk ADD COLUMN gewonnen_monat TEXT;

ALTER TABLE deals_bk ADD COLUMN gewonnen_datum TEXT;
ALTER TABLE deals_bk ADD COLUMN gewonnen_monat TEXT;

ALTER TABLE deals_vl ADD COLUMN gewonnen_datum TEXT;
ALTER TABLE deals_vl ADD COLUMN gewonnen_monat TEXT;

-- Historische Daten: gewonnen_datum = datum für bereits gewonnene Deals
UPDATE deals_nk SET gewonnen_datum = datum, gewonnen_monat = monat WHERE status = 'Gewonnen';
UPDATE deals_bk SET gewonnen_datum = datum, gewonnen_monat = monat WHERE status = 'Gewonnen';
UPDATE deals_vl SET gewonnen_datum = datum, gewonnen_monat = monat WHERE status = 'Gewonnen';

CREATE INDEX IF NOT EXISTS idx_deals_nk_gewonnen_monat ON deals_nk(gewonnen_monat);
CREATE INDEX IF NOT EXISTS idx_deals_bk_gewonnen_monat ON deals_bk(gewonnen_monat);
CREATE INDEX IF NOT EXISTS idx_deals_vl_gewonnen_monat ON deals_vl(gewonnen_monat);
