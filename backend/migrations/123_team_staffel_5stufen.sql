-- Migration 123 (SQLite): fachlich identisch zur .pg.sql.
INSERT OR IGNORE INTO provision_staffel (kreis, rolle, gueltig_ab, ab_betrag, satz) VALUES
  ('bonn', 'team', '2026-10-21', 0, 1.0),
  ('bonn', 'team', '2026-10-21', 300000, 1.5),
  ('bonn', 'team', '2026-10-21', 500000, 2.0),
  ('bonn', 'team', '2026-10-21', 750000, 2.5),
  ('bonn', 'team', '2026-10-21', 1000000, 3.0);
