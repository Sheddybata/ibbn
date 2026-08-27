-- IBBN member registration — run this in the Supabase SQL editor (once).
-- Dashboard: https://supabase.com/dashboard → your project → SQL → New query
--
-- Setup checklist:
-- 1. Create a project at https://supabase.com
-- 2. Settings → API: copy Project URL and anon public key into Vercel env
--    SUPABASE_URL and SUPABASE_ANON_KEY (then redeploy). Locally copy
--    config.example.js → config.js and paste the same values.
-- 3. Run this entire file.
-- 4. Storage → Buckets: confirm "member-photos" exists (created below).

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
