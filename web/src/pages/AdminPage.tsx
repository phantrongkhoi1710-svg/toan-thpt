import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAuth } from "../lib/auth";
import { getSelectedClassroom, setSelectedClassroom, studentDisplayName, studentNoFromEmail } from "../lib/classrooms";
import { supabase } from "../lib/supabase";
import { useLessons } from "../lib/lessonsStore";

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

interface ClassroomRow {
  id: string;
  name: string;
  teacher_id: string | null;
}

export function AdminPage() {
  const { profile, loading } = useAuth();
  const { lessons } = useLessons();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomRow[]>([]);
  const [classroomId, setClassroomId] = useState(getSelectedClassroom().id);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || profile?.role !== "teacher") return;
    let alive = true;
    Promise.all([
      supabase.from("profiles").select("id,email,display_name,role"),
      supabase.from("lesson_progress").select("user_id,lesson_id,xp,streak,done_count,total_count,updated_at"),
      supabase.from("classrooms").select("id,name,teacher_id").order("name"),
      supabase.from("class_members").select("classroom_id,user_id"),
    ]).then(([p, pr, cl, mem]) => {
      if (!alive) return;
      if (p.error || pr.error) {
        setError(p.error?.message || pr.error?.message || "Không tải được dữ liệu.");
        return;
      }
      const classRows = (cl.data ?? []) as ClassroomRow[];
      setProfiles((p.data ?? []) as ProfileRow[]);
      setProgress((pr.data ?? []) as ProgressRow[]);
      setClassrooms(classRows);
      const selected = classRows.find((row) => row.id === classroomId) ?? classRows[0] ?? null;
      if (selected && selected.id !== classroomId) setClassroomId(selected.id);
      const classId = selected?.id;
      const members = ((mem.data ?? []) as { classroom_id: string; user_id: string }[]).filter(
        (row) => !classId || row.classroom_id === classId,
      );
      setMemberIds(members.map((row) => row.user_id));
    });
    return () => {
      alive = false;
    };
  }, [profile?.role, classroomId]);

  const classroom = classrooms.find((row) => row.id === classroomId) ?? classrooms[0] ?? null;
  const teacher = profiles.find((p) => p.role === "teacher" && p.email === "gv.quynh@toanthpt.test")
    ?? profiles.find((p) => p.id === classroom?.teacher_id)
    ?? profiles.find((p) => p.role === "teacher");

  const rows = useMemo(() => {
    const students = profiles
      .filter((p) => p.role === "student")
      .filter((p) => memberIds.length === 0 || memberIds.includes(p.id))
      .sort((a, b) => (a.display_name || a.email || "").localeCompare(b.display_name || b.email || "", "vi", { numeric: true }));

    return students.map((p) => {
      const items = progress.filter((row) => row.user_id === p.id);
      const done = items.reduce((sum, row) => sum + row.done_count, 0);
      const xp = items.reduce((sum, row) => sum + row.xp, 0);
      const last = items.map((row) => row.updated_at).sort().at(-1);
      return { profile: p, items, done, xp, last };
    });
  }, [profiles, progress, memberIds]);

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
            Đăng nhập giáo viên: <code>gv.quynh@toanthpt.test</code> / <code>Pass01</code>
          </p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell searchPlaceholder="Tìm học sinh...">
      <div className="page-head">
        <div>
          <h1>{classroom?.name || "Giám sát tiến độ"}</h1>
          <p>
            GVCN: <strong>{teacher?.display_name || "Nguyễn Trúc Quỳnh"}</strong>
            {teacher?.email ? ` · ${teacher.email}` : ""} · {rows.length} học sinh
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link to="/soan-bai" className="btn btn--primary">
            ✏️ Soạn bài học
          </Link>
          {classrooms.length > 0 ? (
            <label className="class-switch">
              Lớp
              <select
                value={classroom?.id ?? ""}
                onChange={(e) => {
                  const nextClass = classrooms.find((row) => row.id === e.target.value);
                  setClassroomId(e.target.value);
                  if (nextClass) setSelectedClassroom({ id: nextClass.id, name: nextClass.name });
                }}
              >
                {classrooms.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
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

      <section className="card" style={{ marginBottom: "1rem" }}>
        <div className="card__head">
          <h2>Tài khoản lớp test</h2>
        </div>
        <p className="auth-note" style={{ marginTop: 0 }}>
          Mật khẩu chung: <code>Pass01</code>
          <br />
          Giáo viên: <code>gv.quynh@toanthpt.test</code>
          <br />
          Học sinh: <code>user01@toanthpt.test</code> → <code>user40@toanthpt.test</code>
        </p>
      </section>

      {error ? <p className="auth-error">{error}</p> : null}

      <section className="card">
        <div className="card__head">
          <h2>Danh sách lớp</h2>
          <Link className="link-soft" to="/">
            Về trang chủ
          </Link>
        </div>
        <div className="table-wrap">
          <table className="monitor-table">
            <thead>
              <tr>
                <th>STT</th>
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
                  <td colSpan={5 + lessons.length}>
                    Chưa có lớp test. Chạy file <code>supabase/seed_class_test.sql</code> trên Supabase.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.profile.id}>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>
                      {studentNoFromEmail(row.profile.email) && classroom
                        ? studentDisplayName(classroom.name, studentNoFromEmail(row.profile.email)!)
                        : row.profile.display_name || "—"}
                    </td>
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
