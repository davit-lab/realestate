-- ================================================================
-- Admin Panel Schema Extensions
-- transactions, user_packages, support_templates, admin_notes
-- ================================================================

-- 1. Transactions log (balance refills, deductions, package purchases)
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
CREATE POLICY "admin read all transactions" ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "admin insert transactions" ON public.transactions;
CREATE POLICY "admin insert transactions" ON public.transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 2. User VIP packages (track assigned/remaining listing boosts)
CREATE TABLE IF NOT EXISTS public.user_packages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_type      TEXT CHECK (package_type IN ('vip', 'vip_plus', 'super_vip')) NOT NULL,
  listings_remaining INTEGER NOT NULL DEFAULT 0,
  total_listings    INTEGER NOT NULL DEFAULT 0,
  assigned_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin read all user_packages" ON public.user_packages;
CREATE POLICY "admin read all user_packages" ON public.user_packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "admin insert user_packages" ON public.user_packages;
CREATE POLICY "admin insert user_packages" ON public.user_packages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "admin update user_packages" ON public.user_packages;
CREATE POLICY "admin update user_packages" ON public.user_packages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "admin delete user_packages" ON public.user_packages;
CREATE POLICY "admin delete user_packages" ON public.user_packages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 3. Support templates (pre-written Georgian help responses)
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

DROP POLICY IF EXISTS "admin read support_templates" ON public.support_templates;
CREATE POLICY "admin read support_templates" ON public.support_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "admin write support_templates" ON public.support_templates;
CREATE POLICY "admin write support_templates" ON public.support_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 4. Admin notes on support tickets
CREATE TABLE IF NOT EXISTS public.ticket_admin_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   text REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  admin_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ticket_admin_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin read ticket notes" ON public.ticket_admin_notes;
CREATE POLICY "admin read ticket notes" ON public.ticket_admin_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "admin write ticket notes" ON public.ticket_admin_notes;
CREATE POLICY "admin write ticket notes" ON public.ticket_admin_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 5. Auto-update updated_at on support_templates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_support_templates_updated_at ON public.support_templates;
CREATE TRIGGER update_support_templates_updated_at
  BEFORE UPDATE ON public.support_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable admin to read auth.users emails via a secure view
CREATE OR REPLACE VIEW public.admin_user_emails AS
SELECT 
  au.id,
  au.email,
  au.created_at as user_created_at,
  au.confirmed_at,
  au.last_sign_in_at
FROM auth.users au
WHERE EXISTS (
  SELECT 1 FROM public.profiles
  WHERE id = auth.uid() AND is_admin = true
);

-- 7. Add realtime for transactions and user_packages
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_packages;
