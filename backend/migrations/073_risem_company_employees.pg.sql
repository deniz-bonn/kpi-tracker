-- Migration 073: Onboarding Firma Risem (Standort Schweiz) — Company + Mitarbeiter.
-- Idempotent (WHERE NOT EXISTS): Doppellauf legt keine Duplikate an. Keine users/Logins.
-- Eine Person = ein Datensatz — Leo Stalder als Multi (Closer + Setter), kein zweiter Datensatz.

-- Company Risem
INSERT INTO companies (name, standort, aktiv)
SELECT 'Risem', 'Schweiz', TRUE
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Risem');

INSERT INTO employees (name, company_id, rolle, aktiv, standort, show_in_kpi)
SELECT 'Zymer Shala', c.id, 'Multi', TRUE, 'Schweiz', 1
FROM (SELECT id FROM companies WHERE name = 'Risem') c
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.name = 'Zymer Shala' AND e.company_id = c.id);

INSERT INTO employees (name, company_id, rolle, aktiv, standort, show_in_kpi)
SELECT 'Baran Bünül', c.id, 'Multi', TRUE, 'Schweiz', 1
FROM (SELECT id FROM companies WHERE name = 'Risem') c
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.name = 'Baran Bünül' AND e.company_id = c.id);

INSERT INTO employees (name, company_id, rolle, aktiv, standort, show_in_kpi)
SELECT 'Daris Becic', c.id, 'Multi', TRUE, 'Schweiz', 1
FROM (SELECT id FROM companies WHERE name = 'Risem') c
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.name = 'Daris Becic' AND e.company_id = c.id);

INSERT INTO employees (name, company_id, rolle, aktiv, standort, show_in_kpi)
SELECT 'Silas Rudolph', c.id, 'Multi', TRUE, 'Schweiz', 1
FROM (SELECT id FROM companies WHERE name = 'Risem') c
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.name = 'Silas Rudolph' AND e.company_id = c.id);

INSERT INTO employees (name, company_id, rolle, aktiv, standort, show_in_kpi)
SELECT 'Elias Ackle', c.id, 'Multi', TRUE, 'Schweiz', 1
FROM (SELECT id FROM companies WHERE name = 'Risem') c
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.name = 'Elias Ackle' AND e.company_id = c.id);

INSERT INTO employees (name, company_id, rolle, aktiv, standort, show_in_kpi)
SELECT 'Leo Stalder', c.id, 'Multi', TRUE, 'Schweiz', 1
FROM (SELECT id FROM companies WHERE name = 'Risem') c
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.name = 'Leo Stalder' AND e.company_id = c.id);

INSERT INTO employees (name, company_id, rolle, aktiv, standort, show_in_kpi)
SELECT 'Deniz Boukhris', c.id, 'Multi', TRUE, 'Schweiz', 1
FROM (SELECT id FROM companies WHERE name = 'Risem') c
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.name = 'Deniz Boukhris' AND e.company_id = c.id);

INSERT INTO employees (name, company_id, rolle, aktiv, standort, show_in_kpi)
SELECT 'Dardan Shala', c.id, 'Closer-KAM', TRUE, 'Schweiz', 1
FROM (SELECT id FROM companies WHERE name = 'Risem') c
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.name = 'Dardan Shala' AND e.company_id = c.id);

INSERT INTO employees (name, company_id, rolle, aktiv, standort, show_in_kpi)
SELECT 'Vahieran Kanthathason', c.id, 'KAM', TRUE, 'Schweiz', 1
FROM (SELECT id FROM companies WHERE name = 'Risem') c
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.name = 'Vahieran Kanthathason' AND e.company_id = c.id);

INSERT INTO employees (name, company_id, rolle, aktiv, standort, show_in_kpi)
SELECT 'Kai Bucher', c.id, 'KAM', TRUE, 'Schweiz', 1
FROM (SELECT id FROM companies WHERE name = 'Risem') c
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.name = 'Kai Bucher' AND e.company_id = c.id);
