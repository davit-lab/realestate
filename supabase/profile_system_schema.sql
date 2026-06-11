-- ================================================================
-- Profile System Redesign Schema
-- profile_verifications, payment_cards, profile_views, listing_views, profile_activity
-- ================================================================

-- 1. Profile verifications (ID document upload)
CREATE TABLE IF NOT EXISTS public.profile_verifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type      TEXT NOT NULL DEFAULT 'id_card', -- id_card, passport, license
  front_image_url  TEXT,
  back_image_url   TEXT,
  status        TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  admin_note    TEXT,
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.profile_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own verification read" ON public.profile_verifications;
CREATE POLICY "own verification read"
  ON public.profile_verifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own verification insert" ON public.profile_verifications;
CREATE POLICY "own verification insert"
  ON public.profile_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin review verifications" ON public.profile_verifications;
CREATE POLICY "admin review verifications"
  ON public.profile_verifications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 2. Payment cards (persisted in Supabase, no full numbers)
CREATE TABLE IF NOT EXISTS public.payment_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last4           TEXT NOT NULL,
  brand           TEXT NOT NULL, -- visa, mastercard, amex
  expiry_month    TEXT NOT NULL,
  expiry_year     TEXT NOT NULL,
  cardholder_name TEXT NOT NULL DEFAULT '',
  is_default      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own cards read" ON public.payment_cards;
CREATE POLICY "own cards read"
  ON public.payment_cards FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own cards insert" ON public.payment_cards;
CREATE POLICY "own cards insert"
  ON public.payment_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own cards update" ON public.payment_cards;
CREATE POLICY "own cards update"
  ON public.payment_cards FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own cards delete" ON public.payment_cards;
CREATE POLICY "own cards delete"
  ON public.payment_cards FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Profile views (unique viewer tracking, 24h window via upsert)
CREATE TABLE IF NOT EXISTS public.profile_views (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewed_profile_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip_hash      TEXT,
  viewed_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read profile views" ON public.profile_views;
CREATE POLICY "public read profile views"
  ON public.profile_views FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    OR auth.uid() = viewed_profile_id
  );

DROP POLICY IF EXISTS "public insert profile views" ON public.profile_views;
CREATE POLICY "public insert profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (true);

-- 4. Listing views (unique viewer tracking)
CREATE TABLE IF NOT EXISTS public.listing_views (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewer_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip_hash  TEXT,
  viewed_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read listing views" ON public.listing_views;
CREATE POLICY "public read listing views"
  ON public.listing_views FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    OR auth.uid() IN (
      SELECT user_id FROM public.properties WHERE id = listing_id
    )
  );

DROP POLICY IF EXISTS "public insert listing views" ON public.listing_views;
CREATE POLICY "public insert listing views"
  ON public.listing_views FOR INSERT
  WITH CHECK (true);

-- 5. Profile activity (aggregated daily stats)
CREATE TABLE IF NOT EXISTS public.profile_activity (
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                  DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_views_count   INTEGER DEFAULT 0,
  listings_views_count  INTEGER DEFAULT 0,
  new_messages          INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

ALTER TABLE public.profile_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own activity read" ON public.profile_activity;
CREATE POLICY "own activity read"
  ON public.profile_activity FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin read all activity" ON public.profile_activity;
CREATE POLICY "admin read all activity"
  ON public.profile_activity FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 6. Add columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS total_profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- 7. Helper function: upsert profile view (dedup by 24h window)
CREATE OR REPLACE FUNCTION public.upsert_profile_view(
  p_viewed_profile_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_viewer_ip_hash TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- If viewer_id is provided, dedup by viewer_id (once ever)
  -- If only ip_hash, dedup by ip_hash within 24h
  IF p_viewer_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.profile_views
      WHERE viewed_profile_id = p_viewed_profile_id
        AND viewer_id = p_viewer_id
    ) THEN
      RETURN;
    END IF;
  ELSIF p_viewer_ip_hash IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.profile_views
      WHERE viewed_profile_id = p_viewed_profile_id
        AND viewer_ip_hash = p_viewer_ip_hash
        AND viewed_at > NOW() - INTERVAL '24 hours'
    ) THEN
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.profile_views (viewed_profile_id, viewer_id, viewer_ip_hash)
  VALUES (p_viewed_profile_id, p_viewer_id, p_viewer_ip_hash);

  UPDATE public.profiles
  SET total_profile_views = COALESCE(total_profile_views, 0) + 1
  WHERE id = p_viewed_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Helper function: upsert listing view (dedup by 24h)
CREATE OR REPLACE FUNCTION public.upsert_listing_view(
  p_listing_id TEXT,
  p_viewer_id UUID DEFAULT NULL,
  p_viewer_ip_hash TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  IF p_viewer_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.listing_views
      WHERE listing_id = p_listing_id
        AND viewer_id = p_viewer_id
        AND viewed_at > NOW() - INTERVAL '24 hours'
    ) THEN
      RETURN;
    END IF;
  ELSIF p_viewer_ip_hash IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.listing_views
      WHERE listing_id = p_listing_id
        AND viewer_ip_hash = p_viewer_ip_hash
        AND viewed_at > NOW() - INTERVAL '24 hours'
    ) THEN
      RETURN;
    END IF;
  END IF;

  INSERT INTO public.listing_views (listing_id, viewer_id, viewer_ip_hash)
  VALUES (p_listing_id, p_viewer_id, p_viewer_ip_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Storage bucket for verification docs
INSERT INTO storage.buckets (id, name, public)
  VALUES ('verification-docs', 'verification-docs', false)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "verification doc upload" ON storage.objects;
CREATE POLICY "verification doc upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'verification-docs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "verification doc owner read" ON storage.objects;
CREATE POLICY "verification doc owner read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "verification doc admin read" ON storage.objects;
CREATE POLICY "verification doc admin read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'verification-docs');

-- 10. Realtime
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['profile_verifications', 'payment_cards', 'profile_views', 'listing_views', 'profile_activity'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
