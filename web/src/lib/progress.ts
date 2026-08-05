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
