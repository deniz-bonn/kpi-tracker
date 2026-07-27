-- Migration 074: Währungskennzeichen auf Company-Ebene (company-level statt pro Deal).
-- Default EUR; Risem = CHF. Beträge werden in Originalwährung gespeichert, EUR wird berechnet.
ALTER TABLE companies ADD COLUMN currency TEXT NOT NULL DEFAULT 'EUR';
UPDATE companies SET currency = 'CHF' WHERE name = 'Risem';
