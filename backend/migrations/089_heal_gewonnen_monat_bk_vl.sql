-- Migration 089: gewonnen_monat aus gewonnen_datum heilen — deals_bk + deals_vl (SQLite).
-- Ergaenzt Migration 088 (die nur deals_nk heilt) um die beiden anderen Deal-Tabellen,
-- damit der Heilungslauf alle drei Tabellen genau EINMAL abdeckt (kein Overlap mit 088).
-- Gewonnene Deals ohne gewonnen_monat, aber MIT gewonnen_datum, bekommen den Monat aus dem Datum.
-- Ab jetzt strukturell unmoeglich (resolveGewonnenFelder leitet immer ab) -- das hier heilt Altbestand.
-- Idempotent: nach dem Lauf trifft die WHERE-Bedingung keine Zeilen mehr, ein zweiter Lauf aendert 0 Zeilen.
UPDATE deals_bk SET gewonnen_monat = substr(gewonnen_datum, 1, 7)
 WHERE status = 'Gewonnen' AND (gewonnen_monat IS NULL OR gewonnen_monat = '') AND gewonnen_datum IS NOT NULL;
UPDATE deals_vl SET gewonnen_monat = substr(gewonnen_datum, 1, 7)
 WHERE status = 'Gewonnen' AND (gewonnen_monat IS NULL OR gewonnen_monat = '') AND gewonnen_datum IS NOT NULL;
