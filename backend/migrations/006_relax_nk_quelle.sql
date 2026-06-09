-- Migration 006: Relax quelle constraint on deals_nk
-- Removes NOT NULL and CHECK constraint so Excel import can use null values
-- and additional sources like 'Fax', 'Inbound', etc.

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
  status TEXT NOT NULL DEFAULT 'Offen' CHECK (status IN ('Offen', 'Gewonnen', 'Verloren')),
  ae_wert REAL,
  kommentar TEXT,
  gewonnen_datum TEXT,
  gewonnen_monat TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO deals_nk_new
  SELECT id, datum, monat, company_id, closer_id, opener_id, setter_id,
         quelle, kunde, angebotsnummer, dienstleistung, angebotswert,
         laufzeit_monate, status, ae_wert, kommentar,
         gewonnen_datum, gewonnen_monat, created_at, updated_at
  FROM deals_nk;

DROP TABLE deals_nk;
ALTER TABLE deals_nk_new RENAME TO deals_nk;

CREATE INDEX IF NOT EXISTS idx_deals_nk_monat   ON deals_nk(monat);
CREATE INDEX IF NOT EXISTS idx_deals_nk_company ON deals_nk(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_closer  ON deals_nk(closer_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_status  ON deals_nk(status);

PRAGMA foreign_keys = ON;
