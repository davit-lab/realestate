-- ================================================================
-- Support tickets table
-- ================================================================
create table if not exists public.support_tickets (
  id              text primary key default gen_random_uuid()::text,
  user_id         uuid references auth.users(id) on delete set null,
  subject         text not null,
  message         text not null,
  status          text default 'open', -- open, in_progress, resolved, closed
  priority        text default 'normal', -- low, normal, high, urgent
  admin_response  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.support_tickets enable row level security;

drop policy if exists "auth read own tickets" on public.support_tickets;
DROP POLICY IF EXISTS "auth read own tickets" ON public.support_tickets;
CREATE POLICY "auth read own tickets" ON public.support_tickets FOR select
  using (auth.uid() = user_id);

drop policy if exists "admin read all tickets" on public.support_tickets;
DROP POLICY IF EXISTS "admin read all tickets" ON public.support_tickets;
CREATE POLICY "admin read all tickets" ON public.support_tickets FOR select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

drop policy if exists "auth insert tickets" on public.support_tickets;
DROP POLICY IF EXISTS "auth insert tickets" ON public.support_tickets;
CREATE POLICY "auth insert tickets" ON public.support_tickets FOR insert
  with check (auth.role() = 'authenticated');

drop policy if exists "admin update tickets" on public.support_tickets;
DROP POLICY IF EXISTS "admin update tickets" ON public.support_tickets;
CREATE POLICY "admin update tickets" ON public.support_tickets FOR update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

drop policy if exists "admin delete tickets" on public.support_tickets;
DROP POLICY IF EXISTS "admin delete tickets" ON public.support_tickets;
CREATE POLICY "admin delete tickets" ON public.support_tickets FOR delete
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ================================================================
-- Profiles table
-- ================================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  name            text,
  avatar_url      text,
  phone           text,
  is_admin        boolean default false,
  is_agent        boolean default false,
  balance         numeric default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "public read profiles" on public.profiles;
DROP POLICY IF EXISTS "public read profiles" ON public.profiles;
CREATE POLICY "public read profiles" ON public.profiles FOR select
  using (true);

drop policy if exists "auth insert own profile" on public.profiles;
DROP POLICY IF EXISTS "auth insert own profile" ON public.profiles;
CREATE POLICY "auth insert own profile" ON public.profiles FOR insert
  with check (auth.uid() = id);

drop policy if exists "auth update own profile" on public.profiles;
DROP POLICY IF EXISTS "auth update own profile" ON public.profiles;
CREATE POLICY "auth update own profile" ON public.profiles FOR update
  using (auth.uid() = id);

drop policy if exists "admin all profiles" on public.profiles;
DROP POLICY IF EXISTS "admin all profiles" ON public.profiles;
CREATE POLICY "admin all profiles" ON public.profiles FOR all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- ================================================================
-- Comments table
-- ================================================================
create table if not exists public.comments (
  id              text primary key default gen_random_uuid()::text,
  property_id     text not null references public.properties(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,
  author_name     text not null,
  author_avatar   text,
  text            text not null,
  created_at      timestamptz default now()
);

alter table public.comments enable row level security;

drop policy if exists "public read comments" on public.comments;
DROP POLICY IF EXISTS "public read comments" ON public.comments;
CREATE POLICY "public read comments" ON public.comments FOR select
  using (true);

drop policy if exists "auth insert comments" on public.comments;
DROP POLICY IF EXISTS "auth insert comments" ON public.comments;
CREATE POLICY "auth insert comments" ON public.comments FOR insert
  with check (auth.role() = 'authenticated');

drop policy if exists "own update comments" on public.comments;
DROP POLICY IF EXISTS "own update comments" ON public.comments;
CREATE POLICY "own update comments" ON public.comments FOR update
  using (auth.uid() = user_id);

drop policy if exists "own delete comments" on public.comments;
DROP POLICY IF EXISTS "own delete comments" ON public.comments;
CREATE POLICY "own delete comments" ON public.comments FOR delete
  using (auth.uid() = user_id);

-- ================================================================
-- Properties table
-- ================================================================
create table if not exists public.properties (
  id              text primary key default gen_random_uuid()::text,
  user_id         uuid references auth.users(id) on delete set null,
  title           text not null,
  deal_type       text not null default 'sale',
  property_type   text not null default 'apartment',
  location        text,
  city            text,
  district        text,
  rooms           integer,
  area_sqm        numeric,
  price           numeric,
  currency        text default 'GEL',
  description     text,
  phone           text,
  floor           integer,
  total_floors    integer,
  lat             numeric,
  lng             numeric,
  images          text[] default '{}',
  status          text default 'live',
  vip_status      text default 'standard',
  author_name     text,
  author_avatar   text,
  raw_message     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.properties enable row level security;

drop policy if exists "public read properties" on public.properties;
DROP POLICY IF EXISTS "public read properties" ON public.properties;
CREATE POLICY "public read properties" ON public.properties FOR select
  using (status = 'live');

drop policy if exists "auth insert properties" on public.properties;
DROP POLICY IF EXISTS "auth insert properties" ON public.properties;
CREATE POLICY "auth insert properties" ON public.properties FOR insert
  with check (auth.uid() = user_id);

drop policy if exists "own update properties" on public.properties;
DROP POLICY IF EXISTS "own update properties" ON public.properties;
CREATE POLICY "own update properties" ON public.properties FOR update
  using (auth.uid() = user_id);

drop policy if exists "own delete properties" on public.properties;
DROP POLICY IF EXISTS "own delete properties" ON public.properties;
CREATE POLICY "own delete properties" ON public.properties FOR delete
  using (auth.uid() = user_id);

drop policy if exists "admin all properties" on public.properties;
DROP POLICY IF EXISTS "admin all properties" ON public.properties;
CREATE POLICY "admin all properties" ON public.properties FOR all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "update_properties_updated_at" ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- GIN index for full-text search on raw_message
CREATE INDEX IF NOT EXISTS idx_properties_raw_message ON public.properties USING gin(to_tsvector('simple', raw_message));
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

-- Realtime publication (safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'properties'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.properties';
  END IF;
END $$;

-- ================================================================
-- Storage buckets
-- ================================================================
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('property-images', 'property-images', true)
  on conflict (id) do nothing;

-- Avatar policies
drop policy if exists "avatar upload" on storage.objects;
DROP POLICY IF EXISTS "avatar upload" ON storage.objects;
CREATE POLICY "avatar upload" ON storage.objects FOR insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "avatar public read" on storage.objects;
DROP POLICY IF EXISTS "avatar public read" ON storage.objects;
CREATE POLICY "avatar public read" ON storage.objects FOR select
  using (bucket_id = 'avatars');

drop policy if exists "avatar owner delete" on storage.objects;
DROP POLICY IF EXISTS "avatar owner delete" ON storage.objects;
CREATE POLICY "avatar owner delete" ON storage.objects FOR delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Property image policies
drop policy if exists "property image upload" on storage.objects;
DROP POLICY IF EXISTS "property image upload" ON storage.objects;
CREATE POLICY "property image upload" ON storage.objects FOR insert
  with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

drop policy if exists "property image public read" on storage.objects;
DROP POLICY IF EXISTS "property image public read" ON storage.objects;
CREATE POLICY "property image public read" ON storage.objects FOR select
  using (bucket_id = 'property-images');

drop policy if exists "property image owner delete" on storage.objects;
DROP POLICY IF EXISTS "property image owner delete" ON storage.objects;
CREATE POLICY "property image owner delete" ON storage.objects FOR delete
  using (bucket_id = 'property-images' and auth.uid()::text = (storage.foldername(name))[1]);
