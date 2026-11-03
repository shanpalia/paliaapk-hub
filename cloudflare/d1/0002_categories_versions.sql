-- PaliaAPK Hub Cloudflare D1 schema
-- Safe to run more than once. Existing apps table is preserved.
-- The apps table may already have been created from the initial setup SQL.

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_versions (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  version TEXT NOT NULL,
  apk_url TEXT NOT NULL,
  apk_file_name TEXT DEFAULT '',
  apk_size TEXT DEFAULT '',
  release_notes TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_app_versions_app_id ON app_versions(app_id);

INSERT OR IGNORE INTO categories (id, name, icon_name) VALUES
  ('games', 'Games', 'Gamepad2'),
  ('tools', 'Tools', 'Wrench'),
  ('social', 'Social', 'Users'),
  ('entertainment', 'Entertainment', 'Tv'),
  ('education', 'Education', 'GraduationCap'),
  ('productivity', 'Productivity', 'Briefcase'),
  ('lifestyle', 'Lifestyle', 'Heart'),
  ('design', 'Design', 'Palette'),
  ('general', 'General', 'Grid');
