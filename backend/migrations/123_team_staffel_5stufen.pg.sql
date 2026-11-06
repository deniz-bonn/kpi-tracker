-- Migration 123: Team-Staffel Bonn (Teamprovision der Vertriebsleitung) mit fuenf Stufen
-- ab dem Abrechnungszeitraum 21.10.2026 (Vorgabe Deniz, 06.11.2026):
--   bis 300k AE -> 1 %, ab 300k -> 1,5 %, ab 500k -> 2 %, ab 750k -> 2,5 %, ab 1 Mio -> 3 %
-- Bemessung wie bisher: Bonn-AE des KALENDERMONATS. Welche Staffel gilt, entscheidet der
-- Abrechnungszeitraum des einzelnen Deals (21.-20.) — Deals vor dem 21.10. behalten die alte
-- Dreistufen-Staffel aus provision_config (team_s1..team_s3), nichts wird rueckwirkend geaendert.
-- Grenzen zaehlen zur hoeheren Stufe (ab_betrag <= Monats-AE), wie bei der AT-Staffel.
INSERT INTO provision_staffel (kreis, rolle, gueltig_ab, ab_betrag, satz) VALUES
  ('bonn', 'team', '2026-10-21', 0, 1.0),
  ('bonn', 'team', '2026-10-21', 300000, 1.5),
  ('bonn', 'team', '2026-10-21', 500000, 2.0),
  ('bonn', 'team', '2026-10-21', 750000, 2.5),
  ('bonn', 'team', '2026-10-21', 1000000, 3.0)
ON CONFLICT DO NOTHING;
