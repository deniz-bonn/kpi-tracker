-- Migration 065: Fehlerhaft erstellten Juli-2026-Row in ae_gesamt_monthly löschen.
-- Der Row wurde durch den INSERT-Pfad von syncAeGesamtNK angelegt (nur erster Deal).
-- Ohne den Row ist useAG=false für Juli → Dashboard liest Live-Daten (alle Deals korrekt).

DELETE FROM ae_gesamt_monthly WHERE monat = '2026-07';
