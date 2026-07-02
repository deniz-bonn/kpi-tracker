-- Migration 066: Closer-KAM Rolle hinzufügen und Stefan Morawitz zuweisen

-- Constraint erweitern um 'Closer-KAM'
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_rolle_check;
ALTER TABLE employees ADD CONSTRAINT employees_rolle_check
  CHECK (rolle IN ('KAM', 'NKV-Closer', 'Opener', 'Setter', 'Multi', 'Closer-KAM'));

UPDATE employees
SET rolle = 'Closer-KAM'
WHERE name = 'Stefan Morawitz'
  AND company_id = 3;
