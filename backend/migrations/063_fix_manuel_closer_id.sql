-- Migration 063: closer_id für Deals von Manuel Zimmermann nachsetzen (SQLite)

UPDATE deals_nk
SET closer_id  = (SELECT id FROM employees WHERE name LIKE '%Manuel Zimmermann%' LIMIT 1),
    updated_at = datetime('now')
WHERE closer_id IS NULL
  AND (
    kunde LIKE '%Stippich%'
    OR company_id IN (SELECT id FROM companies WHERE name LIKE '%Stippich%')
  );
