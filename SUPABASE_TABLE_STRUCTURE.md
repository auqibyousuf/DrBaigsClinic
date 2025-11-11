# Supabase CMS Table Structure

## Current Setup (Simple - Single JSONB Column)

**Pros:**
- Simple structure
- Easy to implement
- Works well for small sites
- Single query to get all data

**Cons:**
- Entire JSON fetched/updated even for small changes
- No granular permissions per section
- Harder to query specific fields
- Potential conflicts with concurrent edits
- No version history
- Harder to scale

## Recommended Setup (Normalized Tables)

This structure provides better scalability, concurrent edit support, and granular control.

### Table Structure

```sql
-- Main CMS sections table
CREATE TABLE IF NOT EXISTS cms_sections (
  id TEXT PRIMARY KEY,
  section_type TEXT NOT NULL, -- 'header', 'hero', 'services', 'about', 'footer', 'contact'
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table (separate for better management)
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

-- Navigation items table
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

-- About features table
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

-- Footer links (quick links, legal links)
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

-- Social media links
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cms_sections_type ON cms_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_cms_services_order ON cms_services(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_nav_items_order ON cms_nav_items(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_about_features_order ON cms_about_features(display_order);
CREATE INDEX IF NOT EXISTS idx_cms_footer_links_type ON cms_footer_links(link_type);
CREATE INDEX IF NOT EXISTS idx_cms_social_media_order ON cms_social_media(display_order);

-- Enable Row Level Security (RLS)
ALTER TABLE cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_nav_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_about_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_social_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on cms_sections" ON cms_sections FOR ALL USING (true);
CREATE POLICY "Allow all operations on cms_services" ON cms_services FOR ALL USING (true);
CREATE POLICY "Allow all operations on cms_nav_items" ON cms_nav_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on cms_about_features" ON cms_about_features FOR ALL USING (true);
CREATE POLICY "Allow all operations on cms_footer_links" ON cms_footer_links FOR ALL USING (true);
CREATE POLICY "Allow all operations on cms_social_media" ON cms_social_media FOR ALL USING (true);
```

### Migration from Current Structure

If you want to migrate from the current single-table structure to this normalized structure, you can:

1. Keep both structures temporarily
2. Gradually migrate data
3. Update code to use new structure
4. Remove old structure once migration is complete

## Recommendation

**For your use case (single admin, clinic website):**
- **Current JSONB structure is sufficient** if:
  - You have 1-2 admins
  - Updates are infrequent
  - Content size is manageable (< 1MB total)
  - No need for version history

- **Normalized structure is better if:**
  - Multiple admins editing simultaneously
  - Frequent updates
  - Need version history
  - Want granular permissions
  - Planning to scale significantly

## Hybrid Approach (Best of Both)

We can implement a hybrid approach:
- Keep simple JSONB for static sections (header, hero, footer, contact)
- Use normalized tables for dynamic content (services, nav items, features)
- This gives you simplicity where needed and flexibility where it matters

Would you like me to implement the normalized structure or keep the current simple approach?
