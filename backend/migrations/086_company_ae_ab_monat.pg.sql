-- Migration 086: AE-Startmonat je Company (Postgres)
-- ae_ab_monat (YYYY-MM) legt fest, ab welchem gewonnen_monat der Auftragseingang
-- einer Company in Umsatz-Aggregaten zaehlt. Bezug ist ausdruecklich gewonnen_monat,
-- NICHT das Angebotsdatum. NULL = kein Filter (Company verhaelt sich exakt wie bisher).
-- Risem trackt AE erst ab August 2026: die importierten Juni/Juli-Deals haben ab
-- Migration 083/084/085 einen ae_wert (CHF), sollen aber im Dashboard nicht als
-- Schweiz-Umsatz erscheinen. Das Gate sitzt zentral im AE_EUR-Ausdruck (kpis.js /
-- auswertung.js) und als Guard in syncAeGesamtNK. Deal-Detailansichten zeigen den
-- ae_wert weiterhin unveraendert -- nur die Aggregation ist begrenzt.
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ae_ab_monat CHAR(7);
UPDATE companies SET ae_ab_monat = '2026-08' WHERE name = 'Risem';
