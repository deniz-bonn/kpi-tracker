-- Migration 053: Marcel (id=19) → Marcel Scheller (id=24) für closer_id und setter_id
-- Ergänzt Migration 051 (die nur opener_id geändert hat).
-- Die Standort-Zuordnung im KPI-Tracker basiert auf closer_id — daher ist dieser Fix
-- notwendig, damit Marcels Deals korrekt Braunschweig statt Bonn zugeordnet werden.

UPDATE deals_nk SET closer_id=24, updated_at=NOW() WHERE closer_id=19;
UPDATE deals_nk SET setter_id=24, updated_at=NOW() WHERE setter_id=19;
