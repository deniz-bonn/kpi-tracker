CREATE TABLE IF NOT EXISTS inbound_daily (
  id         SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  datum      DATE NOT NULL,
  monat      TEXT NOT NULL,
  inbound_mail INTEGER NOT NULL DEFAULT 0,
  inbound_fax  INTEGER NOT NULL DEFAULT 0,
  inbound_ad   INTEGER NOT NULL DEFAULT 0,
  kommentar  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, datum)
);
