-- Migration 019: Tägliches Activity-Tracking für Opener/Setter/Closer

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  company_id  INTEGER NOT NULL REFERENCES companies(id),
  datum DATE NOT NULL,
  monat TEXT NOT NULL,

  entscheider_erreicht    INTEGER NOT NULL DEFAULT 0,
  entscheider_terminiert  INTEGER NOT NULL DEFAULT 0,
  terminiert_cold_calls   INTEGER NOT NULL DEFAULT 0,
  terminiert_inbound      INTEGER NOT NULL DEFAULT 0,

  settings_geplant          INTEGER NOT NULL DEFAULT 0,
  settings_stattgefunden    INTEGER NOT NULL DEFAULT 0,
  setting_abgesagt          INTEGER NOT NULL DEFAULT 0,
  setting_verschoben        INTEGER NOT NULL DEFAULT 0,
  nicht_erreicht            INTEGER NOT NULL DEFAULT 0,
  unqualifiziert            INTEGER NOT NULL DEFAULT 0,
  follow_up                 INTEGER NOT NULL DEFAULT 0,
  beratung_vereinbart       INTEGER NOT NULL DEFAULT 0,

  beratungen_geplant        INTEGER NOT NULL DEFAULT 0,
  beratungen_stattgefunden  INTEGER NOT NULL DEFAULT 0,
  beratungen_verschoben     INTEGER NOT NULL DEFAULT 0,
  beratungen_no_show        INTEGER NOT NULL DEFAULT 0,
  beratungen_follow_up_cc2  INTEGER NOT NULL DEFAULT 0,
  beratungen_kein_close     INTEGER NOT NULL DEFAULT 0,

  inbound_mail INTEGER NOT NULL DEFAULT 0,
  inbound_fax  INTEGER NOT NULL DEFAULT 0,
  inbound_ad   INTEGER NOT NULL DEFAULT 0,

  kommentar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, datum)
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_emp   ON activity_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_datum ON activity_logs(datum);
CREATE INDEX IF NOT EXISTS idx_activity_logs_monat ON activity_logs(monat);
