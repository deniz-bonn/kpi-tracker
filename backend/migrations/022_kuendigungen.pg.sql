ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS gekuendigt_am     DATE;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS auslaufend_am     DATE;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS ansprechpartner   TEXT;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS telefon           TEXT;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS email_kontakt     TEXT;

ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS upsale_angesprochen      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS upsale_summe             NUMERIC(12,2);
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS upsale_angenommen        BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS upsale_angenommen_summe  NUMERIC(12,2);
