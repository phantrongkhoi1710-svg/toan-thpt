import { supabase } from "./supabase";

export interface ProgressState {
  done: Record<string, boolean>;
  xp: number;
  streak: number;
}

const empty = (): ProgressState => ({ done: {}, xp: 0, streak: 0 });

export function loadProgress(key: string): ProgressState {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      done: parsed.done ?? {},
      xp: Number(parsed.xp) || 0,
      streak: Number(parsed.streak) || 0,
    };
  } catch {
    return empty();
  }
}

export function saveProgress(key: string, state: ProgressState) {
  localStorage.setItem(key, JSON.stringify(state));
}

export async function fetchRemoteProgress(userId: string, lessonId: string): Promise<ProgressState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("xp,streak,done")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    xp: Number(data.xp) || 0,
    streak: Number(data.streak) || 0,
    done: (data.done as Record<string, boolean>) ?? {},
  };
}

export function mergeProgress(local: ProgressState, remote: ProgressState): ProgressState {
  const done = { ...local.done, ...remote.done };
  return {
    done,
    xp: Math.max(local.xp, remote.xp),
    streak: Math.max(local.streak, remote.streak),
  };
}

export async function syncProgress(
  userId: string,
  lessonId: string,
  state: ProgressState,
  totalCount: number,
) {
  if (!supabase) return;
  const doneCount = Object.keys(state.done).length;
  await supabase.from("lesson_progress").upsert({
    user_id: userId,
    lesson_id: lessonId,
    xp: state.xp,
    streak: state.streak,
    done_count: doneCount,
    total_count: totalCount,
    done: state.done,
    updated_at: new Date().toISOString(),
  });
}

export async function logProgressEvent(userId: string, lessonId: string, nodeIndex: number, correct: boolean) {
  if (!supabase) return;
  await supabase.from("progress_events").insert({
    user_id: userId,
    lesson_id: lessonId,
    node_index: nodeIndex,
    correct,
  });
}
