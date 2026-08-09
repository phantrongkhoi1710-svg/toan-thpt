-- Bảng custom_lessons: Lưu trữ bài học do giáo viên tạo hoặc chỉnh sửa trên UI
-- Chạy script này trong SQL Editor trên Supabase:
-- https://supabase.com/dashboard/project/xiieyrbqsjnpdphyjioi/sql/new

create table if not exists public.custom_lessons (
  id text primary key,
  number integer not null,
  slug text not null unique,
  chapter text not null,
  title text not null,
  short_title text not null,
  periods integer not null default 3,
  blurb text not null default '',
  is_new boolean not null default false,
  theme jsonb not null default '{}'::jsonb,
  progress_key text not null,
  level_labels jsonb not null default '{"1":"Nhận biết","2":"Thông hiểu","3":"Vận dụng","4":"Vận dụng cao"}'::jsonb,
  xp_by_level jsonb not null default '{"1":10,"2":15,"3":20,"4":30}'::jsonb,
  sidebar_foot text not null default '',
  slides jsonb not null default '[]'::jsonb,
  challenges jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists custom_lessons_chapter_idx on public.custom_lessons (chapter);
create index if not exists custom_lessons_number_idx on public.custom_lessons (number);

alter table public.custom_lessons enable row level security;

-- Tất cả người dùng (học sinh, giáo viên, khách) đều có thể đọc bài học đã tạo
drop policy if exists "custom_lessons_select_all" on public.custom_lessons;
create policy "custom_lessons_select_all"
  on public.custom_lessons for select
  to authenticated, anon
  using (true);

-- Chỉ giáo viên mới có quyền Thêm, Sửa, Xóa bài học
drop policy if exists "custom_lessons_insert_teacher" on public.custom_lessons;
create policy "custom_lessons_insert_teacher"
  on public.custom_lessons for insert
  to authenticated
  with check (public.is_teacher());

drop policy if exists "custom_lessons_update_teacher" on public.custom_lessons;
create policy "custom_lessons_update_teacher"
  on public.custom_lessons for update
  to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

drop policy if exists "custom_lessons_delete_teacher" on public.custom_lessons;
create policy "custom_lessons_delete_teacher"
  on public.custom_lessons for delete
  to authenticated
  using (public.is_teacher());
