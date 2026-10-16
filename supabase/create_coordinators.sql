-- Create one login per state (36 states + FCT) for IBBN coordinators.
-- Run this in the Supabase SQL editor AFTER schema.sql.
--
-- It prints a table of email + temporary password.
-- Copy that result now and share it privately. Passwords cannot be shown again.
-- Re-running this does NOT reset existing passwords.

create extension if not exists "pgcrypto";

create table if not exists public.coordinators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  state text not null,
  created_at timestamptz not null default now()
);

create index if not exists coordinators_state_idx on public.coordinators (state);

create temporary table if not exists coordinator_logins (
  state text,
  email text,
  temporary_password text,
  status text
);

truncate coordinator_logins;

do $$
declare
  rec record;
  new_id uuid;
  instance uuid;
  pwd text;
  already uuid;
begin
  select u.instance_id into instance from auth.users u limit 1;
  if instance is null then
    instance := '00000000-0000-0000-0000-000000000000';
  end if;

  for rec in
    select * from (values
      ('Abia', 'coordinator.abia@ibbnnigeria.org'),
      ('Adamawa', 'coordinator.adamawa@ibbnnigeria.org'),
      ('Akwa Ibom', 'coordinator.akwa-ibom@ibbnnigeria.org'),
      ('Anambra', 'coordinator.anambra@ibbnnigeria.org'),
      ('Bauchi', 'coordinator.bauchi@ibbnnigeria.org'),
      ('Bayelsa', 'coordinator.bayelsa@ibbnnigeria.org'),
      ('Benue', 'coordinator.benue@ibbnnigeria.org'),
      ('Borno', 'coordinator.borno@ibbnnigeria.org'),
      ('Cross River', 'coordinator.cross-river@ibbnnigeria.org'),
      ('Delta', 'coordinator.delta@ibbnnigeria.org'),
      ('Ebonyi', 'coordinator.ebonyi@ibbnnigeria.org'),
      ('Edo', 'coordinator.edo@ibbnnigeria.org'),
      ('Ekiti', 'coordinator.ekiti@ibbnnigeria.org'),
      ('Enugu', 'coordinator.enugu@ibbnnigeria.org'),
      ('Federal Capital Territory', 'coordinator.fct@ibbnnigeria.org'),
      ('Gombe', 'coordinator.gombe@ibbnnigeria.org'),
      ('Imo', 'coordinator.imo@ibbnnigeria.org'),
      ('Jigawa', 'coordinator.jigawa@ibbnnigeria.org'),
      ('Kaduna', 'coordinator.kaduna@ibbnnigeria.org'),
      ('Kano', 'coordinator.kano@ibbnnigeria.org'),
      ('Katsina', 'coordinator.katsina@ibbnnigeria.org'),
      ('Kebbi', 'coordinator.kebbi@ibbnnigeria.org'),
      ('Kogi', 'coordinator.kogi@ibbnnigeria.org'),
      ('Kwara', 'coordinator.kwara@ibbnnigeria.org'),
      ('Lagos', 'coordinator.lagos@ibbnnigeria.org'),
      ('Nasarawa', 'coordinator.nasarawa@ibbnnigeria.org'),
      ('Niger', 'coordinator.niger@ibbnnigeria.org'),
      ('Ogun', 'coordinator.ogun@ibbnnigeria.org'),
      ('Ondo', 'coordinator.ondo@ibbnnigeria.org'),
      ('Osun', 'coordinator.osun@ibbnnigeria.org'),
      ('Oyo', 'coordinator.oyo@ibbnnigeria.org'),
      ('Plateau', 'coordinator.plateau@ibbnnigeria.org'),
      ('Rivers', 'coordinator.rivers@ibbnnigeria.org'),
      ('Sokoto', 'coordinator.sokoto@ibbnnigeria.org'),
      ('Taraba', 'coordinator.taraba@ibbnnigeria.org'),
      ('Yobe', 'coordinator.yobe@ibbnnigeria.org'),
      ('Zamfara', 'coordinator.zamfara@ibbnnigeria.org')
    ) as t(state, email)
  loop
    select id into already from auth.users where lower(email) = lower(rec.email);

    if already is not null then
      insert into public.coordinators (user_id, email, state)
      values (already, rec.email, rec.state)
      on conflict (user_id) do update set email = excluded.email, state = excluded.state;

      insert into coordinator_logins (state, email, temporary_password, status)
      values (rec.state, rec.email, '(unchanged)', 'Already existed — password not reset');
      continue;
    end if;

    new_id := gen_random_uuid();
    pwd := 'IBBN-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      instance,
      new_id,
      'authenticated',
      'authenticated',
      rec.email,
      extensions.crypt(pwd, extensions.gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('role', 'coordinator', 'state', rec.state),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at,
      provider_id
    ) values (
      gen_random_uuid(),
      new_id,
      jsonb_build_object('sub', new_id::text, 'email', rec.email, 'email_verified', true),
      'email',
      now(),
      now(),
      now(),
      new_id::text
    );

    insert into public.coordinators (user_id, email, state)
    values (new_id, rec.email, rec.state)
    on conflict (user_id) do update set email = excluded.email, state = excluded.state;

    insert into coordinator_logins (state, email, temporary_password, status)
    values (rec.state, rec.email, pwd, 'Created — copy this password now');
  end loop;
end
$$;

select state, email, temporary_password, status
from coordinator_logins
order by state;
