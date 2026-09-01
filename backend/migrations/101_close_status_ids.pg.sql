-- Migration 101: Close-Sync gegen Status-Umbenennungen und Anlage-Opportunities haerten.
--
-- Anlass (31.08./01.09.2026): Die Vertriebsleitung hat die Sales-Pipeline umbenannt
-- ("Setting terminiert" -> "QC Terminiert", "Closing terminiert" -> "SC Terminiert", Altstatus
-- mit Suffix "Inaktiv"). Dabei zwei Erkenntnisse, die Migration 100 nicht beruecksichtigt hatte:
--
--   1. Close loest Status-LABELS DYNAMISCH auf: auch historische Events liefern nach einer
--      Umbenennung das neue Label. Eine Ableitung ueber Labels bricht damit lautlos.
--      -> Wir speichern und mappen ab jetzt ueber die stabile status_id.
--   2. Beim ANLEGEN einer Opportunity feuert Close KEIN status_change-Event (belegt: von 40 heute
--      angelegten Opportunities hatten 38 keines). Wer nur Statuswechsel liest, sieht den Grossteil
--      der neu terminierten QCs nie.
--      -> Opportunities werden zusaetzlich als Rohdaten gespiegelt; die Anlage gilt als "gelegt",
--         wenn der Anfangsstatus QC/SC Terminiert war.

ALTER TABLE close_status_events ADD COLUMN IF NOT EXISTS old_status_id TEXT;
ALTER TABLE close_status_events ADD COLUMN IF NOT EXISTS new_status_id TEXT;
CREATE INDEX IF NOT EXISTS idx_cse_newstat ON close_status_events (new_status_id);

-- Rohspiegel der Opportunities (fuer Anlage-Erkennung, Anfangsstatus und Rollenfelder)
CREATE TABLE IF NOT EXISTS close_opportunities (
  id               TEXT PRIMARY KEY,
  org              TEXT NOT NULL DEFAULT 'fach.digital',
  lead_id          TEXT,
  status_id        TEXT,
  status_label     TEXT,
  pipeline_name    TEXT,
  user_id          TEXT,               -- "Assigned to" — laut Prozess der Opener
  user_name        TEXT,
  created_by       TEXT,
  created_by_name  TEXT,
  setter_user_id   TEXT,               -- Custom-Field "Setter" (seit 31.08. Typ user)
  closer_user_id   TEXT,               -- Custom-Field "Closer"
  date_created     TIMESTAMPTZ,
  date_updated     TIMESTAMPTZ,
  synced_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_copp_lead    ON close_opportunities (lead_id);
CREATE INDEX IF NOT EXISTS idx_copp_created ON close_opportunities (date_created);

-- Woher stammt der Termin: aus der Opportunity-Anlage oder aus einem Statuswechsel?
ALTER TABLE termine ADD COLUMN IF NOT EXISTS herkunft TEXT NOT NULL DEFAULT 'wechsel';
ALTER TABLE termine ADD COLUMN IF NOT EXISTS status_id TEXT;
