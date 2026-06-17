-- Contact info captured when a VL deal is marked as Verloren (Kündigung)
ALTER TABLE deals_vl ADD COLUMN gekuendigt_am     TEXT;
ALTER TABLE deals_vl ADD COLUMN auslaufend_am     TEXT;
ALTER TABLE deals_vl ADD COLUMN ansprechpartner   TEXT;
ALTER TABLE deals_vl ADD COLUMN telefon           TEXT;
ALTER TABLE deals_vl ADD COLUMN email_kontakt     TEXT;

-- Up-Sale tracking per cancelled customer
ALTER TABLE deals_vl ADD COLUMN upsale_angesprochen      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE deals_vl ADD COLUMN upsale_summe             REAL;
ALTER TABLE deals_vl ADD COLUMN upsale_angenommen        INTEGER NOT NULL DEFAULT 0;
ALTER TABLE deals_vl ADD COLUMN upsale_angenommen_summe  REAL;
