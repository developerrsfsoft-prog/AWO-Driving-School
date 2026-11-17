ALTER TABLE media ADD COLUMN original_name TEXT;
ALTER TABLE media ADD COLUMN mime_type TEXT;
ALTER TABLE media ADD COLUMN file_size INTEGER;
ALTER TABLE media ADD COLUMN width INTEGER;
ALTER TABLE media ADD COLUMN height INTEGER;
ALTER TABLE media ADD COLUMN folder TEXT;

UPDATE media SET original_name = filename WHERE original_name IS NULL;
UPDATE media SET mime_type = '' WHERE mime_type IS NULL;
UPDATE media SET file_size = 0 WHERE file_size IS NULL;
UPDATE media SET folder = '' WHERE folder IS NULL;

CREATE TABLE IF NOT EXISTS gallery_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS navigation_items_cms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  parent_id INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(parent_id) REFERENCES navigation_items_cms(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_media_filename ON media(filename);
CREATE INDEX IF NOT EXISTS idx_gallery_sort ON gallery_items(sort_order, id);
