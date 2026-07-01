-- Migration 061: terminiert_mail/fax/ad Spalten für inbound_daily (SQLite)

ALTER TABLE inbound_daily ADD COLUMN terminiert_mail INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inbound_daily ADD COLUMN terminiert_fax  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inbound_daily ADD COLUMN terminiert_ad   INTEGER NOT NULL DEFAULT 0;
