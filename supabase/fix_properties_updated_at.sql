-- Fix: properties table missing updated_at column causes
-- "record 'new' has no field 'updated_at'" on every UPDATE.
-- Run this in Supabase SQL Editor.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'properties'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.properties ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added updated_at column to public.properties';
  ELSE
    RAISE NOTICE 'updated_at already exists on public.properties';
  END IF;
END $$;

-- Re-create the trigger safely (in case it was created before the column existed)
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
