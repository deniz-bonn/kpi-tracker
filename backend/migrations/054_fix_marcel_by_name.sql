-- Migration 054: Marcel Murciano → Marcel Scheller, namensbasiert (SQLite no-op)
-- Lokal gibt es keine Deals mit Marcel Murciano, daher passiert hier nichts.

UPDATE deals_nk SET
  opener_id = (SELECT id FROM employees WHERE name = 'Marcel Scheller' LIMIT 1),
  updated_at = datetime('now')
WHERE opener_id = (SELECT id FROM employees WHERE name = 'Marcel Murciano' LIMIT 1)
  AND (SELECT id FROM employees WHERE name = 'Marcel Murciano' LIMIT 1) IS NOT NULL;

UPDATE deals_nk SET
  closer_id = (SELECT id FROM employees WHERE name = 'Marcel Scheller' LIMIT 1),
  updated_at = datetime('now')
WHERE closer_id = (SELECT id FROM employees WHERE name = 'Marcel Murciano' LIMIT 1)
  AND (SELECT id FROM employees WHERE name = 'Marcel Murciano' LIMIT 1) IS NOT NULL;

UPDATE deals_nk SET
  setter_id = (SELECT id FROM employees WHERE name = 'Marcel Scheller' LIMIT 1),
  updated_at = datetime('now')
WHERE setter_id = (SELECT id FROM employees WHERE name = 'Marcel Murciano' LIMIT 1)
  AND (SELECT id FROM employees WHERE name = 'Marcel Murciano' LIMIT 1) IS NOT NULL;
