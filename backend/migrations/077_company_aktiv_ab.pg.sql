-- Migration 077: Company-Aktivierungsdatum + Leo Stalder als Closer-KAM.
-- aktiv_ab steuert, ab wann eine Company in Auswertungen/Dashboard/Listen erscheint.
-- Risem startet am 2026-08-01 (vorher komplett unsichtbar, obwohl Deals importiert sind).
ALTER TABLE companies ADD COLUMN IF NOT EXISTS aktiv_ab DATE;
UPDATE companies SET aktiv_ab = '2026-08-01' WHERE name = 'Risem';

-- Leo Stalder bei Risem als Closer-KAM fuehren (statt Multi)
UPDATE employees SET rolle = 'Closer-KAM'
WHERE name = 'Leo Stalder' AND company_id = (SELECT id FROM companies WHERE name = 'Risem');
