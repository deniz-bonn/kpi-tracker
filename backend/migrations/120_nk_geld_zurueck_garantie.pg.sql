-- Migration 120: NK — Geld-zurück-Garantie je Angebot ('Ja' | 'Nein').
-- Pflicht bei jedem NEU angelegten Angebot (routes/deals_nk.js prueft es auch serverseitig).
-- NULL = nicht erfasst (Altbestand vor dem 04.11.2026) oder Call ohne Angebot.
ALTER TABLE deals_nk ADD COLUMN IF NOT EXISTS geld_zurueck_garantie TEXT
  CHECK (geld_zurueck_garantie IN ('Ja','Nein'));
