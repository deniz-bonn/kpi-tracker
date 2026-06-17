-- Backfill: all existing Verloren deals that already have auslaufend_am set
-- are treated as "weitergeben an Vertrieb = Ja" (old data, before the flag existed)
UPDATE deals_vl
SET weitergeben_an_vertrieb = 'Ja'
WHERE status = 'Verloren'
  AND auslaufend_am IS NOT NULL
  AND weitergeben_an_vertrieb IS NULL;
