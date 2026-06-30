-- Migration 054: Marcel Murciano → Marcel Scheller, namensbasiert
-- Kein DO-Block, da der splitSql-Parser kein Dollar-Quoting versteht.
-- Subqueries suchen per Name, unabhängig von der tatsächlichen ID auf Railway.

UPDATE deals_nk
SET opener_id = (SELECT id FROM employees WHERE name ILIKE '%Marcel Scheller%' LIMIT 1),
    updated_at = NOW()
WHERE opener_id IN (
  SELECT id FROM employees
  WHERE name ILIKE '%Marcel%'
    AND name NOT ILIKE '%Scheller%'
)
AND (SELECT id FROM employees WHERE name ILIKE '%Marcel Scheller%' LIMIT 1) IS NOT NULL;

UPDATE deals_nk
SET closer_id = (SELECT id FROM employees WHERE name ILIKE '%Marcel Scheller%' LIMIT 1),
    updated_at = NOW()
WHERE closer_id IN (
  SELECT id FROM employees
  WHERE name ILIKE '%Marcel%'
    AND name NOT ILIKE '%Scheller%'
)
AND (SELECT id FROM employees WHERE name ILIKE '%Marcel Scheller%' LIMIT 1) IS NOT NULL;

UPDATE deals_nk
SET setter_id = (SELECT id FROM employees WHERE name ILIKE '%Marcel Scheller%' LIMIT 1),
    updated_at = NOW()
WHERE setter_id IN (
  SELECT id FROM employees
  WHERE name ILIKE '%Marcel%'
    AND name NOT ILIKE '%Scheller%'
)
AND (SELECT id FROM employees WHERE name ILIKE '%Marcel Scheller%' LIMIT 1) IS NOT NULL;
