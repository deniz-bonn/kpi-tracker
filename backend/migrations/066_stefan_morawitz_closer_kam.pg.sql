-- Migration 066: Stefan Morawitz erhält Rolle 'Closer-KAM' (Closer + KAM Doppelrolle)

UPDATE employees
SET rolle      = 'Closer-KAM',
    updated_at = NOW()
WHERE LOWER(email) = 'office@morawitzconsulting.at';
