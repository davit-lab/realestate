-- ================================================================
-- Admin Panel v2 Schema Extensions
-- ================================================================

-- 1. Transactions log
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  type        TEXT CHECK (type IN ('refill', 'deduct', 'package_purchase', 'package_refund', 'listing_fee')) DEFAULT 'refill',
  description TEXT NOT NULL DEFAULT '',
  admin_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin read all transactions" ON public.transactions;
DROP POLICY IF EXISTS "admin read all transactions" ON public.transactions;
CREATE POLICY "admin read all transactions" ON public.transactions FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "admin insert transactions" ON public.transactions;
CREATE POLICY "admin insert transactions" ON public.transactions FOR INSERT
  WITH CHECK (public.is_admin());

-- 2. User VIP packages
CREATE TABLE IF NOT EXISTS public.user_packages (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_type       TEXT CHECK (package_type IN ('vip', 'vip_plus', 'super_vip')) NOT NULL,
  listings_remaining INTEGER NOT NULL DEFAULT 0,
  total_listings     INTEGER NOT NULL DEFAULT 0,
  assigned_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin read all user_packages" ON public.user_packages;
DROP POLICY IF EXISTS "admin read all user_packages" ON public.user_packages;
CREATE POLICY "admin read all user_packages" ON public.user_packages FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin write user_packages" ON public.user_packages;
DROP POLICY IF EXISTS "admin write user_packages" ON public.user_packages;
CREATE POLICY "admin write user_packages" ON public.user_packages FOR ALL
  USING (public.is_admin());

-- 3. Support templates
CREATE TABLE IF NOT EXISTS public.support_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general',
  content     TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manage templates" ON public.support_templates;
DROP POLICY IF EXISTS "admin manage templates" ON public.support_templates;
CREATE POLICY "admin manage templates" ON public.support_templates FOR ALL
  USING (public.is_admin());

-- 4. Admin notes on support tickets
CREATE TABLE IF NOT EXISTS public.ticket_admin_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   text REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  admin_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ticket_admin_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin ticket notes" ON public.ticket_admin_notes;
DROP POLICY IF EXISTS "admin ticket notes" ON public.ticket_admin_notes;
CREATE POLICY "admin ticket notes" ON public.ticket_admin_notes FOR ALL
  USING (public.is_admin());

-- 5. Site settings (feature toggles, SEO, announcements)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin site settings" ON public.site_settings;
DROP POLICY IF EXISTS "admin site settings" ON public.site_settings;
CREATE POLICY "admin site settings" ON public.site_settings FOR ALL
  USING (public.is_admin());

-- Insert default settings
INSERT INTO public.site_settings (key, value, description) VALUES
  ('hotels_enabled', 'true', 'სასტუმროების განყოფილება ჩართულია'),
  ('tourism_enabled', 'true', 'ტურიზმის განყოფილება ჩართულია'),
  ('ai_chat_enabled', 'true', 'AI ჩატი ჩართულია'),
  ('map_view_enabled', 'true', 'რუკის ხედი ჩართულია'),
  ('vip_system_enabled', 'true', 'VIP სისტემა ჩართულია'),
  ('default_currency', 'GEL', 'საწყისი ვალუტა'),
  ('default_language', 'ka', 'საწყისი ენა'),
  ('vip_price', '5', 'VIP ფასი GEL-ში'),
  ('vip_plus_price', '10', 'VIP+ ფასი GEL-ში'),
  ('super_vip_price', '25', 'Super VIP ფასი GEL-ში'),
  ('site_title', 'Adjarahome.ge', 'საიტის სათაური'),
  ('meta_description', 'უძრავი ქონება საქართველოში — Adjarahome.ge', 'Meta აღწერა')
ON CONFLICT (key) DO NOTHING;

-- 6. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content    TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT true,
  starts_at  TIMESTAMPTZ,
  ends_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin announcements" ON public.announcements;
DROP POLICY IF EXISTS "admin announcements" ON public.announcements;
CREATE POLICY "admin announcements" ON public.announcements FOR ALL
  USING (public.is_admin());

-- 7. Admin audit log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin audit log" ON public.admin_audit_log;
DROP POLICY IF EXISTS "admin audit log" ON public.admin_audit_log;
CREATE POLICY "admin audit log" ON public.admin_audit_log FOR ALL
  USING (public.is_admin());

-- 8. Admin view for user emails
CREATE OR REPLACE VIEW public.admin_user_emails AS
SELECT au.id, au.email, au.created_at as user_created_at, au.confirmed_at, au.last_sign_in_at
FROM auth.users au
WHERE public.is_admin();

-- 9. Auto-update trigger for support_templates
DROP TRIGGER IF EXISTS update_support_templates_updated_at ON public.support_templates;
CREATE TRIGGER update_support_templates_updated_at
  BEFORE UPDATE ON public.support_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Realtime (safe — skips if already added)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['transactions', 'user_packages', 'support_templates', 'site_settings', 'announcements'];
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
