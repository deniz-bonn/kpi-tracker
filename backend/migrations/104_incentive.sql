-- Migration 104: Team-Incentive September/Oktober 2026 (SQLite — Begruendung siehe .pg.sql).
-- SQLite: SERIAL -> INTEGER AUTOINCREMENT, TIMESTAMPTZ -> TEXT, BOOLEAN -> INTEGER, NUMERIC -> REAL.
-- Der Seed laeuft hier als eine INSERT-Anweisung je Person, weil SQLite die benannte
-- VALUES-Tabelle (VALUES ... AS v(spalten)) der Postgres-Fassung nicht kennt.

CREATE TABLE IF NOT EXISTS incentive_ziele (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id       INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  zeitraum_von      TEXT    NOT NULL,
  zeitraum_bis      TEXT    NOT NULL,
  messbasis         TEXT    NOT NULL CHECK (messbasis IN ('opener','setter','closer')),
  showrate_art      TEXT    CHECK (showrate_art IN ('setting','closing')),
  ziel_ae_warschau  REAL,
  ziel_sr_warschau  REAL,
  ziel_ae_muenchen  REAL,
  ziel_sr_muenchen  REAL,
  vorlaeufig        INTEGER NOT NULL DEFAULT 0,
  notiz             TEXT,
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (employee_id, zeitraum_von, zeitraum_bis)
);

CREATE TABLE IF NOT EXISTS incentive_monatswerte (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id       INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  monat             TEXT    NOT NULL,
  messbasis         TEXT    NOT NULL,
  showrate_art      TEXT,
  ae                REAL    NOT NULL DEFAULT 0,
  sr_gelegt         INTEGER NOT NULL DEFAULT 0,
  sr_bewertet       INTEGER NOT NULL DEFAULT 0,
  sr_statt          INTEGER NOT NULL DEFAULT 0,
  eingefroren_am    TEXT    NOT NULL DEFAULT (datetime('now')),
  eingefroren_von   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (employee_id, monat)
);
CREATE INDEX IF NOT EXISTS idx_incentive_mw_monat ON incentive_monatswerte (monat);

INSERT INTO incentive_ziele
  (employee_id, zeitraum_von, zeitraum_bis, messbasis, showrate_art,
   ziel_ae_warschau, ziel_sr_warschau, ziel_ae_muenchen, ziel_sr_muenchen, vorlaeufig, notiz)
SELECT e.id, '2026-09', '2026-10', 'opener', 'setting', 300000, 72, 350000, 78, 0, NULL
  FROM employees e
 WHERE TRIM(e.name) = 'Mikail Kotaman'
   AND NOT EXISTS (SELECT 1 FROM incentive_ziele z WHERE z.employee_id = e.id
                     AND z.zeitraum_von = '2026-09' AND z.zeitraum_bis = '2026-10');

INSERT INTO incentive_ziele
  (employee_id, zeitraum_von, zeitraum_bis, messbasis, showrate_art,
   ziel_ae_warschau, ziel_sr_warschau, ziel_ae_muenchen, ziel_sr_muenchen, vorlaeufig, notiz)
SELECT e.id, '2026-09', '2026-10', 'opener', 'setting', 260000, 72, 300000, 78, 0, NULL
  FROM employees e
 WHERE TRIM(e.name) = 'Dominik Bous'
   AND NOT EXISTS (SELECT 1 FROM incentive_ziele z WHERE z.employee_id = e.id
                     AND z.zeitraum_von = '2026-09' AND z.zeitraum_bis = '2026-10');

INSERT INTO incentive_ziele
  (employee_id, zeitraum_von, zeitraum_bis, messbasis, showrate_art,
   ziel_ae_warschau, ziel_sr_warschau, ziel_ae_muenchen, ziel_sr_muenchen, vorlaeufig, notiz)
SELECT e.id, '2026-09', '2026-10', 'opener', 'setting', 370000, 72, 430000, 78, 1, 'Rolle und Zielwerte werden im August geklaert — Show-Rate ggf. Beratung statt Setting.'
  FROM employees e
 WHERE TRIM(e.name) = 'Brian Groten'
   AND NOT EXISTS (SELECT 1 FROM incentive_ziele z WHERE z.employee_id = e.id
                     AND z.zeitraum_von = '2026-09' AND z.zeitraum_bis = '2026-10');

INSERT INTO incentive_ziele
  (employee_id, zeitraum_von, zeitraum_bis, messbasis, showrate_art,
   ziel_ae_warschau, ziel_sr_warschau, ziel_ae_muenchen, ziel_sr_muenchen, vorlaeufig, notiz)
SELECT e.id, '2026-09', '2026-10', 'setter', 'closing', 450000, 77, 550000, 80, 0, NULL
  FROM employees e
 WHERE TRIM(e.name) = 'Andreas Buharin'
   AND NOT EXISTS (SELECT 1 FROM incentive_ziele z WHERE z.employee_id = e.id
                     AND z.zeitraum_von = '2026-09' AND z.zeitraum_bis = '2026-10');

INSERT INTO incentive_ziele
  (employee_id, zeitraum_von, zeitraum_bis, messbasis, showrate_art,
   ziel_ae_warschau, ziel_sr_warschau, ziel_ae_muenchen, ziel_sr_muenchen, vorlaeufig, notiz)
SELECT e.id, '2026-09', '2026-10', 'setter', 'closing', 300000, 77, 400000, 80, 1, 'Zielwerte beruhen auf nur 5 Arbeitstagen im Juli, werden mit den August-Zahlen geprueft.'
  FROM employees e
 WHERE TRIM(e.name) = 'Markus Bauer'
   AND NOT EXISTS (SELECT 1 FROM incentive_ziele z WHERE z.employee_id = e.id
                     AND z.zeitraum_von = '2026-09' AND z.zeitraum_bis = '2026-10');

INSERT INTO incentive_ziele
  (employee_id, zeitraum_von, zeitraum_bis, messbasis, showrate_art,
   ziel_ae_warschau, ziel_sr_warschau, ziel_ae_muenchen, ziel_sr_muenchen, vorlaeufig, notiz)
SELECT e.id, '2026-09', '2026-10', 'setter', 'closing', 450000, 77, 550000, 80, 0, NULL
  FROM employees e
 WHERE TRIM(e.name) = 'Clemens Näkel'
   AND NOT EXISTS (SELECT 1 FROM incentive_ziele z WHERE z.employee_id = e.id
                     AND z.zeitraum_von = '2026-09' AND z.zeitraum_bis = '2026-10');

INSERT INTO incentive_ziele
  (employee_id, zeitraum_von, zeitraum_bis, messbasis, showrate_art,
   ziel_ae_warschau, ziel_sr_warschau, ziel_ae_muenchen, ziel_sr_muenchen, vorlaeufig, notiz)
SELECT e.id, '2026-09', '2026-10', 'closer', NULL, 600000, NULL, 700000, NULL, 0, 'Closer legen keine Termine — keine Show-Rate.'
  FROM employees e
 WHERE TRIM(e.name) = 'Julius Kawka'
   AND NOT EXISTS (SELECT 1 FROM incentive_ziele z WHERE z.employee_id = e.id
                     AND z.zeitraum_von = '2026-09' AND z.zeitraum_bis = '2026-10');
