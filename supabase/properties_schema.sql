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

create policy "auth read own tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

create policy "admin read all tickets"
  on public.support_tickets for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "auth insert tickets"
  on public.support_tickets for insert
  with check (auth.role() = 'authenticated');

create policy "admin update tickets"
  on public.support_tickets for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "admin delete tickets"
  on public.support_tickets for delete
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

create policy "public read profiles"
  on public.profiles for select
  using (true);

create policy "auth insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "auth update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "admin all profiles"
  on public.profiles for all
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

create policy "public read comments"
  on public.comments for select
  using (true);

create policy "auth insert comments"
  on public.comments for insert
  with check (auth.role() = 'authenticated');

create policy "own update comments"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "own delete comments"
  on public.comments for delete
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
  created_at      timestamptz default now()
);

alter table public.properties enable row level security;

create policy "public read properties"
  on public.properties for select
  using (status = 'live');

create policy "auth insert properties"
  on public.properties for insert
  with check (auth.uid() = user_id);

create policy "own update properties"
  on public.properties for update
  using (auth.uid() = user_id);

create policy "own delete properties"
  on public.properties for delete
  using (auth.uid() = user_id);

create policy "admin all properties"
  on public.properties for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

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
create policy "avatar upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatar public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatar owner delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Property image policies
create policy "property image upload"
  on storage.objects for insert
  with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

create policy "property image public read"
  on storage.objects for select
  using (bucket_id = 'property-images');

create policy "property image owner delete"
  on storage.objects for delete
  using (bucket_id = 'property-images' and auth.uid()::text = (storage.foldername(name))[1]);
