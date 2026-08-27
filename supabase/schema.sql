-- IBBN member registration — run this in the Supabase SQL editor (once).
-- Dashboard: https://supabase.com/dashboard → your project → SQL → New query
--
-- Setup checklist:
-- 1. Create a project at https://supabase.com
-- 2. Settings → API: copy Project URL and anon public key into Vercel env
--    SUPABASE_URL and SUPABASE_ANON_KEY (then redeploy). Locally copy
--    config.example.js → config.js and paste the same values.
-- 3. Run this entire file (safe to re-run when you add verification or admin).
-- 4. Storage → Buckets: confirm "member-photos" exists (created below).
-- 5. Admin: Authentication → Settings → turn OFF "Allow new users to sign up".
--    Authentication → Users → Add user (email + password, auto-confirm).
--    Then run the insert at the bottom of this file with that email.

create extension if not exists "pgcrypto";

create sequence if not exists ibbn_membership_seq start 100001;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  membership_id text unique not null,
  title text,
  first_name text not null,
  last_name text not null,
  other_names text,
  gender text,
  date_of_birth date,
  email text,
  phone text not null,
  whatsapp text,
  occupation text,
  state text not null,
  lga text not null,
  ward text not null,
  polling_unit text not null,
  vin text,
  photo_path text,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists members_phone_idx on public.members (phone);
create unique index if not exists members_vin_idx on public.members (vin) where vin is not null and vin <> '';

alter table public.members enable row level security;

drop policy if exists members_anon_insert on public.members;
create policy members_anon_insert
  on public.members
  for insert
  to anon
  with check (consent = true);

-- No public SELECT — members cannot list other people's records.

insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', true)
on conflict (id) do nothing;

drop policy if exists member_photos_anon_upload on storage.objects;
create policy member_photos_anon_upload
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'member-photos');

drop policy if exists member_photos_public_read on storage.objects;
create policy member_photos_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'member-photos');

-- Public card verification: returns only what a scanner should see.
-- Does not expose phone, email, VIN, or date of birth.
create or replace function public.verify_member(p_membership_id text)
returns table (
  membership_id text,
  full_name text,
  state text,
  lga text,
  ward text,
  polling_unit text,
  photo_path text,
  issued_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.membership_id,
    trim(both ' ' from concat_ws(' ', m.first_name, nullif(m.other_names, ''), m.last_name)),
    m.state,
    m.lga,
    m.ward,
    m.polling_unit,
    m.photo_path,
    m.created_at
  from public.members m
  where upper(trim(m.membership_id)) = upper(trim(p_membership_id))
  limit 1;
$$;

revoke all on function public.verify_member(text) from public;
grant execute on function public.verify_member(text) to anon, authenticated;

-- Admin console: only rows in public.admins can read the full members table.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists admins_self_select on public.admins;
create policy admins_self_select
  on public.admins
  for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant select on public.admins to authenticated;
grant select on public.members to authenticated;

drop policy if exists members_admin_select on public.members;
create policy members_admin_select
  on public.members
  for select
  to authenticated
  using (public.is_admin());

-- Same-browser admin sessions use the authenticated role, not anon.
drop policy if exists members_authenticated_insert on public.members;
create policy members_authenticated_insert
  on public.members
  for insert
  to authenticated
  with check (consent = true);

drop policy if exists member_photos_authenticated_upload on storage.objects;
create policy member_photos_authenticated_upload
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'member-photos');

-- Replace the email with the admin user you created in Authentication → Users:
-- insert into public.admins (user_id, email)
-- select id, email from auth.users where email = 'you@example.com';
