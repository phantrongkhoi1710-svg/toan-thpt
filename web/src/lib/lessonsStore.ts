import { useEffect, useState, useCallback } from "react";
import type { Lesson, Level, LessonTheme } from "./schema";
import { bai1 } from "../lessons/bai1";
import { bai2 } from "../lessons/bai2";
import { bai3 } from "../lessons/bai3";
import { supabase } from "./supabase";

export const DEFAULT_LESSONS: Lesson[] = [bai1, bai2, bai3];

const STORAGE_LESSONS_KEY = "toan_thpt_lessons_store_v2";
const STORAGE_CHAPTERS_KEY = "toan_thpt_chapters_store_v2";
const EVENT_LESSONS_CHANGED = "toan-thpt-lessons-changed";

// Danh sách các theme màu có sẵn để giáo viên chọn nhanh
export const THEME_PRESETS: { id: LessonTheme["id"]; name: string; accentFrom: string; accentTo: string; mapName: string }[] = [
  { id: "logic", name: "Logic Xanh Dương", accentFrom: "#3b82f6", accentTo: "#2563eb", mapName: "Thử thách" },
  { id: "island", name: "Đảo Ngọc Cyan", accentFrom: "#22d3ee", accentTo: "#6366f1", mapName: "Đảo Thử Thách" },
  { id: "cinema", name: "Rạp Phim Đỏ Cam", accentFrom: "#fb923c", accentTo: "#e11d48", mapName: "Rạp Nghiệm" },
  { id: "logic", name: "Tím Không Gian", accentFrom: "#a855f7", accentTo: "#6366f1", mapName: "Vùng Vũ Trụ" },
  { id: "island", name: "Rừng Xanh Ngọc", accentFrom: "#10b981", accentTo: "#059669", mapName: "Rừng Nguyên Sinh" },
  { id: "cinema", name: "Hoàng Hôn Hổ Phách", accentFrom: "#f59e0b", accentTo: "#ea580c", mapName: "Vùng Hổ Phách" },
];

function notifyChange() {
  window.dispatchEvent(new Event(EVENT_LESSONS_CHANGED));
}

export function loadStoredChapters(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_CHAPTERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  // Mặc định lấy các chương từ danh sách bài
  const distinct = Array.from(new Set(DEFAULT_LESSONS.map((l) => l.chapter)));
  return distinct.length > 0 ? distinct : ["Chương I"];
}

export function saveStoredChapters(chapters: string[]) {
  try {
    localStorage.setItem(STORAGE_CHAPTERS_KEY, JSON.stringify(chapters));
    notifyChange();
  } catch (err) {
    console.error("Lỗi lưu chương:", err);
  }
}

export function loadLocalLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(STORAGE_LESSONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_LESSONS;
}

export function saveLocalLessons(lessons: Lesson[]) {
  try {
    localStorage.setItem(STORAGE_LESSONS_KEY, JSON.stringify(lessons));
    notifyChange();
  } catch (err) {
    console.error("Lỗi lưu bài học local:", err);
  }
}

export async function fetchRemoteCustomLessons(): Promise<Lesson[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("custom_lessons").select("*").order("number");
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
      number: row.number,
      slug: row.slug,
      chapter: row.chapter,
      title: row.title,
      shortTitle: row.short_title,
      periods: row.periods,
      blurb: row.blurb || "",
      isNew: row.is_new,
      theme: row.theme,
      progressKey: row.progress_key,
      levelLabels: row.level_labels as Record<Level, string>,
      xpByLevel: row.xp_by_level as Record<Level, number>,
      sidebarFoot: row.sidebar_foot || "",
      slides: row.slides || [],
      challenges: row.challenges || [],
    }));
  } catch {
    return null;
  }
}

export async function syncLessonToRemote(lesson: Lesson): Promise<boolean> {
  if (!supabase) return false;
  try {
    const row = {
      id: lesson.id,
      number: lesson.number,
      slug: lesson.slug,
      chapter: lesson.chapter,
      title: lesson.title,
      short_title: lesson.shortTitle,
      periods: lesson.periods,
      blurb: lesson.blurb,
      is_new: Boolean(lesson.isNew),
      theme: lesson.theme,
      progress_key: lesson.progressKey,
      level_labels: lesson.levelLabels,
      xp_by_level: lesson.xpByLevel,
      sidebar_foot: lesson.sidebarFoot,
      slides: lesson.slides,
      challenges: lesson.challenges,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("custom_lessons").upsert(row);
    if (error) {
      console.warn("Lỗi sync bài lên Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteLessonFromRemote(lessonId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("custom_lessons").delete().eq("id", lessonId);
    return !error;
  } catch {
    return false;
  }
}

export function getAllLessons(): Lesson[] {
  return loadLocalLessons();
}

export function getLessonBySlug(slugOrId: string): Lesson | undefined {
  const all = getAllLessons();
  return all.find((l) => l.slug === slugOrId || l.id === slugOrId);
}

export async function saveLesson(lesson: Lesson): Promise<void> {
  const current = loadLocalLessons();
  const index = current.findIndex((l) => l.id === lesson.id || l.slug === lesson.slug);
  let updated: Lesson[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = lesson;
  } else {
    updated = [...current, lesson];
  }

  // Sắp xếp theo số thứ tự
  updated.sort((a, b) => a.number - b.number);

  saveLocalLessons(updated);
  void syncLessonToRemote(lesson);

  // Tự động thêm chương nếu chưa có
  const chapters = loadStoredChapters();
  if (lesson.chapter && !chapters.includes(lesson.chapter)) {
    saveStoredChapters([...chapters, lesson.chapter]);
  }
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const current = loadLocalLessons();
  const updated = current.filter((l) => l.id !== lessonId);
  saveLocalLessons(updated);
  void deleteLessonFromRemote(lessonId);
}

export async function resetDefaultLesson(lessonId: string): Promise<void> {
  const defaultItem = DEFAULT_LESSONS.find((l) => l.id === lessonId);
  if (!defaultItem) return;
  const current = loadLocalLessons();
  const index = current.findIndex((l) => l.id === lessonId);
  if (index >= 0) {
    const updated = [...current];
    updated[index] = defaultItem;
    saveLocalLessons(updated);
    void deleteLessonFromRemote(lessonId);
  }
}

export function createEmptyLesson(chapter: string, number: number): Lesson {
  const id = `bai-${number}`;
  const slug = `bai-${number}`;
  const defaultTheme: LessonTheme = {
    id: "logic",
    accentFrom: "#3b82f6",
    accentTo: "#2563eb",
    mapBoardClass: "",
    nodeClass: "",
    xpLabel: "XP",
    mapName: "Thử thách",
    sectionPrefix: "Mức",
    chestClosed: "📦",
    chestOpen: "🎁",
    successText: "Chính xác!",
    failText: "Chưa đúng.",
    lockedToast: "Hãy mở mốc trước đã!",
    resetLabel: "Chơi lại từ đầu",
    resetConfirm: `Xóa tiến độ Thử thách Bài ${number}?`,
    brandMark: "book",
  };

  return {
    id,
    number,
    slug,
    chapter: chapter || "Chương I",
    title: `Bài ${number}. Tên bài học mới`,
    shortTitle: `Bài ${number}`,
    periods: 3,
    blurb: "Tóm tắt nội dung và kỹ năng trọng tâm",
    isNew: true,
    theme: defaultTheme,
    progressKey: `toan-thpt-map-${id}-v1`,
    levelLabels: { 1: "Nhận biết", 2: "Thông hiểu", 3: "Vận dụng", 4: "Vận dụng cao" },
    xpByLevel: { 1: 10, 2: 15, 3: 20, 4: 30 },
    sidebarFoot: "← → chuyển bài giảng · làm đúng trên thử thách để mở mốc tiếp theo.",
    slides: [
      {
        type: "hero",
        title: "Mở đầu",
        eyebrow: `Toán 10 · ${chapter} · 3 tiết`,
        heading: `Bài ${number}. Tên bài học`,
        body: "Hôm nay chúng ta cùng tìm hiểu kiến thức trọng tâm của bài học này!",
      },
      {
        type: "content",
        title: "Kiến thức trọng tâm",
        banner: "Phần 1 · Định nghĩa",
        bannerTone: "blue",
        heading: "Khái niệm và định nghĩa",
        definition: "Điền định nghĩa, công thức toán học \\(x^2 + 1 > 0\\) vào đây.",
        bullets: ["Ý quan trọng số 1", "Ý quan trọng số 2"],
      },
      {
        type: "summary",
        title: "Tóm tắt",
        banner: "Tổng kết",
        bannerTone: "blue",
        heading: "Nhớ nhanh nội dung chính",
        ctaLabel: "Sang Thử thách →",
        parts: [
          { n: "1", title: "Khái niệm", text: "Nắm vững định nghĩa cơ bản", color: "#2563eb" },
          { n: "2", title: "Công thức", text: "Ghi nhớ cách vận dụng", color: "#10b981" },
        ],
      },
    ],
    challenges: [
      {
        level: 1,
        title: "Nhận biết cơ bản",
        prompt: "Câu hỏi nhận biết mức 1: Chọn khẳng định đúng?",
        options: ["Đáp án A đúng", "Đáp án B sai", "Đáp án C sai", "Đáp án D sai"],
        answer: 0,
        explain: "Lời giải thích chi tiết cho câu hỏi.",
      },
      {
        level: 2,
        title: "Thông hiểu kiến thức",
        prompt: "Câu hỏi thông hiểu mức 2: Tính giá trị của biểu thức...",
        options: ["Giá trị 1", "Giá trị 2 (Đúng)", "Giá trị 3", "Giá trị 4"],
        answer: 1,
        explain: "Các bước tính toán chi tiết.",
      },
    ],
  };
}

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>(() => loadLocalLessons());
  const [chapters, setChapters] = useState<string[]>(() => loadStoredChapters());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLessons(loadLocalLessons());
    setChapters(loadStoredChapters());
  }, []);

  useEffect(() => {
    // Lắng nghe sự kiện thay đổi từ bất kỳ component nào
    const handleChanged = () => {
      refresh();
    };
    window.addEventListener(EVENT_LESSONS_CHANGED, handleChanged);

    // Đồng bộ từ Supabase nếu có
    if (supabase) {
      setLoading(true);
      void fetchRemoteCustomLessons().then((remote) => {
        setLoading(false);
        if (remote && remote.length > 0) {
          // Gộp bài từ database với bài mặc định
          const local = loadLocalLessons();
          const mergedMap = new Map<string, Lesson>();
          for (const l of DEFAULT_LESSONS) mergedMap.set(l.id, l);
          for (const l of local) mergedMap.set(l.id, l);
          for (const l of remote) mergedMap.set(l.id, l);

          const merged = Array.from(mergedMap.values()).sort((a, b) => a.number - b.number);
          saveLocalLessons(merged);

          // Cập nhật các chương
          const allChapters = Array.from(new Set(merged.map((l) => l.chapter)));
          saveStoredChapters(allChapters);
        }
      });
    }

    return () => {
      window.removeEventListener(EVENT_LESSONS_CHANGED, handleChanged);
    };
  }, [refresh]);

  return { lessons, chapters, loading, refresh };
}
