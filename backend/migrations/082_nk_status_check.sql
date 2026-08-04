-- Migration 082: deals_nk.status erlaubt wieder "In Verhandlung" und "In Closing Call 2" (SQLite)
--
-- Warum das noetig ist: siehe 082_nk_status_check.pg.sql. Kurzform --
--   004_standort_status.sql hatte den CHECK auf 5 Werte erweitert,
--   006_relax_nk_quelle.sql legte deals_nk danach erneut an und uebernahm dabei
--   wieder den alten 3-Werte-CHECK. Damit war die Erweiterung verloren.
--
-- SQLite kann CHECK-Constraints nicht per ALTER aendern, die Tabelle muss neu
-- angelegt werden. Spaltenliste ist der Stand nach allen Migrationen bis 081
-- (23 Spalten, inkl. automatische_verlaengerung / abgerechnet / kundennummer).
PRAGMA foreign_keys = OFF;

CREATE TABLE deals_nk_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datum TEXT NOT NULL,
  monat TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  closer_id INTEGER REFERENCES employees(id),
  opener_id INTEGER REFERENCES employees(id),
  setter_id INTEGER REFERENCES employees(id),
  quelle TEXT,
  kunde TEXT NOT NULL,
  angebotsnummer TEXT,
  dienstleistung TEXT,
  angebotswert REAL,
  laufzeit_monate REAL,
  status TEXT NOT NULL DEFAULT 'Offen' CHECK (status IN ('Offen', 'Gewonnen', 'Verloren', 'In Verhandlung', 'In Closing Call 2')),
  ae_wert REAL,
  kommentar TEXT,
  gewonnen_datum TEXT,
  gewonnen_monat TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  automatische_verlaengerung TEXT,
  abgerechnet TEXT,
  kundennummer TEXT
);

INSERT INTO deals_nk_new
  SELECT id, datum, monat, company_id, closer_id, opener_id, setter_id,
         quelle, kunde, angebotsnummer, dienstleistung, angebotswert,
         laufzeit_monate, status, ae_wert, kommentar,
         gewonnen_datum, gewonnen_monat, created_at, updated_at,
         automatische_verlaengerung, abgerechnet, kundennummer
  FROM deals_nk;

DROP TABLE deals_nk;
ALTER TABLE deals_nk_new RENAME TO deals_nk;

CREATE INDEX IF NOT EXISTS idx_deals_nk_monat   ON deals_nk(monat);
CREATE INDEX IF NOT EXISTS idx_deals_nk_company ON deals_nk(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_closer  ON deals_nk(closer_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_status  ON deals_nk(status);

PRAGMA foreign_keys = ON;
