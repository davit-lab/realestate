-- Make academy@codezero.ge an admin
-- Run this in Supabase SQL Editor (or psql if self-hosted)

update public.profiles
set is_admin = true
where id = (
  select id from auth.users where email = 'academy@codezero.ge' limit 1
);
