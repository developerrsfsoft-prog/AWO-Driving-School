ALTER TABLE faqs ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE testimonials ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE service_areas ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE pricing_plans ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE enquiries ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE navigation_items ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE media ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE contact_messages ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';

UPDATE faqs SET updated_at = created_at WHERE updated_at = '';
UPDATE testimonials SET updated_at = created_at WHERE updated_at = '';
UPDATE service_areas SET updated_at = created_at WHERE updated_at = '';
UPDATE pricing_plans SET updated_at = created_at WHERE updated_at = '';
UPDATE bookings SET updated_at = created_at WHERE updated_at = '';
UPDATE enquiries SET updated_at = created_at WHERE updated_at = '';
UPDATE navigation_items SET updated_at = CURRENT_TIMESTAMP WHERE updated_at = '';
UPDATE media SET updated_at = created_at WHERE updated_at = '';
UPDATE contact_messages SET updated_at = created_at WHERE updated_at = '';

CREATE TRIGGER IF NOT EXISTS trg_faqs_updated_at
AFTER INSERT ON faqs WHEN NEW.updated_at = ''
BEGIN
  UPDATE faqs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS trg_testimonials_updated_at
AFTER INSERT ON testimonials WHEN NEW.updated_at = ''
BEGIN
  UPDATE testimonials SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS trg_areas_updated_at
AFTER INSERT ON service_areas WHEN NEW.updated_at = ''
BEGIN
  UPDATE service_areas SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS trg_pricing_updated_at
AFTER INSERT ON pricing_plans WHEN NEW.updated_at = ''
BEGIN
  UPDATE pricing_plans SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS trg_bookings_updated_at
AFTER INSERT ON bookings WHEN NEW.updated_at = ''
BEGIN
  UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS trg_enquiries_updated_at
AFTER INSERT ON enquiries WHEN NEW.updated_at = ''
BEGIN
  UPDATE enquiries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS trg_navigation_updated_at
AFTER INSERT ON navigation_items WHEN NEW.updated_at = ''
BEGIN
  UPDATE navigation_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS trg_media_updated_at
AFTER INSERT ON media WHEN NEW.updated_at = ''
BEGIN
  UPDATE media SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS trg_contact_messages_updated_at
AFTER INSERT ON contact_messages WHEN NEW.updated_at = ''
BEGIN
  UPDATE contact_messages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
