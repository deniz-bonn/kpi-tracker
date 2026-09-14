-- Migration 103: Lauf-Protokoll des Close-Syncs.
--
-- Loest vier Dinge auf einmal, die bisher alle an derselben fehlenden Information hingen:
--   1. Cooldown     — "wann lief zuletzt ein ERFOLGREICHER Sync" ist aus close_status_events
--                     nicht ableitbar: MAX(synced_at) bewegt sich nur, wenn auch Events kamen.
--                     Ein Lauf ohne Neuigkeiten waere sonst unsichtbar und der Cooldown wirkungslos.
--   2. Audit        — wer hat wann manuell ausgeloest (Vorgabe: ins Log/Qualitaets-Panel).
--   3. Job-Lock     — der laufende Job steht als Zeile mit status='laeuft' drin.
--   4. Cron-Historie— der naechtliche Lauf war bisher nur in den Railway-Logs sichtbar. Ab hier
--                     steht er in der App, d.h. die Frage "laeuft der Nightly?" ist ohne
--                     Log-Zugriff beantwortbar.
--
-- Rein additiv, kein Bezug zu bestehenden Auswertungen.
CREATE TABLE IF NOT EXISTS close_sync_runs (
  id             SERIAL PRIMARY KEY,
  gestartet_am   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  beendet_am     TIMESTAMPTZ,
  ausgeloest_von TEXT        NOT NULL,            -- 'cron' | 'manuell'
  user_id        INTEGER     REFERENCES users(id) ON DELETE SET NULL,
  user_name      TEXT,                            -- denormalisiert: bleibt lesbar, wenn der User geht
  status         TEXT        NOT NULL,            -- 'laeuft' | 'ok' | 'fehler' | 'abgebrochen'
  dauer_sek      NUMERIC(10,2),
  since          TEXT,                            -- gesetzt = expliziter Backfill statt inkrementell
  events         INTEGER,                          -- Statuswechsel-Events in diesem Lauf (Upsert, daher
                                                   -- "geholt", nicht "neu" — Close liefert die Unterscheidung nicht)
  opportunities  INTEGER,
  termine        INTEGER,
  fehler         TEXT
);

CREATE INDEX IF NOT EXISTS idx_close_sync_runs_gestartet ON close_sync_runs (gestartet_am DESC);
-- Fuer die Cooldown-Abfrage "letzter erfolgreicher Lauf".
CREATE INDEX IF NOT EXISTS idx_close_sync_runs_ok ON close_sync_runs (beendet_am DESC) WHERE status = 'ok';
