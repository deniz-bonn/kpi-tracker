-- Migration 093: Altbestand — 5 dokumentierte NK-Closing-Calls ohne Angebot (Juli 2026),
-- historisch als Verloren mit Angebotswert 0 erfasst. GEZIELT per ID markiert (NICHT per Kriterium:
-- es gibt echte 0-EUR-Sonderfaelle). Kein Statuswechsel/AE/Provision betroffen (bereits Verloren,
-- kein ae_wert) -> reines Setzen von angebot_erstellt=false + Grund. Guard macht es idempotent/sicher.
UPDATE deals_nk SET angebot_erstellt = FALSE, kein_angebot_grund = 'altbestand'
 WHERE id IN (16016, 16018, 16020, 16035, 16545)
   AND status = 'Verloren' AND (angebotswert IS NULL OR angebotswert = 0) AND angebot_erstellt = TRUE;
