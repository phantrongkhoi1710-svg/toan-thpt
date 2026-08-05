import { supabase } from "./supabase";

export interface ClassroomOption {
  id: string;
  name: string;
}

export const FALLBACK_CLASSES: ClassroomOption[] = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Lớp test" },
  { id: "22222222-2222-2222-2222-222222222222", name: "10A1" },
  { id: "33333333-3333-3333-3333-333333333333", name: "10A2" },
  { id: "44444444-4444-4444-4444-444444444444", name: "10A3" },
];

const CLASS_ID_KEY = "toanthpt.classId";
const CLASS_NAME_KEY = "toanthpt.className";

export function getSelectedClassroom(): ClassroomOption {
  try {
    const id = localStorage.getItem(CLASS_ID_KEY);
    const name = localStorage.getItem(CLASS_NAME_KEY);
    if (id && name) return { id, name };
  } catch {
    /* ignore */
  }
  return FALLBACK_CLASSES[0];
}

export function setSelectedClassroom(classroom: ClassroomOption) {
  try {
    localStorage.setItem(CLASS_ID_KEY, classroom.id);
    localStorage.setItem(CLASS_NAME_KEY, classroom.name);
  } catch {
    /* ignore */
  }
}

export async function loadClassrooms(): Promise<ClassroomOption[]> {
  if (!supabase) return FALLBACK_CLASSES;
  const { data, error } = await supabase.from("classrooms").select("id,name").order("name");
  if (error || !data?.length) return FALLBACK_CLASSES;
  return data as ClassroomOption[];
}

export function studentDisplayName(className: string, studentNo: string) {
  return `${className} · HS ${studentNo}`;
}

export function studentNoFromEmail(email: string | null | undefined) {
  return email?.match(/user(\d{2})@/i)?.[1] ?? null;
}

export async function joinClassroom(classroomId: string, className?: string, studentNo?: string) {
  if (!supabase || !classroomId) return;
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return;
  await supabase.from("class_members").upsert(
    { classroom_id: classroomId, user_id: userId },
    { onConflict: "classroom_id,user_id" },
  );
  const no = studentNo || studentNoFromEmail(data.user?.email);
  if (className && no) {
    await supabase.from("profiles").update({ display_name: studentDisplayName(className, no) }).eq("id", userId);
  }
}
