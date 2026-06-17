-- Forward to sales flag: only customers with 'Ja' appear in Kuendigungen page
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS weitergeben_an_vertrieb TEXT;

-- Terminiert: was a meeting scheduled? (tracked in Kuendigungen page)
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS terminiert INTEGER NOT NULL DEFAULT 0;

-- Internal new responsible person: either 'Vertrieb' or employee ID as string
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS neuer_ap_intern TEXT;
