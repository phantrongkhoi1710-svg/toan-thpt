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
        <p>Không tìm thấy challenge map.</p>
      </AppShell>
    );
  }
  return (
    <AppShell
      lesson={lesson}
      active="challenge"
      searchPlaceholder="Tìm mốc..."
      topAction={
        <Link className="btn btn--ghost" to={`/bai/${lesson.slug}/slides`}>
          ← Slide
        </Link>
      }
    >
      <ChallengeMap lesson={lesson} />
    </AppShell>
  );
}
