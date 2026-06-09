-- Migration 001: Complete Initial Schema (PostgreSQL)
-- Full schema with all current columns. No triggers - updated_at managed by application.

CREATE TABLE IF NOT EXISTS companies (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  standort   TEXT,
  aktiv      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  rolle      TEXT NOT NULL CHECK (rolle IN ('KAM', 'NKV-Closer', 'Opener', 'Setter', 'Multi')),
  aktiv      BOOLEAN NOT NULL DEFAULT TRUE,
  standort   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals_nk (
  id               SERIAL PRIMARY KEY,
  datum            DATE NOT NULL,
  monat            CHAR(7) NOT NULL,
  company_id       INTEGER NOT NULL REFERENCES companies(id),
  closer_id        INTEGER REFERENCES employees(id),
  opener_id        INTEGER REFERENCES employees(id),
  setter_id        INTEGER REFERENCES employees(id),
  quelle           TEXT,
  kunde            TEXT NOT NULL,
  angebotsnummer   TEXT,
  dienstleistung   TEXT,
  angebotswert     NUMERIC(12,2),
  laufzeit_monate  NUMERIC(12,2),
  status           TEXT NOT NULL DEFAULT 'Offen' CHECK (status IN ('Offen', 'Gewonnen', 'Verloren')),
  ae_wert          NUMERIC(12,2),
  kommentar        TEXT,
  gewonnen_datum   DATE,
  gewonnen_monat   CHAR(7),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals_bk (
  id               SERIAL PRIMARY KEY,
  datum            DATE NOT NULL,
  monat            CHAR(7) NOT NULL,
  company_id       INTEGER NOT NULL REFERENCES companies(id),
  kam_id           INTEGER REFERENCES employees(id),
  kunde            TEXT NOT NULL,
  angebotsnummer   TEXT,
  dienstleistung   TEXT,
  angebotswert     NUMERIC(12,2),
  laufzeit_monate  NUMERIC(12,2),
  status           TEXT NOT NULL DEFAULT 'Offen' CHECK (status IN ('Offen', 'Gewonnen', 'Verloren')),
  ae_wert          NUMERIC(12,2),
  kommentar        TEXT,
  gewonnen_datum   DATE,
  gewonnen_monat   CHAR(7),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals_vl (
  id                      SERIAL PRIMARY KEY,
  datum                   DATE NOT NULL,
  monat                   CHAR(7) NOT NULL,
  company_id              INTEGER NOT NULL REFERENCES companies(id),
  kam_id                  INTEGER REFERENCES employees(id),
  kunde                   TEXT NOT NULL,
  dienstleistung          TEXT,
  angebotswert            NUMERIC(12,2),
  ae_wert                 NUMERIC(12,2),
  laufzeit_monate         NUMERIC(12,2),
  status                  TEXT NOT NULL DEFAULT 'Offen' CHECK (status IN ('Offen', 'Gewonnen', 'Verloren')),
  wie_vielt_verlaengerung INTEGER,
  kommentar               TEXT,
  gewonnen_datum          DATE,
  gewonnen_monat          CHAR(7),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS targets (
  id         SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  monat      CHAR(7) NOT NULL,
  nk_ziel    NUMERIC(12,2),
  bk_ziel    NUMERIC(12,2),
  vl_ziel    NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, monat)
);

CREATE INDEX IF NOT EXISTS idx_deals_nk_monat          ON deals_nk(monat);
CREATE INDEX IF NOT EXISTS idx_deals_nk_company        ON deals_nk(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_closer         ON deals_nk(closer_id);
CREATE INDEX IF NOT EXISTS idx_deals_nk_status         ON deals_nk(status);
CREATE INDEX IF NOT EXISTS idx_deals_nk_gewonnen_monat ON deals_nk(gewonnen_monat);
CREATE INDEX IF NOT EXISTS idx_deals_bk_monat          ON deals_bk(monat);
CREATE INDEX IF NOT EXISTS idx_deals_bk_company        ON deals_bk(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_bk_kam            ON deals_bk(kam_id);
CREATE INDEX IF NOT EXISTS idx_deals_bk_gewonnen_monat ON deals_bk(gewonnen_monat);
CREATE INDEX IF NOT EXISTS idx_deals_vl_monat          ON deals_vl(monat);
CREATE INDEX IF NOT EXISTS idx_deals_vl_company        ON deals_vl(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_vl_gewonnen_monat ON deals_vl(gewonnen_monat)
