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
create policy "own profile read"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "own profile update"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can read all profiles
create policy "admin read all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Admins can update all profiles
create policy "admin update all"
  on public.profiles for update
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
