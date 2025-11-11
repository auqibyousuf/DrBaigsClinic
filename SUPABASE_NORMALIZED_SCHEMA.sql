-- ============================================
-- Normalized CMS Table Structure for Supabase
-- ============================================
-- This provides better scalability, concurrent edit support, and granular control
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Main CMS Sections Table
-- ============================================
-- Stores header, hero, footer, contact sections as JSONB
CREATE TABLE IF NOT EXISTS cms_sections (
  id TEXT PRIMARY KEY,
  section_type TEXT NOT NULL UNIQUE, -- 'header', 'hero', 'footer', 'contact'
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Services Table
-- ============================================
-- Separate table for services (most frequently updated)
CREATE TABLE IF NOT EXISTS cms_services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  duration TEXT,
  price TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Navigation Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS cms_nav_items (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. About Features Table
-- ============================================
CREATE TABLE IF NOT EXISTS cms_about_features (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Footer Links Table
-- ============================================
-- Stores quick links, legal links, service links
CREATE TABLE IF NOT EXISTS cms_footer_links (
  id TEXT PRIMARY KEY,
  link_type TEXT NOT NULL, -- 'quick_link', 'legal_link', 'service_link'
  name TEXT NOT NULL,
  href TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Social Media Links Table
-- ============================================
CREATE TABLE IF NOT EXISTS cms_social_media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cms_sections_type ON cms_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_cms_services_order ON cms_services(display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cms_services_active ON cms_services(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_nav_items_order ON cms_nav_items(display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cms_about_features_order ON cms_about_features(display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cms_footer_links_type ON cms_footer_links(link_type);
CREATE INDEX IF NOT EXISTS idx_cms_footer_links_active ON cms_footer_links(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_social_media_order ON cms_social_media(display_order) WHERE is_active = true;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_nav_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_about_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_social_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations (can be restricted later for multi-user)
CREATE POLICY "Allow all operations on cms_sections"
  ON cms_sections FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on cms_services"
  ON cms_services FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on cms_nav_items"
  ON cms_nav_items FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on cms_about_features"
  ON cms_about_features FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on cms_footer_links"
  ON cms_footer_links FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on cms_social_media"
  ON cms_social_media FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Functions for Auto-updating updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_cms_sections_updated_at
  BEFORE UPDATE ON cms_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_services_updated_at
  BEFORE UPDATE ON cms_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_nav_items_updated_at
  BEFORE UPDATE ON cms_nav_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_about_features_updated_at
  BEFORE UPDATE ON cms_about_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_footer_links_updated_at
  BEFORE UPDATE ON cms_footer_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_social_media_updated_at
  BEFORE UPDATE ON cms_social_media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Migration Helper: Convert from old structure
-- ============================================
-- This function helps migrate data from the old cms_data table
-- Run this AFTER importing your data into the old structure
/*
CREATE OR REPLACE FUNCTION migrate_from_cms_data()
RETURNS void AS $$
DECLARE
  old_data JSONB;
BEGIN
  -- Get data from old table
  SELECT data INTO old_data FROM cms_data WHERE id = 'main';

  IF old_data IS NULL THEN
    RAISE EXCEPTION 'No data found in cms_data table';
  END IF;

  -- Migrate sections
  INSERT INTO cms_sections (id, section_type, data) VALUES
    ('header', 'header', old_data->'header')
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

  INSERT INTO cms_sections (id, section_type, data) VALUES
    ('hero', 'hero', old_data->'hero')
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

  INSERT INTO cms_sections (id, section_type, data) VALUES
    ('footer', 'footer', old_data->'footer')
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

  INSERT INTO cms_sections (id, section_type, data) VALUES
    ('contact', 'contact', old_data->'contact')
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

  -- Migrate services
  INSERT INTO cms_services (id, title, description, image, features, duration, price, display_order)
  SELECT
    (item->>'id')::TEXT,
    item->>'title',
    item->>'description',
    item->>'image',
    COALESCE(item->'features', '[]'::jsonb),
    item->>'duration',
    item->>'price',
    row_number() OVER () - 1
  FROM jsonb_array_elements(old_data->'services'->'items') AS item
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    features = EXCLUDED.features,
    duration = EXCLUDED.duration,
    price = EXCLUDED.price;

  -- Migrate nav items
  INSERT INTO cms_nav_items (id, label, href, icon, display_order)
  SELECT
    (item->>'id')::TEXT,
    item->>'label',
    item->>'href',
    item->>'icon',
    row_number() OVER () - 1
  FROM jsonb_array_elements(old_data->'header'->'navItems') AS item
  ON CONFLICT (id) DO UPDATE SET
    label = EXCLUDED.label,
    href = EXCLUDED.href,
    icon = EXCLUDED.icon;

  -- Migrate about features
  INSERT INTO cms_about_features (id, title, description, icon, display_order)
  SELECT
    (item->>'id')::TEXT,
    item->>'title',
    item->>'description',
    item->>'icon',
    row_number() OVER () - 1
  FROM jsonb_array_elements(old_data->'about'->'features') AS item
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

  -- Migrate footer links
  INSERT INTO cms_footer_links (id, link_type, name, href, display_order)
  SELECT
    'quick_' || row_number() OVER ()::TEXT,
    'quick_link',
    item->>'name',
    item->>'href',
    row_number() OVER () - 1
  FROM jsonb_array_elements(old_data->'footer'->'quickLinks') AS item;

  INSERT INTO cms_footer_links (id, link_type, name, href, display_order)
  SELECT
    'legal_' || row_number() OVER ()::TEXT,
    'legal_link',
    item->>'name',
    item->>'href',
    row_number() OVER () - 1
  FROM jsonb_array_elements(old_data->'footer'->'legalLinks') AS item;

  -- Migrate social media
  INSERT INTO cms_social_media (id, name, url, icon, display_order)
  SELECT
    (item->>'id')::TEXT,
    item->>'name',
    item->>'url',
    COALESCE(item->>'icon', ''),
    row_number() OVER () - 1
  FROM jsonb_array_elements(old_data->'footer'->'socialMedia') AS item
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    url = EXCLUDED.url,
    icon = EXCLUDED.icon;

  RAISE NOTICE 'Migration completed successfully!';
END;
$$ LANGUAGE plpgsql;

-- To run migration:
-- SELECT migrate_from_cms_data();
*/
