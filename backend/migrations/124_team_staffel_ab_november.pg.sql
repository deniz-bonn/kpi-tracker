-- Migration 124: Team-Staffel Bonn (5 Stufen) gilt ab KALENDERMONAT November 2026, nicht ab dem
-- Abrechnungszeitraum 21.10. (Korrektur Deniz, 06.11.2026: "ab dem 1. November", Oktober fair nach
-- alter Staffel). Die Engine waehlt die Staffel seitdem je Kalendermonat (Stichtag Monat-28).
UPDATE provision_staffel SET gueltig_ab = '2026-11-01'
 WHERE kreis = 'bonn' AND rolle = 'team' AND gueltig_ab = '2026-10-21';

-- Die mit 142f5e1 beim Startabgleich gebuchten Ruecknahmen fuer Oktober-Deals ab 21.10. (2 % -> 1,5 %)
-- entfernen, statt sie mit Gegenbuchungen zu ueberlagern (Vorgabe Deniz: "wieder rausnehmen").
-- Eindeutig ueber den Text, den es nur seit 142f5e1 gibt; nur offene (nicht eingefrorene) Zeilen.
-- Danach ist der Ist-Stand wieder der vom 05.11. — der Startabgleich bucht fuer Oktober nichts nach.
DELETE FROM provision_buchungen
 WHERE rolle = 'team' AND typ = 'team_upgrade' AND eingefroren = FALSE AND deal_id IS NOT NULL
   AND betrag < 0 AND gewonnen_datum >= '2026-10-01' AND gewonnen_datum <= '2026-10-31'
   AND beschreibung LIKE '%Anpassung nach unten auf den aktuellen Satz%';
