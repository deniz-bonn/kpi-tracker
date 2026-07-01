-- Migration 063: closer_id für Deals von Manuel Zimmermann nachsetzen
-- Betrifft Deals die mit closer_id = NULL angelegt wurden (bk_vertrieb Bug)

UPDATE deals_nk
SET closer_id  = (SELECT id FROM employees WHERE name ILIKE '%Manuel Zimmermann%' LIMIT 1),
    updated_at = NOW()
WHERE closer_id IS NULL
  AND (
    kunde ILIKE '%Stippich%'
    OR company_id IN (SELECT id FROM companies WHERE name ILIKE '%Stippich%')
  );
