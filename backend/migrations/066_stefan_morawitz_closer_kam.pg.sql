-- Migration 066: Stefan Morawitz erhält Rolle 'Closer-KAM' (Closer + KAM Doppelrolle)

UPDATE employees
SET rolle      = 'Closer-KAM',
    updated_at = NOW()
WHERE name = 'Stefan Morawitz'
  AND company_id = 3;
