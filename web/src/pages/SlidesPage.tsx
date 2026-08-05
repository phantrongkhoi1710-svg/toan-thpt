import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { SlideDeck } from "../components/SlideDeck";
import { getLesson } from "../lessons/registry";

export function SlidesPage() {
  const { slug } = useParams();
  const lesson = slug ? getLesson(slug) : undefined;
  if (!lesson) {
    return (
      <AppShell>
        <p>Không tìm thấy bài giảng.</p>
      </AppShell>
    );
  }
  return (
    <AppShell
      lesson={lesson}
      active="slides"
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
