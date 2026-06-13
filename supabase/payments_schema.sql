-- ================================================================
-- Payment Providers Schema
-- ================================================================

-- Helper: auto-update updated_at (safe to re-define)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.payment_providers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_type TEXT CHECK (provider_type IN ('bog_ipay', 'flitt', 'tbc_opay', 'other')) NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  is_active     BOOLEAN DEFAULT false,
  callback_url  TEXT NOT NULL DEFAULT '',
  client_id     TEXT NOT NULL DEFAULT '',
  merchant_id   TEXT NOT NULL DEFAULT '',
  secret_key    TEXT NOT NULL DEFAULT '',
  terminal_id   TEXT NOT NULL DEFAULT '',
  extra_config  JSONB DEFAULT '{}',
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin read payment_providers" ON public.payment_providers;
CREATE POLICY "admin read payment_providers" ON public.payment_providers FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin write payment_providers" ON public.payment_providers;
CREATE POLICY "admin write payment_providers" ON public.payment_providers FOR ALL
  USING (public.is_admin());

-- Make provider_type unique so ON CONFLICT works and rows don't duplicate
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_providers_provider_type_unique'
  ) THEN
    ALTER TABLE public.payment_providers ADD CONSTRAINT payment_providers_provider_type_unique UNIQUE (provider_type);
  END IF;
END $$;

-- Default providers (inserted manually by admin or seeded)
INSERT INTO public.payment_providers (provider_type, name, description, is_active)
VALUES
  ('bog_ipay', 'საქართველოს ბანკი (BOG iPay)', 'საბანკო გადახდა', false),
  ('flitt', 'Flitt (საბანკო გადახდა)', 'საბანკო გადახდა', false),
  ('tbc_opay', 'ოპინი ბანკი (TBC E-Commerce)', 'ონლაინ გადახდები', false)
ON CONFLICT (provider_type) DO NOTHING;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_payment_providers_updated_at ON public.payment_providers;
CREATE TRIGGER update_payment_providers_updated_at
  BEFORE UPDATE ON public.payment_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payment_providers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_providers;
  END IF;
END $$;
