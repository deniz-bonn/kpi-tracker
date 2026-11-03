-- Migration 115: Firmen auf die HiOffice-Marken umbenennen + Schweiz ab November 2026 in der Gruppe (SQLite).
-- Siehe .pg.sql. gruppe_ab_monat (YYYY-MM): ab diesem Monat zaehlt die Firma in Gruppen-Summen.
ALTER TABLE companies ADD COLUMN gruppe_ab_monat TEXT;
UPDATE companies SET gruppe_ab_monat = '2026-11' WHERE name = 'Risem' AND gruppe_ab_monat IS NULL;

UPDATE companies SET name = 'HiOffice Works' WHERE name = 'fach.digital';
UPDATE companies SET name = 'HiOffice Care'  WHERE name = 'High Office IT';
UPDATE companies SET name = 'HiOffice AT'    WHERE name = 'Morawitz';
UPDATE companies SET name = 'HiOffice CH'    WHERE name = 'Risem';
