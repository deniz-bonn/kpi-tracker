CREATE TABLE IF NOT EXISTS upsale_deals (
  id                   SERIAL PRIMARY KEY,
  deals_vl_id          INTEGER NOT NULL REFERENCES deals_vl(id) ON DELETE CASCADE,
  angebotsdatum        DATE,
  angebotsvolumen      NUMERIC(12,2),
  status               TEXT NOT NULL DEFAULT 'Offen',
  angenommenes_volumen NUMERIC(12,2),
  auto_verlaengerung   TEXT,
  laufzeit_monate      INTEGER,
  kommentar            TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
