-- Migration 115: Firmen auf die HiOffice-Marken umbenennen + Schweiz ab November 2026 in der Gruppe (Postgres).
-- gruppe_ab_monat (YYYY-MM): ab diesem Monat zaehlt die Firma in Gruppen-Summen (Gesamt-AE, Ziel),
-- fruehere Monate bleiben unveraendert. NULL = nur zaehlt_in_gruppe entscheidet (utils/gruppe.js).
ALTER TABLE companies ADD COLUMN IF NOT EXISTS gruppe_ab_monat CHAR(7);
UPDATE companies SET gruppe_ab_monat = '2026-11' WHERE name = 'Risem' AND gruppe_ab_monat IS NULL;

-- Umbenennung ueber den alten Namen: idempotent und ueberschreibt keinen bereits geaenderten Namen.
UPDATE companies SET name = 'HiOffice Works' WHERE name = 'fach.digital';
UPDATE companies SET name = 'HiOffice Care'  WHERE name = 'High Office IT';
UPDATE companies SET name = 'HiOffice AT'    WHERE name = 'Morawitz';
UPDATE companies SET name = 'HiOffice CH'    WHERE name = 'Risem';
