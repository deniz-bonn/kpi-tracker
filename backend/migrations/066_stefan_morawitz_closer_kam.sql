-- Migration 066: Stefan Morawitz erhält Rolle 'Closer-KAM' (SQLite)

UPDATE employees
SET rolle      = 'Closer-KAM',
    updated_at = datetime('now')
WHERE LOWER(email) = 'office@morawitzconsulting.at';
