-- Backfill: Nein-deals without an assigned contact get the KAM set as Ansprechpartner
UPDATE deals_vl
SET neuer_ap_intern = CAST(kam_id AS TEXT)
WHERE weitergeben_an_vertrieb = 'Nein'
  AND (neuer_ap_intern IS NULL OR neuer_ap_intern = '')
  AND kam_id IS NOT NULL;
