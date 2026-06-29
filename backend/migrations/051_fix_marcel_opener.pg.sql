-- Migration 051: Marcel Murciano (id=19) → Marcel Scheller (id=24) in deals_nk
-- Alle Deals, wo Marcel (id=19) als Opener eingetragen ist, werden auf Marcel Scheller (id=24) umgelegt.
-- Betrifft Mai und Juni 2026 (und ggf. ältere Monate).

UPDATE deals_nk SET opener_id=24, updated_at=NOW() WHERE opener_id=19;
