-- Migration 094: Standort-Regeln (Abrechnungskreise Bonn / Braunschweig / Oesterreich) — Postgres
-- Provisionen werden pro Beteiligtem nach dessen Standort gerechnet und abgerechnet:
--   Bonn         -> Zyklus 21.-20. (unveraendert), klassische %-Saetze + Team-Staffel
--   Braunschweig -> Zyklus Kalendermonat, Opener 125 EUR fix je Sales Call, sonst wie Bonn
--   Oesterreich  -> Zyklus Kalendermonat, Opener/Setter Staffeltabelle, Closer 7% (Auto-VL) / 5%
-- kreis-Schluessel bewusst ASCII: bonn|braunschweig|oesterreich (Mapping standort->kreis in der Engine).

-- 1) Zeitraeume bekommen eine Kreis-Dimension. BS-Juli und AT-Juli teilen sich von='2026-07-01'
--    -> Eindeutigkeit und alle Lookups laufen ueber (kreis, von), nicht mehr ueber von allein.
ALTER TABLE provision_zeitraeume ADD COLUMN IF NOT EXISTS kreis TEXT NOT NULL DEFAULT 'bonn';
CREATE UNIQUE INDEX IF NOT EXISTS idx_prov_zr_kreis_von ON provision_zeitraeume(kreis, von);

-- 2) Config bekommt eine Kreis-Dimension + Modus-Spalten und einen zusammengesetzten PK (kreis, gueltig_ab).
--    Bestandszeile faellt per DEFAULT auf kreis='bonn', Modus-Spalten NULL => identisches Bonn-Verhalten.
ALTER TABLE provision_config ADD COLUMN IF NOT EXISTS kreis TEXT NOT NULL DEFAULT 'bonn';
ALTER TABLE provision_config ADD COLUMN IF NOT EXISTS opener_modus TEXT;
ALTER TABLE provision_config ADD COLUMN IF NOT EXISTS opener_fix NUMERIC;
ALTER TABLE provision_config ADD COLUMN IF NOT EXISTS setter_modus TEXT;
ALTER TABLE provision_config ADD COLUMN IF NOT EXISTS closer_modus TEXT;
ALTER TABLE provision_config DROP CONSTRAINT IF EXISTS provision_config_pkey;
ALTER TABLE provision_config ADD PRIMARY KEY (kreis, gueltig_ab);

-- Braunschweig-Config (Kalendermonat). Opener 125 EUR fix (opener_modus='fix'), Setter 2,5%,
-- O+S-Pauschale 3,5%, Closer 3,5% mit Schwelle 200k -> 4% (wie Bonn). Kein Team (Team bleibt Bonn-exklusiv).
INSERT INTO provision_config
  (kreis, gueltig_ab, opener_satz, setter_satz, opener_setter_pauschal, closer_basis, closer_schwelle, closer_hoch, team_empfaenger_id, team_s1_bis, team_s1, team_s2_bis, team_s2, team_s3, opener_modus, opener_fix, setter_modus, closer_modus)
VALUES
  ('braunschweig', '2026-07-01', 0, 2.5, 3.5, 3.5, 200000, 4.0, NULL, 0, 0, 0, 0, 0, 'fix', 125, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Oesterreich-Config (Kalendermonat). Opener/Setter via Staffeltabelle (provision_staffel),
-- Closer flach nach Auto-VL: closer_hoch=7% (Auto-VL='Ja'), closer_basis=5% (sonst); closer_modus='flat_vl'.
INSERT INTO provision_config
  (kreis, gueltig_ab, opener_satz, setter_satz, opener_setter_pauschal, closer_basis, closer_schwelle, closer_hoch, team_empfaenger_id, team_s1_bis, team_s1, team_s2_bis, team_s2, team_s3, opener_modus, opener_fix, setter_modus, closer_modus)
VALUES
  ('oesterreich', '2026-07-01', 0, 0, 0, 5.0, 0, 7.0, NULL, 0, 0, 0, 0, 0, 'staffel', NULL, 'staffel', 'flat_vl')
ON CONFLICT DO NOTHING;

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
INSERT INTO provision_staffel (kreis, rolle, gueltig_ab, ab_betrag, satz) VALUES
  ('oesterreich', 'opener', '2026-07-01', 0, 0),
  ('oesterreich', 'opener', '2026-07-01', 20000, 1.5),
  ('oesterreich', 'opener', '2026-07-01', 30000, 2.0),
  ('oesterreich', 'opener', '2026-07-01', 40000, 3.0),
  ('oesterreich', 'opener', '2026-07-01', 50000, 4.0),
  ('oesterreich', 'opener', '2026-07-01', 60000, 5.0),
  ('oesterreich', 'opener', '2026-07-01', 70000, 6.0),
  ('oesterreich', 'opener', '2026-07-01', 80000, 7.0),
  ('oesterreich', 'opener', '2026-07-01', 90000, 8.0),
  ('oesterreich', 'opener', '2026-07-01', 100000, 9.0)
ON CONFLICT DO NOTHING;
-- AT-Setter: bis 50k -> 1%, dann 50k->1,5% ... 160k->3,5%.
INSERT INTO provision_staffel (kreis, rolle, gueltig_ab, ab_betrag, satz) VALUES
  ('oesterreich', 'setter', '2026-07-01', 0, 1.0),
  ('oesterreich', 'setter', '2026-07-01', 50000, 1.5),
  ('oesterreich', 'setter', '2026-07-01', 80000, 1.75),
  ('oesterreich', 'setter', '2026-07-01', 100000, 2.0),
  ('oesterreich', 'setter', '2026-07-01', 120000, 2.5),
  ('oesterreich', 'setter', '2026-07-01', 140000, 3.0),
  ('oesterreich', 'setter', '2026-07-01', 160000, 3.5)
ON CONFLICT DO NOTHING;
