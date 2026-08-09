import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ChallengeMap } from "../components/ChallengeMap";
import { useLessons } from "../lib/lessonsStore";

export function ChallengePage() {
  const { slug } = useParams();
  const { lessons } = useLessons();
  const lesson = slug ? lessons.find((l) => l.slug === slug || l.id === slug) : undefined;
  if (!lesson) {
    return (
      <AppShell>
        <p>Không tìm thấy thử thách.</p>
      </AppShell>
    );
  }
  return (
    <AppShell
      searchPlaceholder="Tìm mốc..."
      topAction={
        <Link className="btn btn--ghost" to={`/bai/${lesson.slug}/slides`}>
          ← Bài giảng
        </Link>
      }
    >
      <ChallengeMap lesson={lesson} />
    </AppShell>
  );
}
