CREATE INDEX IF NOT EXISTS idx_page_sections_page_sort
  ON page_sections(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at
  ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at
  ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_status_slug
  ON pages(status, slug);
