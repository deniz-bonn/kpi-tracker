-- Migration 066: Closer-KAM Rolle hinzufügen und Stefan Morawitz zuweisen (SQLite)

-- SQLite unterstützt kein ALTER CONSTRAINT — CHECK wird in SQLite ohnehin nicht erzwungen
UPDATE employees
SET rolle = 'Closer-KAM'
WHERE name = 'Stefan Morawitz'
  AND company_id = 3;
