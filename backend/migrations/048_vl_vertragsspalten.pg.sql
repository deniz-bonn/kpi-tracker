-- Migration 048: Neue Vertragsspalten für deals_vl (PostgreSQL)
-- Vertragsnummer, Vertragsbeginn, Ende der Laufzeit, Ende der Kündigungsfrist

ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS vertragsnummer TEXT;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS vertragsbeginn TEXT;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS ende_laufzeit TEXT;
ALTER TABLE deals_vl ADD COLUMN IF NOT EXISTS ende_kuendigungsfrist TEXT;
