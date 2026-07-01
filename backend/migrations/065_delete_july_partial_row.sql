-- Migration 065: Fehlerhaft erstellten Juli-2026-Row in ae_gesamt_monthly löschen (SQLite).

DELETE FROM ae_gesamt_monthly WHERE monat = '2026-07';
