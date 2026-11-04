-- Migration 118: Live-Board — Einstellungen je Person (SQLite) — fachlich identisch zur .pg.sql.
CREATE TABLE IF NOT EXISTS board_personen (
  employee_id  INTEGER PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
  ausblenden   INTEGER NOT NULL DEFAULT 0,
  arbeitstage  TEXT,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by   INTEGER
);

INSERT INTO board_personen (employee_id, ausblenden)
  SELECT id, 1 FROM employees WHERE standort='Bonn' AND ((id=2 AND name LIKE 'Deniz Akpinar%') OR (id=24 AND name LIKE 'Marcel Mu%ciano%'))
ON CONFLICT (employee_id) DO NOTHING;
INSERT INTO board_personen (employee_id, arbeitstage)
  SELECT id, '1,2' FROM employees WHERE standort='Bonn' AND id=82 AND name LIKE 'Fode%'
ON CONFLICT (employee_id) DO NOTHING;
