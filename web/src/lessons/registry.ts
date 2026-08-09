import type { Lesson } from "../lib/schema";
import { getAllLessons, getLessonBySlug } from "../lib/lessonsStore";

export const lessons: Lesson[] = getAllLessons();

export function getLesson(slug: string): Lesson | undefined {
  return getLessonBySlug(slug);
}
