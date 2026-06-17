CREATE TABLE IF NOT EXISTS feature_flags (
  feature TEXT NOT NULL,
  role    TEXT NOT NULL,
  PRIMARY KEY (feature, role)
);
