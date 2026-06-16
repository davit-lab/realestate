-- ================================================================
-- Services Schema: Hotels + Tourism Items
-- ================================================================

-- Hotels table
CREATE TABLE IF NOT EXISTS public.hotels (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  stars         INTEGER DEFAULT 0,
  rating        NUMERIC(3,1) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  price_per_night INTEGER DEFAULT 0,
  city          TEXT NOT NULL DEFAULT '',
  district      TEXT NOT NULL DEFAULT '',
  image         TEXT NOT NULL DEFAULT '',
  images        JSONB DEFAULT '[]',
  amenities     JSONB DEFAULT '[]',
  description   TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  tags          JSONB DEFAULT '[]',
  featured      BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read hotels" ON public.hotels;
CREATE POLICY "public read hotels"
  ON public.hotels FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin manage hotels" ON public.hotels;
CREATE POLICY "admin manage hotels"
  ON public.hotels FOR ALL
  USING (public.is_admin());

-- Tourism items table
CREATE TABLE IF NOT EXISTS public.tourism_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      TEXT NOT NULL DEFAULT 'attractions',
  title         TEXT NOT NULL,
  subtitle      TEXT NOT NULL DEFAULT '',
  image         TEXT NOT NULL DEFAULT '',
  city          TEXT NOT NULL DEFAULT '',
  price         INTEGER DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT '₾',
  rating        NUMERIC(3,1) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  date_info     TEXT DEFAULT '',
  time_info     TEXT DEFAULT '',
  duration      TEXT DEFAULT '',
  tags          JSONB DEFAULT '[]',
  featured      BOOLEAN DEFAULT false,
  badge         TEXT DEFAULT '',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tourism_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read tourism_items" ON public.tourism_items;
CREATE POLICY "public read tourism_items"
  ON public.tourism_items FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "admin manage tourism_items" ON public.tourism_items;
CREATE POLICY "admin manage tourism_items"
  ON public.tourism_items FOR ALL
  USING (public.is_admin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hotels_city ON public.hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_featured ON public.hotels(featured);
CREATE INDEX IF NOT EXISTS idx_hotels_is_active ON public.hotels(is_active);
CREATE INDEX IF NOT EXISTS idx_tourism_category ON public.tourism_items(category);
CREATE INDEX IF NOT EXISTS idx_tourism_city ON public.tourism_items(city);
CREATE INDEX IF NOT EXISTS idx_tourism_featured ON public.tourism_items(featured);
CREATE INDEX IF NOT EXISTS idx_tourism_is_active ON public.tourism_items(is_active);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_hotels_updated_at ON public.hotels;
CREATE TRIGGER update_hotels_updated_at
  BEFORE UPDATE ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tourism_items_updated_at ON public.tourism_items;
CREATE TRIGGER update_tourism_items_updated_at
  BEFORE UPDATE ON public.tourism_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'hotels'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hotels;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tourism_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tourism_items;
  END IF;
END $$;
