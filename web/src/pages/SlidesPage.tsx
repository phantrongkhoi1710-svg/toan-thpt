import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { SlideDeck } from "../components/SlideDeck";
import { useLessons } from "../lib/lessonsStore";

export function SlidesPage() {
  const { slug } = useParams();
  const { lessons } = useLessons();
  const lesson = slug ? lessons.find((l) => l.slug === slug || l.id === slug) : undefined;
  if (!lesson) {
    return (
      <AppShell>
        <p>Không tìm thấy bài giảng.</p>
      </AppShell>
    );
  }
  return (
    <AppShell
      searchPlaceholder={`Tìm trong ${lesson.shortTitle}...`}
      topAction={
        <Link className="btn btn--ghost" to={`/bai/${lesson.slug}/challenge`}>
          {lesson.theme.mapName} →
        </Link>
      }
    >
      <SlideDeck lesson={lesson} />
    </AppShell>
  );
}
