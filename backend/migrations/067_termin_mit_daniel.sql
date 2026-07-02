-- Migration 067: Feld "Termin mit Daniel?" zu deals_bk hinzufügen
ALTER TABLE deals_bk ADD COLUMN termin_mit_daniel TEXT;
