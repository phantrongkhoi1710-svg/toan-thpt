import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { lessons } from "../lessons/registry";

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string;
  role: "student" | "teacher";
}

interface ProgressRow {
  user_id: string;
  lesson_id: string;
  xp: number;
  streak: number;
  done_count: number;
  total_count: number;
  updated_at: string;
}

export function AdminPage() {
  const { profile, loading } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || profile?.role !== "teacher") return;
    let alive = true;
    Promise.all([
      supabase.from("profiles").select("id,email,display_name,role").order("created_at", { ascending: false }),
      supabase.from("lesson_progress").select("user_id,lesson_id,xp,streak,done_count,total_count,updated_at"),
    ]).then(([p, pr]) => {
      if (!alive) return;
      if (p.error || pr.error) {
        setError(p.error?.message || pr.error?.message || "Không tải được dữ liệu.");
        return;
      }
      setProfiles((p.data ?? []) as ProfileRow[]);
      setProgress((pr.data ?? []) as ProgressRow[]);
    });
    return () => {
      alive = false;
    };
  }, [profile?.role]);

  const rows = useMemo(() => {
    return profiles
      .filter((p) => p.role === "student")
      .map((p) => {
        const items = progress.filter((row) => row.user_id === p.id);
        const done = items.reduce((sum, row) => sum + row.done_count, 0);
        const total = items.reduce((sum, row) => sum + row.total_count, 0) || lessons.reduce((s, l) => s + l.challenges.length, 0);
        const xp = items.reduce((sum, row) => sum + row.xp, 0);
        const last = items.map((row) => row.updated_at).sort().at(-1);
        return { profile: p, items, done, total, xp, last };
      });
  }, [profiles, progress]);

  if (loading) {
    return (
      <AppShell>
        <p>Đang tải...</p>
      </AppShell>
    );
  }

  if (profile?.role !== "teacher") {
    return (
      <AppShell>
        <section className="card auth-card">
          <h2>Giám sát học tập</h2>
          <p>Mục này chỉ dành cho giáo viên.</p>
          <p className="auth-note">
            Sau khi đăng ký, vào{" "}
            <a href="https://supabase.com/dashboard/project/xiieyrbqsjnpdphyjioi/editor" target="_blank" rel="noreferrer">
              Table Editor → profiles
            </a>{" "}
            đổi <code>role</code> của bạn thành <code>teacher</code>.
          </p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell searchPlaceholder="Tìm học sinh...">
      <div className="page-head">
        <h1>Giám sát tiến độ</h1>
        <p>{rows.length} học sinh · dữ liệu realtime từ Supabase</p>
      </div>

      <section className="stats" style={{ marginBottom: "1rem" }}>
        <div className="stat stat--blue">
          <div className="stat__label">Học sinh</div>
          <div className="stat__value">{String(rows.length).padStart(2, "0")}</div>
        </div>
        <div className="stat stat--orange">
          <div className="stat__label">Tổng XP</div>
          <div className="stat__value">{rows.reduce((s, r) => s + r.xp, 0)}</div>
        </div>
        <div className="stat stat--teal">
          <div className="stat__label">Mốc hoàn thành</div>
          <div className="stat__value">{rows.reduce((s, r) => s + r.done, 0)}</div>
        </div>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="card">
        <div className="card__head">
          <h2>Bảng tiến độ</h2>
          <Link className="link-soft" to="/">
            Về trang chủ
          </Link>
        </div>
        <div className="table-wrap">
          <table className="monitor-table">
            <thead>
              <tr>
                <th>Học sinh</th>
                <th>Email</th>
                {lessons.map((lesson) => (
                  <th key={lesson.id}>{lesson.shortTitle}</th>
                ))}
                <th>XP</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4 + lessons.length}>Chưa có học sinh đăng nhập / làm bài.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.profile.id}>
                    <td>{row.profile.display_name || "—"}</td>
                    <td>{row.profile.email}</td>
                    {lessons.map((lesson) => {
                      const item = row.items.find((it) => it.lesson_id === lesson.id);
                      const label = item ? `${item.done_count}/${item.total_count || lesson.challenges.length}` : "0/—";
                      return <td key={lesson.id}>{label}</td>;
                    })}
                    <td>{row.xp}</td>
                    <td>{row.last ? new Date(row.last).toLocaleString("vi-VN") : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
