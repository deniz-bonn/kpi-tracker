-- Migration 094: Standort-Regeln (Abrechnungskreise Bonn / Braunschweig / Oesterreich) — SQLite
-- Provisionen werden pro Beteiligtem nach dessen Standort gerechnet und abgerechnet:
--   Bonn         -> Zyklus 21.-20. (unveraendert), klassische %-Saetze + Team-Staffel
--   Braunschweig -> Zyklus Kalendermonat, Opener 125 EUR fix je Sales Call, sonst wie Bonn
--   Oesterreich  -> Zyklus Kalendermonat, Opener/Setter Staffeltabelle, Closer 7% (Auto-VL) / 5%
-- kreis-Schluessel bewusst ASCII: bonn|braunschweig|oesterreich (Mapping standort->kreis in der Engine).

-- 1) Zeitraeume bekommen eine Kreis-Dimension. BS-Juli und AT-Juli teilen sich von='2026-07-01'
--    -> Eindeutigkeit und alle Lookups laufen ueber (kreis, von), nicht mehr ueber von allein.
ALTER TABLE provision_zeitraeume ADD COLUMN kreis TEXT NOT NULL DEFAULT 'bonn';
CREATE UNIQUE INDEX IF NOT EXISTS idx_prov_zr_kreis_von ON provision_zeitraeume(kreis, von);

-- 2) Config bekommt eine Kreis-Dimension + Modus-Spalten. SQLite kann den PK nicht in-place aendern
--    (bisher PK=gueltig_ab), daher Table-Rebuild auf PK=(kreis, gueltig_ab). Bestandszeile -> kreis='bonn',
--    Modus-Spalten NULL => identisches Bonn-Verhalten (keine Regression).
CREATE TABLE provision_config_new (
  kreis                  TEXT NOT NULL DEFAULT 'bonn',
  gueltig_ab             TEXT NOT NULL,
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
  opener_modus           TEXT,
  opener_fix             NUMERIC,
  setter_modus           TEXT,
  closer_modus           TEXT,
  updated_at             TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (kreis, gueltig_ab)
);
INSERT INTO provision_config_new
  (kreis, gueltig_ab, opener_satz, setter_satz, opener_setter_pauschal, closer_basis, closer_schwelle, closer_hoch, team_empfaenger_id, team_s1_bis, team_s1, team_s2_bis, team_s2, team_s3, updated_at)
SELECT 'bonn', gueltig_ab, opener_satz, setter_satz, opener_setter_pauschal, closer_basis, closer_schwelle, closer_hoch, team_empfaenger_id, team_s1_bis, team_s1, team_s2_bis, team_s2, team_s3, updated_at
  FROM provision_config;
DROP TABLE provision_config;
ALTER TABLE provision_config_new RENAME TO provision_config;

-- Braunschweig-Config (Kalendermonat). Opener 125 EUR fix (opener_modus='fix'), Setter 2,5%,
-- O+S-Pauschale 3,5%, Closer 3,5% mit Schwelle 200k -> 4% (wie Bonn). Kein Team (Team bleibt Bonn-exklusiv).
INSERT OR IGNORE INTO provision_config
  (kreis, gueltig_ab, opener_satz, setter_satz, opener_setter_pauschal, closer_basis, closer_schwelle, closer_hoch, team_empfaenger_id, team_s1_bis, team_s1, team_s2_bis, team_s2, team_s3, opener_modus, opener_fix, setter_modus, closer_modus)
VALUES
  ('braunschweig', '2026-07-01', 0, 2.5, 3.5, 3.5, 200000, 4.0, NULL, 0, 0, 0, 0, 0, 'fix', 125, NULL, NULL);

-- Oesterreich-Config (Kalendermonat). Opener/Setter via Staffeltabelle (provision_staffel),
-- Closer flach nach Auto-VL: closer_hoch=7% (Auto-VL='Ja'), closer_basis=5% (sonst); closer_modus='flat_vl'.
INSERT OR IGNORE INTO provision_config
  (kreis, gueltig_ab, opener_satz, setter_satz, opener_setter_pauschal, closer_basis, closer_schwelle, closer_hoch, team_empfaenger_id, team_s1_bis, team_s1, team_s2_bis, team_s2, team_s3, opener_modus, opener_fix, setter_modus, closer_modus)
VALUES
  ('oesterreich', '2026-07-01', 0, 0, 0, 5.0, 0, 7.0, NULL, 0, 0, 0, 0, 0, 'staffel', NULL, 'staffel', 'flat_vl');

-- 3) Staffeltabelle fuer AT-Opener/Setter. Satz = hoechste Stufe mit ab_betrag <= Monats-AE des Beteiligten.
CREATE TABLE IF NOT EXISTS provision_staffel (
  kreis      TEXT NOT NULL,
  rolle      TEXT NOT NULL,
  gueltig_ab TEXT NOT NULL,
  ab_betrag  NUMERIC NOT NULL,
  satz       NUMERIC NOT NULL,
  PRIMARY KEY (kreis, rolle, gueltig_ab, ab_betrag)
);
-- AT-Opener: unter 20k -> 0%, dann 20k->1,5% ... 100k->9% (verbindliches Beispiel 91.250 EUR -> 8% = 7.300 EUR).
INSERT OR IGNORE INTO provision_staffel (kreis, rolle, gueltig_ab, ab_betrag, satz) VALUES
  ('oesterreich', 'opener', '2026-07-01', 0, 0),
  ('oesterreich', 'opener', '2026-07-01', 20000, 1.5),
  ('oesterreich', 'opener', '2026-07-01', 30000, 2.0),
  ('oesterreich', 'opener', '2026-07-01', 40000, 3.0),
  ('oesterreich', 'opener', '2026-07-01', 50000, 4.0),
  ('oesterreich', 'opener', '2026-07-01', 60000, 5.0),
  ('oesterreich', 'opener', '2026-07-01', 70000, 6.0),
  ('oesterreich', 'opener', '2026-07-01', 80000, 7.0),
  ('oesterreich', 'opener', '2026-07-01', 90000, 8.0),
  ('oesterreich', 'opener', '2026-07-01', 100000, 9.0);
-- AT-Setter: bis 50k -> 1%, dann 50k->1,5% ... 160k->3,5%.
INSERT OR IGNORE INTO provision_staffel (kreis, rolle, gueltig_ab, ab_betrag, satz) VALUES
  ('oesterreich', 'setter', '2026-07-01', 0, 1.0),
  ('oesterreich', 'setter', '2026-07-01', 50000, 1.5),
  ('oesterreich', 'setter', '2026-07-01', 80000, 1.75),
  ('oesterreich', 'setter', '2026-07-01', 100000, 2.0),
  ('oesterreich', 'setter', '2026-07-01', 120000, 2.5),
  ('oesterreich', 'setter', '2026-07-01', 140000, 3.0),
  ('oesterreich', 'setter', '2026-07-01', 160000, 3.5);
