-- Migration 087: gewonnen_monat aus gewonnen_datum heilen (nur deals_nk, fuer die Bestenliste)
-- Gewonnene NK-Deals ohne gewonnen_monat, aber MIT gewonnen_datum, bekommen den Monat
-- aus dem Datum abgeleitet. Deals OHNE gewonnen_datum bleiben bewusst unberuehrt --
-- ihr Gewinnmonat ist nicht bestimmbar, sie fallen aus der Bestenliste raus und werden
-- separat manuell korrigiert (Vorgabe Deniz). Idempotent: nach dem Lauf ist gewonnen_monat
-- gesetzt, die WHERE-Bedingung trifft die Zeilen nicht mehr.
UPDATE deals_nk
   SET gewonnen_monat = to_char(gewonnen_datum, 'YYYY-MM')
 WHERE status = 'Gewonnen'
   AND (gewonnen_monat IS NULL OR gewonnen_monat = '')
   AND gewonnen_datum IS NOT NULL;
