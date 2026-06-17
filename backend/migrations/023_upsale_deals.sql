CREATE TABLE IF NOT EXISTS upsale_deals (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  deals_vl_id          INTEGER NOT NULL REFERENCES deals_vl(id) ON DELETE CASCADE,
  angebotsdatum        TEXT,
  angebotsvolumen      REAL,
  status               TEXT NOT NULL DEFAULT 'Offen',
  angenommenes_volumen REAL,
  auto_verlaengerung   TEXT,
  laufzeit_monate      INTEGER,
  kommentar            TEXT,
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);
