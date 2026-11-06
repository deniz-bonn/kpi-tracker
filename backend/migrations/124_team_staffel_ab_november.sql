-- Migration 124 (SQLite): fachlich identisch zur .pg.sql.
UPDATE provision_staffel SET gueltig_ab = '2026-11-01'
 WHERE kreis = 'bonn' AND rolle = 'team' AND gueltig_ab = '2026-10-21';
DELETE FROM provision_buchungen
 WHERE rolle = 'team' AND typ = 'team_upgrade' AND eingefroren = 0 AND deal_id IS NOT NULL
   AND betrag < 0 AND gewonnen_datum >= '2026-10-01' AND gewonnen_datum <= '2026-10-31'
   AND beschreibung LIKE '%Anpassung nach unten auf den aktuellen Satz%';
