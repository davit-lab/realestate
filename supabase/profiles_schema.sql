-- ================================================================
-- Profiles table: one row per auth.users row
-- ================================================================
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text        default '',
  avatar_url  text        default '',
  phone       text        default '',
  balance     numeric     default 0,
  is_admin    boolean     default false,
  created_at  timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read their own profile
drop policy if exists "own profile read" on public.profiles;
DROP POLICY IF EXISTS "own profile read" ON public.profiles;
CREATE POLICY "own profile read" ON public.profiles FOR select
  using (auth.uid() = id);

-- Users can update their own profile
drop policy if exists "own profile update" on public.profiles;
DROP POLICY IF EXISTS "own profile update" ON public.profiles;
CREATE POLICY "own profile update" ON public.profiles FOR update
  using (auth.uid() = id);

-- Admins can read all profiles
drop policy if exists "admin read all" on public.profiles;
DROP POLICY IF EXISTS "admin read all" ON public.profiles;
CREATE POLICY "admin read all" ON public.profiles FOR select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Admins can update all profiles
drop policy if exists "admin update all" on public.profiles;
DROP POLICY IF EXISTS "admin update all" ON public.profiles;
CREATE POLICY "admin update all" ON public.profiles FOR update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Auto-create profile row on new signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- Make first registered user an admin automatically (optional)
-- Comment out if you want to assign admins manually
-- ================================================================
-- create or replace function public.make_first_user_admin()
-- returns trigger as $$
-- begin
--   if (select count(*) from public.profiles) = 1 then
--     update public.profiles set is_admin = true where id = new.id;
--   end if;
--   return new;
-- end;
-- $$ language plpgsql security definer;
