-- Migration 010: Remove duplicate deals_nk rows (PostgreSQL)
-- Cause: import_csv.js was run twice without a uniqueness guard.
-- Duplicates are identified by (kunde, datum, monat, ae_wert, closer_id).
-- Keep the row with the lowest id; delete all others.

DELETE FROM deals_nk
WHERE id NOT IN (
  SELECT MIN(id)
  FROM deals_nk
  GROUP BY kunde, datum, monat, ae_wert, COALESCE(closer_id, 0)
);
