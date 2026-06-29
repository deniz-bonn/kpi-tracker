-- Migration 048: Neue Vertragsspalten für deals_vl
-- Vertragsnummer, Vertragsbeginn, Ende der Laufzeit, Ende der Kündigungsfrist

ALTER TABLE deals_vl ADD COLUMN vertragsnummer TEXT;
ALTER TABLE deals_vl ADD COLUMN vertragsbeginn TEXT;
ALTER TABLE deals_vl ADD COLUMN ende_laufzeit TEXT;
ALTER TABLE deals_vl ADD COLUMN ende_kuendigungsfrist TEXT;
