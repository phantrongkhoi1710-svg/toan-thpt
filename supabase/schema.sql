-- Toán THPT · Auth + tiến độ học tập
-- Chạy file này trong SQL Editor:
-- https://supabase.com/dashboard/project/xiieyrbqsjnpdphyjioi/sql/new

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  display_name text not null default '',
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null,
  xp integer not null default 0,
  streak integer not null default 0,
  done_count integer not null default 0,
  total_count integer not null default 0,
  done jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.progress_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null,
  node_index integer not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists lesson_progress_updated_idx on public.lesson_progress (updated_at desc);
create index if not exists progress_events_user_idx on public.progress_events (user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, 'hocsinh'), '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$;

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.progress_events enable row level security;

drop policy if exists "profiles_select_own_or_teacher" on public.profiles;
create policy "profiles_select_own_or_teacher"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_teacher());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "progress_select_own_or_teacher" on public.lesson_progress;
create policy "progress_select_own_or_teacher"
  on public.lesson_progress for select
  to authenticated
  using (user_id = auth.uid() or public.is_teacher());

drop policy if exists "progress_write_own" on public.lesson_progress;
create policy "progress_write_own"
  on public.lesson_progress for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "progress_update_own" on public.lesson_progress;
create policy "progress_update_own"
  on public.lesson_progress for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "events_select_own_or_teacher" on public.progress_events;
create policy "events_select_own_or_teacher"
  on public.progress_events for select
  to authenticated
  using (user_id = auth.uid() or public.is_teacher());

drop policy if exists "events_insert_own" on public.progress_events;
create policy "events_insert_own"
  on public.progress_events for insert
  to authenticated
  with check (user_id = auth.uid());

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

drop policy if exists "classrooms_select_auth" on public.classrooms;
drop policy if exists "classrooms_select_public" on public.classrooms;
create policy "classrooms_select_public"
  on public.classrooms for select
  to anon, authenticated
  using (true);

drop policy if exists "class_members_select_own_or_teacher" on public.class_members;
create policy "class_members_select_own_or_teacher"
  on public.class_members for select
  to authenticated
  using (user_id = auth.uid() or public.is_teacher());

drop policy if exists "class_members_insert_own" on public.class_members;
create policy "class_members_insert_own"
  on public.class_members for insert
  to authenticated
  with check (user_id = auth.uid());

insert into public.classrooms (id, name)
values
  ('11111111-1111-1111-1111-111111111111', 'Lớp test'),
  ('22222222-2222-2222-2222-222222222222', '10A1'),
  ('33333333-3333-3333-3333-333333333333', '10A2'),
  ('44444444-4444-4444-4444-444444444444', '10A3')
on conflict (id) do update set name = excluded.name;

-- Lớp test: chạy thêm supabase/seed_class_test.sql
