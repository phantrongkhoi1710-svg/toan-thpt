-- Chạy thêm nếu schema.sql đã chạy trước đó:
-- https://supabase.com/dashboard/project/xiieyrbqsjnpdphyjioi/sql/new

drop policy if exists "classrooms_select_auth" on public.classrooms;
drop policy if exists "classrooms_select_public" on public.classrooms;
create policy "classrooms_select_public"
  on public.classrooms for select
  to anon, authenticated
  using (true);

drop policy if exists "class_members_insert_own" on public.class_members;
create policy "class_members_insert_own"
  on public.class_members for insert
  to authenticated
  with check (user_id = auth.uid());

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
    teacher_id = coalesce(excluded.teacher_id, public.classrooms.teacher_id);
