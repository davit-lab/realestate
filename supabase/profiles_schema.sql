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

-- SECURITY DEFINER helper: checks admin status while bypassing RLS (prevents infinite recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Users can read their own profile
drop policy if exists "own profile read" on public.profiles;
DROP POLICY IF EXISTS "own profile read" ON public.profiles;
CREATE POLICY "own profile read" ON public.profiles FOR select
  using (auth.uid() = id);

-- Users can insert their own profile (needed for upsert/signup fallback)
drop policy if exists "own profile insert" on public.profiles;
DROP POLICY IF EXISTS "own profile insert" ON public.profiles;
CREATE POLICY "own profile insert" ON public.profiles FOR insert
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
drop policy if exists "own profile update" on public.profiles;
DROP POLICY IF EXISTS "own profile update" ON public.profiles;
CREATE POLICY "own profile update" ON public.profiles FOR update
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
drop policy if exists "own profile delete" on public.profiles;
DROP POLICY IF EXISTS "own profile delete" ON public.profiles;
CREATE POLICY "own profile delete" ON public.profiles FOR delete
  USING (auth.uid() = id);

-- Admins can read all profiles
drop policy if exists "admin read all" on public.profiles;
DROP POLICY IF EXISTS "admin read all" ON public.profiles;
CREATE POLICY "admin read all" ON public.profiles FOR select
  using (public.is_admin());

-- Admins can update all profiles
drop policy if exists "admin update all" on public.profiles;
DROP POLICY IF EXISTS "admin update all" ON public.profiles;
CREATE POLICY "admin update all" ON public.profiles FOR update
  using (public.is_admin());

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
