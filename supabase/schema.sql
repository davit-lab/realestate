-- Step 1: Supabase Schema — properties table with Realtime
-- Run this in the Supabase SQL Editor

-- 1. Create the properties table
CREATE TABLE IF NOT EXISTS properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_type   TEXT CHECK (property_type IN ('apartment', 'house', 'commercial', 'land', 'hotel', 'villa')),
  location        TEXT NOT NULL DEFAULT '',
  rooms           INTEGER,
  area_sqm        NUMERIC(10, 2),
  price           NUMERIC(15, 2),
  currency        TEXT CHECK (currency IN ('GEL', 'USD', 'EUR')) DEFAULT 'GEL',
  images          TEXT[] DEFAULT '{}',
  status          TEXT CHECK (status IN ('draft', 'review', 'live', 'archived')) DEFAULT 'draft',
  raw_message     TEXT,
  title           TEXT,
  description     TEXT,
  phone           TEXT,
  floor           INTEGER,
  total_floors    INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Allow anonymous inserts from webhook" ON properties;
CREATE POLICY "Allow anonymous inserts from webhook" ON properties FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all reads" ON properties;
CREATE POLICY "Allow all reads" ON properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated updates" ON properties;
CREATE POLICY "Allow authenticated updates" ON properties FOR UPDATE USING (auth.role() = 'authenticated');

-- 4. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "update_properties_updated_at" ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Realtime for the properties table
BEGIN;
  -- Drop the publication if it exists to avoid conflicts
  DROP PUBLICATION IF EXISTS supabase_realtime;
  -- Recreate the publication
  CREATE PUBLICATION supabase_realtime;
COMMIT;

-- Add the properties table to the realtime publication (safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'properties'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.properties';
  END IF;
END $$;

-- Ensure raw_message column exists (if table was created by another schema first)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS raw_message TEXT;

-- 6. GIN index for full-text search on raw_message (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_properties_raw_message ON properties USING gin(to_tsvector('simple', raw_message));
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
