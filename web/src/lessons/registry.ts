import type { Lesson } from "../lib/schema";
import { bai1 } from "./bai1";
import { bai2 } from "./bai2";
import { bai3 } from "./bai3";

export const lessons: Lesson[] = [bai1, bai2, bai3];

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug || lesson.id === slug);
}
