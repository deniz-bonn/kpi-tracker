-- Migration 061: terminiert_mail/fax/ad Spalten für inbound_daily (PostgreSQL)

ALTER TABLE inbound_daily ADD COLUMN IF NOT EXISTS terminiert_mail INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inbound_daily ADD COLUMN IF NOT EXISTS terminiert_fax  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inbound_daily ADD COLUMN IF NOT EXISTS terminiert_ad   INTEGER NOT NULL DEFAULT 0;
