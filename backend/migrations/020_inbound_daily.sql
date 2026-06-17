CREATE TABLE IF NOT EXISTS inbound_daily (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  datum      TEXT NOT NULL,
  monat      TEXT NOT NULL,
  inbound_mail INTEGER NOT NULL DEFAULT 0,
  inbound_fax  INTEGER NOT NULL DEFAULT 0,
  inbound_ad   INTEGER NOT NULL DEFAULT 0,
  kommentar  TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(company_id, datum)
);
