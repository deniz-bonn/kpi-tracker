-- Migration 054: Marcel Murciano → Marcel Scheller, namensbasiert
-- Migrationen 051/053 nutzten hardcodierte IDs (19→24), die auf Railway
-- möglicherweise falsch waren. Diese Migration sucht per Name.

DO $$
DECLARE
  old_id INTEGER;
  new_id INTEGER;
  cnt_opener INTEGER;
  cnt_closer INTEGER;
  cnt_setter INTEGER;
BEGIN
  SELECT id INTO new_id FROM employees
    WHERE name ILIKE '%Marcel Scheller%'
    LIMIT 1;

  IF new_id IS NULL THEN
    RAISE NOTICE 'Migration 054: Marcel Scheller nicht gefunden – abgebrochen.';
    RETURN;
  END IF;

  SELECT id INTO old_id FROM employees
    WHERE id != new_id
      AND (name ILIKE '%Murciano%' OR name = 'Marcel')
    ORDER BY id
    LIMIT 1;

  IF old_id IS NULL THEN
    RAISE NOTICE 'Migration 054: Marcel Murciano / Marcel nicht gefunden – abgebrochen.';
    RETURN;
  END IF;

  UPDATE deals_nk SET opener_id = new_id, updated_at = NOW() WHERE opener_id = old_id;
  GET DIAGNOSTICS cnt_opener = ROW_COUNT;

  UPDATE deals_nk SET closer_id = new_id, updated_at = NOW() WHERE closer_id = old_id;
  GET DIAGNOSTICS cnt_closer = ROW_COUNT;

  UPDATE deals_nk SET setter_id = new_id, updated_at = NOW() WHERE setter_id = old_id;
  GET DIAGNOSTICS cnt_setter = ROW_COUNT;

  RAISE NOTICE 'Migration 054: employee % → % (Marcel Scheller). opener: %, closer: %, setter: %',
    old_id, new_id, cnt_opener, cnt_closer, cnt_setter;
END $$;
