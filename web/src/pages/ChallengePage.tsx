import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ChallengeMap } from "../components/ChallengeMap";
import { getLesson } from "../lessons/registry";

export function ChallengePage() {
  const { slug } = useParams();
  const lesson = slug ? getLesson(slug) : undefined;
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
