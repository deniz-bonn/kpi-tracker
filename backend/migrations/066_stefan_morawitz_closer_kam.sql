-- Migration 066: Closer-KAM Rolle hinzufügen und Stefan Morawitz zuweisen (SQLite)
-- SQLite unterstützt kein ALTER CONSTRAINT — Tabelle muss neu erstellt werden

PRAGMA foreign_keys = OFF;

CREATE TABLE employees_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  rolle TEXT NOT NULL CHECK (rolle IN ('KAM', 'NKV-Closer', 'Opener', 'Setter', 'Multi', 'Closer-KAM')),
  aktiv INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  standort TEXT,
  show_in_kpi INTEGER NOT NULL DEFAULT 1
);

INSERT INTO employees_new SELECT id, name, company_id, rolle, aktiv, created_at, standort, show_in_kpi FROM employees;

UPDATE employees_new
SET rolle = 'Closer-KAM'
WHERE name = 'Stefan Morawitz'
  AND company_id = 3;

DROP TABLE employees;

ALTER TABLE employees_new RENAME TO employees;

PRAGMA foreign_keys = ON;
