-- Migration 008: Automatische Verlängerung + Abgerechnet (SQLite)

ALTER TABLE deals_nk ADD COLUMN automatische_verlaengerung TEXT;
ALTER TABLE deals_nk ADD COLUMN abgerechnet TEXT;

ALTER TABLE deals_bk ADD COLUMN automatische_verlaengerung TEXT;
ALTER TABLE deals_bk ADD COLUMN abgerechnet TEXT;

ALTER TABLE deals_vl ADD COLUMN abgerechnet TEXT;

-- Bestehende gewonnene Deals auf 'Nein' setzen
UPDATE deals_nk SET abgerechnet = 'Nein' WHERE status = 'Gewonnen' AND abgerechnet IS NULL;
UPDATE deals_bk SET abgerechnet = 'Nein' WHERE status = 'Gewonnen' AND abgerechnet IS NULL;
UPDATE deals_vl SET abgerechnet = 'Nein' WHERE status = 'Gewonnen' AND abgerechnet IS NULL;
