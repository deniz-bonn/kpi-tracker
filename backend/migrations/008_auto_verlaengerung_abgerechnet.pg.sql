-- Migration 008: Automatische Verlängerung + Abgerechnet (PostgreSQL)

ALTER TABLE deals_nk ADD COLUMN IF NOT EXISTS automatische_verlaengerung TEXT;
ALTER TABLE deals_nk ADD COLUMN IF NOT EXISTS abgerechnet TEXT;

ALTER TABLE deals_bk ADD COLUMN IF NOT EXISTS automatische_verlaengerung TEXT;
ALTER TABLE deals_bk ADD COLUMN IF NOT EXISTS abgerechnet TEXT;

ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS abgerechnet TEXT;

UPDATE deals_nk SET abgerechnet = 'Nein' WHERE status = 'Gewonnen' AND abgerechnet IS NULL;
UPDATE deals_bk SET abgerechnet = 'Nein' WHERE status = 'Gewonnen' AND abgerechnet IS NULL;
UPDATE deals_vl SET abgerechnet = 'Nein' WHERE status = 'Gewonnen' AND abgerechnet IS NULL
