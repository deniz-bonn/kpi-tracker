-- Migration 112: Terminstatus 'verschoben' zulassen — SQLite
--
-- Fachlich identisch zur .pg.sql. Dialekt-Unterschied: SQLite kann einen CHECK nicht per ALTER
-- aendern — die Tabelle muss neu gebaut werden. Reihenfolge: neue Tabelle, Daten uebernehmen,
-- alte weg, umbenennen, Indizes neu. Der UNIQUE auf close_event_id traegt die Idempotenz der
-- Ableitung und muss deshalb erhalten bleiben.
--
-- Quote und Gate rechnen ab jetzt auf verschiedenen Mengen:
--   Quote = stattgefunden / (stattgefunden + nicht_stattgefunden)     -- verschoben faellt raus
--   Gate  = (stattgefunden + nicht_stattgefunden + verschoben) / gelegt
CREATE TABLE termine_neu (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  close_event_id        TEXT NOT NULL UNIQUE,
  close_opportunity_id  TEXT,
  close_lead_id         TEXT,
  org                   TEXT NOT NULL DEFAULT 'fach.digital',
  art                   TEXT NOT NULL CHECK (art IN ('setting','closing')),
  gelegt_am             DATE NOT NULL,
  monat                 TEXT NOT NULL,
  close_user_id         TEXT,
  gelegt_von_name       TEXT,
  employee_id           INTEGER REFERENCES employees(id),
  status                TEXT NOT NULL CHECK (status IN ('stattgefunden','nicht_stattgefunden','offen','unklar','verschoben')),
  ausgang_status        TEXT,
  ausgang_am            DATE,
  quelle                TEXT,
  berechnet_am          TEXT,
  herkunft              TEXT NOT NULL DEFAULT 'wechsel',
  status_id             TEXT
);
INSERT INTO termine_neu (id, close_event_id, close_opportunity_id, close_lead_id, org, art,
  gelegt_am, monat, close_user_id, gelegt_von_name, employee_id, status, ausgang_status,
  ausgang_am, quelle, berechnet_am, herkunft, status_id)
SELECT id, close_event_id, close_opportunity_id, close_lead_id, org, art,
  gelegt_am, monat, close_user_id, gelegt_von_name, employee_id, status, ausgang_status,
  ausgang_am, quelle, berechnet_am, herkunft, status_id
FROM termine;
DROP TABLE termine;
ALTER TABLE termine_neu RENAME TO termine;
-- Die drei Original-Indizes aus Migration 100 unter ihren ORIGINAL-Namen wiederherstellen.
-- Ein Table-Rebuild nimmt Indizes mit ins Grab; wer sie vergisst oder umbenennt, verliert sie
-- stillschweigend — auffallen wuerde es erst als langsame Abfrage.
CREATE INDEX IF NOT EXISTS idx_termine_monat_art ON termine (monat, art);
CREATE INDEX IF NOT EXISTS idx_termine_emp       ON termine (employee_id);
CREATE INDEX IF NOT EXISTS idx_termine_opp       ON termine (close_opportunity_id);

-- Der eingefrorene Monatswert muss die verschobenen Termine MITFUEHREN, sonst waere ein Freeze
-- nach der Umstellung nicht mehr nachrechenbar: das Gate braucht sie, die Quote nicht.
-- incentive_monatswerte ist derzeit leer (erster Freeze am 05.10.), der Default 0 ist also
-- nur die Absicherung fuer den Fall, dass doch schon eingefroren wurde.
ALTER TABLE incentive_monatswerte ADD COLUMN sr_verschoben INTEGER NOT NULL DEFAULT 0;
