-- Migration 100 (SQLite): Fundament fuer die Close-Show-Rates (Opener/Setter).
-- Datenquelle sind die Status-Historien aus Close (/activity/status_change/opportunity/ und /lead/),
-- NICHT Custom Activities (siehe docs/close-discovery.md, Revision 2).
--
-- Dreischichtig, damit spaete Aenderungen in Close nicht verloren gehen:
--   close_status_events  = Rohdaten, append-only, idempotent ueber die Close-Event-ID
--   termine              = daraus abgeleitet (jederzeit neu berechenbar, kein Datenverlust)
--   close_user_map       = Close-User -> employee (Auto-Vorschlag via users.email, manuell pflegbar)

CREATE TABLE IF NOT EXISTS close_status_events (
  id                TEXT PRIMARY KEY,              -- Close-Activity-ID des Statuswechsels
  typ               TEXT NOT NULL,                 -- 'opportunity' | 'lead'
  org               TEXT NOT NULL DEFAULT 'fach.digital',
  lead_id           TEXT,
  opportunity_id    TEXT,
  old_status_label  TEXT,
  new_status_label  TEXT,
  new_status_type   TEXT,                          -- active | won | lost
  pipeline_name     TEXT,
  close_user_id     TEXT,
  close_user_name   TEXT,
  date_created      TEXT NOT NULL,
  synced_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cse_typ_date ON close_status_events (typ, date_created);
CREATE INDEX IF NOT EXISTS idx_cse_opp      ON close_status_events (opportunity_id);
CREATE INDEX IF NOT EXISTS idx_cse_lead     ON close_status_events (lead_id);

CREATE TABLE IF NOT EXISTS close_user_map (
  close_user_id   TEXT PRIMARY KEY,
  close_name      TEXT,
  close_email     TEXT,
  employee_id     INTEGER REFERENCES employees(id),
  ignorieren      INTEGER NOT NULL DEFAULT 0,  -- Sammel-/Systemkonten (Cold Mail, Probe Arbeiten…)
  auto_zugeordnet INTEGER NOT NULL DEFAULT 0,  -- via users.email automatisch vorgeschlagen
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS termine (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  close_event_id        TEXT NOT NULL UNIQUE,      -- das "gelegt"-Event -> Idempotenz der Ableitung
  close_opportunity_id  TEXT,
  close_lead_id         TEXT,
  org                   TEXT NOT NULL DEFAULT 'fach.digital',
  art                   TEXT NOT NULL CHECK (art IN ('setting','closing')),
  gelegt_am             DATE NOT NULL,
  monat                 TEXT NOT NULL,             -- YYYY-MM des gelegt-Zeitpunkts
  close_user_id         TEXT,
  gelegt_von_name       TEXT,
  employee_id           INTEGER REFERENCES employees(id),
  -- stattgefunden / nicht_stattgefunden zaehlen in die Show-Rate; offen + unklar NICHT.
  status                TEXT NOT NULL CHECK (status IN ('stattgefunden','nicht_stattgefunden','offen','unklar')),
  ausgang_status        TEXT,                      -- Close-Folgestatus, der die Wertung ausgeloest hat
  ausgang_am            DATE,
  quelle                TEXT,                      -- MailMarketing | FAX Leads | Post (aus dem Lead-Status)
  berechnet_am          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_termine_monat_art ON termine (monat, art);
CREATE INDEX IF NOT EXISTS idx_termine_emp       ON termine (employee_id);
CREATE INDEX IF NOT EXISTS idx_termine_opp       ON termine (close_opportunity_id);
