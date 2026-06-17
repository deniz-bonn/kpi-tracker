-- Update role CHECK constraint to allow superadmin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK(role IN ('admin','superadmin','nk_vertrieb','bk_vertrieb','backoffice'));

-- Feature flags table (feature × role access control)
CREATE TABLE IF NOT EXISTS feature_flags (
  feature TEXT NOT NULL,
  role    TEXT NOT NULL,
  PRIMARY KEY (feature, role)
);
