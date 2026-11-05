-- Migration 122: In Close geloeschte Opportunities im Spiegel markieren (nicht loeschen, damit die
-- Show-Rate-Historie unveraendert bleibt). Gesetzt vom Lueckenfueller der Wochenanalyse bei HTTP 404.
-- Die Verbleib-Liste und die Report-Beispiele lassen markierte Opportunities aus.
ALTER TABLE close_opportunities ADD COLUMN IF NOT EXISTS geloescht_am TIMESTAMPTZ;
