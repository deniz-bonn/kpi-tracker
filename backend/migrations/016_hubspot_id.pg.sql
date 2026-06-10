-- Migration 016: Add hubspot_id column to deal tables
-- Required when status = Gewonnen (enforced in frontend/API)

ALTER TABLE deals_nk ADD COLUMN IF NOT EXISTS hubspot_id TEXT;
ALTER TABLE deals_bk ADD COLUMN IF NOT EXISTS hubspot_id TEXT;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS hubspot_id TEXT;
