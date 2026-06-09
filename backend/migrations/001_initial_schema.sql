-- Migration 001: Initial Schema
-- Compatible with SQLite (dev) and PostgreSQL (prod)
-- Switch via DB_DIALECT env var

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  standort TEXT,
  aktiv INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  rolle TEXT NOT NULL CHECK (rolle IN ('KAM', 'NKV-Closer', 'Opener', 'Setter', 'Multi')),
  aktiv INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Neukundendeals
CREATE TABLE IF NOT EXISTS deals_nk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datum TEXT NOT NULL,
  monat TEXT NOT NULL,  -- YYYY-MM
  company_id INTEGER NOT NULL REFERENCES companies(id),
  closer_id INTEGER REFERENCES employees(id),
  opener_id INTEGER REFERENCES employees(id),
  setter_id INTEGER REFERENCES employees(id),
  quelle TEXT NOT NULL CHECK (quelle IN ('Cold Calling', 'Mail', 'Ad', 'Empfehlung', 'Follow Up')),
  kunde TEXT NOT NULL,
  angebotsnummer TEXT,
  dienstleistung TEXT,
  angebotswert REAL,
  laufzeit_monate INTEGER,
  status TEXT NOT NULL DEFAULT 'Offen' CHECK (status IN ('Offen', 'Gewonnen', 'Verloren')),
  ae_wert REAL,
  kommentar TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Bestandskundendeals
CREATE TABLE IF NOT EXISTS deals_bk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datum TEXT NOT NULL,
  monat TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  kam_id INTEGER REFERENCES employees(id),
  kunde TEXT NOT NULL,
  angebotsnummer TEXT,
  dienstleistung TEXT,
  angebotswert REAL,
  laufzeit_monate INTEGER,
  status TEXT NOT NULL DEFAULT 'Offen' CHECK (status IN ('Offen', 'Gewonnen', 'Verloren')),
  ae_wert REAL,
  kommentar TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Verlängerungen
CREATE TABLE IF NOT EXISTS deals_vl (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datum TEXT NOT NULL,
  monat TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  kam_id INTEGER REFERENCES employees(id),
  kunde TEXT NOT NULL,
  dienstleistung TEXT,
  angebotswert REAL,
  ae_wert REAL,
  laufzeit_monate INTEGER,
  status TEXT NOT NULL DEFAULT 'Offen' CHECK (status IN ('Offen', 'Gewonnen', 'Verloren')),
  wie_vielt_verlaengerung INTEGER,
  kommentar TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Monatsziele
CREATE TABLE IF NOT EXISTS targets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  monat TEXT NOT NULL,  -- YYYY-MM
  nk_ziel REAL,
  bk_ziel REAL,
  vl_ziel REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id, monat)
);

-- Indexes für häufige Filter
CREATE INDEX IF NOT EXISTS idx_deals_nk_monat ON deals_nk(monat);
CREATE INDEX IF NOT EXISTS idx_deals_nk_company ON deals_nk(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_closer ON deals_nk(closer_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_status ON deals_nk(status);
CREATE INDEX IF NOT EXISTS idx_deals_bk_monat ON deals_bk(monat);
CREATE INDEX IF NOT EXISTS idx_deals_bk_company ON deals_bk(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_bk_kam ON deals_bk(kam_id);
CREATE INDEX IF NOT EXISTS idx_deals_vl_monat ON deals_vl(monat);
CREATE INDEX IF NOT EXISTS idx_deals_vl_company ON deals_vl(company_id);
