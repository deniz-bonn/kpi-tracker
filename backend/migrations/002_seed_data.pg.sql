-- Migration 002: Seed Data (PostgreSQL)
-- Uses ON CONFLICT DO NOTHING instead of SQLite's INSERT OR IGNORE

INSERT INTO companies (id, name, standort, aktiv) VALUES
  (1, 'fach.digital', 'Deutschland', TRUE),
  (2, 'High Office IT', 'Deutschland', TRUE),
  (3, 'Morawitz', 'Deutschland', TRUE)
ON CONFLICT DO NOTHING;

-- Keep sequence in sync after explicit id inserts
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

INSERT INTO employees (id, name, company_id, rolle, aktiv) VALUES
  (1, 'René', 1, 'NKV-Closer', TRUE),
  (2, 'Deniz', 1, 'Multi', TRUE)
ON CONFLICT DO NOTHING;

SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees))
