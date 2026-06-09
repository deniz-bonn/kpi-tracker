-- Migration 002: Seed Data
-- Initiale Companies und Mitarbeiter (SQLite-kompatibel)

INSERT OR IGNORE INTO companies (id, name, standort, aktiv) VALUES
  (1, 'fach.digital', 'Deutschland', 1),
  (2, 'High Office IT', 'Deutschland', 1),
  (3, 'Morawitz', 'Deutschland', 1);

-- Beispiel-Mitarbeiter (werden über UI ergänzt)
INSERT OR IGNORE INTO employees (id, name, company_id, rolle, aktiv) VALUES
  (1, 'René', 1, 'NKV-Closer', 1),
  (2, 'Deniz', 1, 'Multi', 1);
