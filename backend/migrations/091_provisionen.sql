-- Migration 091: Provisionsmodul (NK, Standorte Bonn und Braunschweig) — SQLite
-- Append-only Kontoauszug. Das Modul liest deals_nk/employees und schreibt NUR in provision_*.
-- Abrechnungszeitraum 21.-20. (der 20. voll drin). Seed = laufender Zeitraum 21.07.-20.08.2026.
-- Datumsspalten bewusst TEXT (YYYY-MM-DD) fuer identisches Verhalten in beiden Dialekten.

CREATE TABLE IF NOT EXISTS provision_zeitraeume (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  von               TEXT NOT NULL,
  bis               TEXT NOT NULL,
  label             TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'offen',
  abgeschlossen_am  TEXT,
  abgeschlossen_von INTEGER
);

INSERT INTO provision_zeitraeume (von, bis, label, status)
SELECT '2026-07-21', '2026-08-20', '21.07.–20.08.2026', 'offen'
WHERE NOT EXISTS (SELECT 1 FROM provision_zeitraeume WHERE von = '2026-07-21');

CREATE TABLE IF NOT EXISTS provision_config (
  gueltig_ab             TEXT PRIMARY KEY,
  opener_satz            NUMERIC NOT NULL,
  setter_satz            NUMERIC NOT NULL,
  opener_setter_pauschal NUMERIC NOT NULL,
  closer_basis           NUMERIC NOT NULL,
  closer_schwelle        NUMERIC NOT NULL,
  closer_hoch            NUMERIC NOT NULL,
  team_empfaenger_id     INTEGER,
  team_s1_bis            NUMERIC NOT NULL,
  team_s1                NUMERIC NOT NULL,
  team_s2_bis            NUMERIC NOT NULL,
  team_s2                NUMERIC NOT NULL,
  team_s3                NUMERIC NOT NULL,
  updated_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO provision_config (gueltig_ab, opener_satz, setter_satz, opener_setter_pauschal, closer_basis, closer_schwelle, closer_hoch, team_empfaenger_id, team_s1_bis, team_s1, team_s2_bis, team_s2, team_s3)
SELECT '2026-07-21', 3.0, 2.5, 3.5, 3.5, 200000, 4.0, (SELECT id FROM employees WHERE name = 'Tobias Böttcher' ORDER BY aktiv DESC, id LIMIT 1), 150000, 1.0, 250000, 1.5, 2.0
WHERE NOT EXISTS (SELECT 1 FROM provision_config WHERE gueltig_ab = '2026-07-21');

CREATE TABLE IF NOT EXISTS provision_buchungen (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  zeitraum_id         INTEGER NOT NULL,
  employee_id         INTEGER NOT NULL,
  deal_id             INTEGER,
  rolle               TEXT NOT NULL,
  typ                 TEXT NOT NULL,
  satz                NUMERIC NOT NULL,
  bemessungsgrundlage NUMERIC NOT NULL,
  betrag              NUMERIC NOT NULL,
  kalendermonat       TEXT NOT NULL,
  gewonnen_datum      TEXT,
  beschreibung        TEXT,
  idem_key            TEXT UNIQUE,
  eingefroren         INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_prov_buch_emp_zr ON provision_buchungen(employee_id, zeitraum_id);
CREATE INDEX IF NOT EXISTS idx_prov_buch_deal  ON provision_buchungen(deal_id);
