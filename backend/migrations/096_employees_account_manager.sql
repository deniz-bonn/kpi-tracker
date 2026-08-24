-- Migration 096: Neue Vertriebsrolle 'Account Manager' (eine Stufe unter dem KAM/Key Account Manager,
-- im Bestandskundenbereich). SQLite kann CHECK nicht in-place aendern -> Tabelle neu erstellen (Muster
-- wie Migration 066). Nur die CHECK-Liste wird um 'Account Manager' erweitert; Daten bleiben unveraendert.

PRAGMA foreign_keys = OFF;

CREATE TABLE employees_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  rolle TEXT NOT NULL CHECK (rolle IN ('KAM', 'NKV-Closer', 'Opener', 'Setter', 'Multi', 'Closer-KAM', 'Account Manager')),
  aktiv INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  standort TEXT,
  show_in_kpi INTEGER NOT NULL DEFAULT 1
);

INSERT INTO employees_new SELECT id, name, company_id, rolle, aktiv, created_at, standort, show_in_kpi FROM employees;

DROP TABLE employees;

ALTER TABLE employees_new RENAME TO employees;

PRAGMA foreign_keys = ON;
