-- Lớp test: GV Nguyễn Trúc Quỳnh + User 01 → User 40
-- Mật khẩu chung: Pass01
-- Chạy SAU schema.sql trong SQL Editor:
-- https://supabase.com/dashboard/project/xiieyrbqsjnpdphyjioi/sql/new

create extension if not exists pgcrypto;

create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (classroom_id, user_id)
);

alter table public.classrooms enable row level security;
alter table public.class_members enable row level security;

delete from auth.users
where email = 'gv.quynh@toanthpt.test'
   or email ~ '^user[0-9]{2}@toanthpt\.test$';

do $$
declare
  new_id uuid;
  mail text;
  full_name text;
  i int;
begin
  new_id := gen_random_uuid();
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000',
    new_id,
    'authenticated',
    'authenticated',
    'gv.quynh@toanthpt.test',
    crypt('Pass01', gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"Nguyễn Trúc Quỳnh"}'::jsonb,
    now(), now(),
    '', '', '', ''
  );

  insert into auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(),
    'gv.quynh@toanthpt.test',
    new_id,
    jsonb_build_object('sub', new_id::text, 'email', 'gv.quynh@toanthpt.test', 'email_verified', true),
    'email',
    now(), now(), now()
  );

  for i in 1..40 loop
    new_id := gen_random_uuid();
    mail := format('user%s@toanthpt.test', lpad(i::text, 2, '0'));
    full_name := format('User %s', lpad(i::text, 2, '0'));

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_id,
      'authenticated',
      'authenticated',
      mail,
      crypt('Pass01', gen_salt('bf')),
      now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('display_name', full_name),
      now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (
      id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      mail,
      new_id,
      jsonb_build_object('sub', new_id::text, 'email', mail, 'email_verified', true),
      'email',
      now(), now(), now()
    );
  end loop;
end $$;

update public.profiles
set role = 'teacher', display_name = 'Nguyễn Trúc Quỳnh'
where email = 'gv.quynh@toanthpt.test';

update public.profiles p
set display_name = initcap(replace(split_part(p.email, '@', 1), 'user', 'User '))
where p.email ~ '^user[0-9]{2}@toanthpt\.test$';

-- chuẩn hóa tên theo lớp test
update public.profiles p
set display_name = format('Lớp test · HS %s', substring(p.email from 'user([0-9]{2})'))
where p.email ~ '^user[0-9]{2}@toanthpt\.test$';

insert into public.classrooms (id, name, teacher_id)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Lớp test',
    (select id from public.profiles where email = 'gv.quynh@toanthpt.test')
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '10A1',
    (select id from public.profiles where email = 'gv.quynh@toanthpt.test')
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '10A2',
    (select id from public.profiles where email = 'gv.quynh@toanthpt.test')
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '10A3',
    (select id from public.profiles where email = 'gv.quynh@toanthpt.test')
  )
on conflict (id) do update
set name = excluded.name,
    teacher_id = excluded.teacher_id;

delete from public.class_members
where classroom_id = '11111111-1111-1111-1111-111111111111';

insert into public.class_members (classroom_id, user_id)
select '11111111-1111-1111-1111-111111111111', id
from public.profiles
where email ~ '^user[0-9]{2}@toanthpt\.test$';
