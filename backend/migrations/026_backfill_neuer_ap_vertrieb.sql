-- Backfill: existing Verloren+weitergeben=Ja deals with no assigned contact get 'Vertrieb'
UPDATE deals_vl
SET neuer_ap_intern = 'Vertrieb'
WHERE weitergeben_an_vertrieb = 'Ja'
  AND (neuer_ap_intern IS NULL OR neuer_ap_intern = '');
