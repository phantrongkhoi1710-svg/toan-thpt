import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAuth } from "../lib/auth";
import {
  FALLBACK_CLASSES,
  getSelectedClassroom,
  loadClassrooms,
  setSelectedClassroom,
  studentDisplayName,
  type ClassroomOption,
} from "../lib/classrooms";

const studentOptions = Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(2, "0"));

export function LoginPage() {
  const { configured, user, profile, signIn, signUp } = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [studentNo, setStudentNo] = useState("01");
  const [email, setEmail] = useState("user01@toanthpt.test");
  const [password, setPassword] = useState("Pass01");
  const [displayName, setDisplayName] = useState("");
  const [classes, setClasses] = useState<ClassroomOption[]>(FALLBACK_CLASSES);
  const [classroomId, setClassroomId] = useState(getSelectedClassroom().id);
  const selectedClass = classes.find((row) => row.id === classroomId) ?? classes[0];
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadClassrooms().then((rows) => {
      setClasses(rows);
      setClassroomId((current) => (rows.some((row) => row.id === current) ? current : rows[0].id));
    });
  }, []);

  const destination = useMemo(() => {
    if (profile?.role === "teacher" && (next === "/" || next === "")) return "/quan-tri";
    return next;
  }, [profile?.role, next]);

  if (user && profile) return <Navigate to={destination} replace />;
  if (user && !configured) return <Navigate to={next} replace />;

  const setStudent = (no: string) => {
    setStudentNo(no);
    setEmail(`user${no}@toanthpt.test`);
  };

  const setTeacher = () => {
    setRole("teacher");
    setMode("in");
    setEmail("gv.quynh@toanthpt.test");
    setPassword("Pass01");
    setError(null);
    setInfo(null);
  };

  const setStudentRole = () => {
    setRole("student");
    setEmail(`user${studentNo}@toanthpt.test`);
    setPassword("Pass01");
    setError(null);
    setInfo(null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    setSelectedClassroom(selectedClass);
    const classStudentName = studentDisplayName(selectedClass.name, studentNo);

    const msg =
      mode === "in"
        ? await signIn(
            email.trim(),
            password,
            role === "student"
              ? { classroomId: selectedClass.id, className: selectedClass.name, studentNo }
              : undefined,
          )
        : await signUp(email.trim(), password, displayName.trim() || classStudentName);
    setBusy(false);
    if (msg) {
      setError(translateAuthError(msg));
      return;
    }
    if (mode === "up") {
      setInfo("Tạo tài khoản xong. Hãy đăng nhập lại.");
      setMode("in");
    }
  };

  return (
    <AppShell searchPlaceholder="Tìm bài giảng...">
      <section className="login-wrap">
        <div className="login-card">
          <p className="login-kicker">Toán THPT</p>
          <h1>{mode === "up" ? "Tạo tài khoản" : "Đăng nhập"}</h1>
          <p className="login-sub">Dùng tài khoản Supabase để lưu tiến độ và vào lớp học.</p>

          <div className="login-tabs">
            <button type="button" className={role === "student" ? "is-on" : ""} onClick={setStudentRole}>
              Học sinh
            </button>
            <button type="button" className={role === "teacher" ? "is-on" : ""} onClick={setTeacher}>
              Giáo viên
            </button>
          </div>

          {user && !profile ? <p className="login-msg">Đang tải hồ sơ...</p> : null}

          {user && !profile ? null : !configured ? (
            <p className="login-msg is-bad">
              Chưa cấu hình Supabase. Thêm key vào <code>web/.env.local</code> rồi chạy lại.
            </p>
          ) : (
            <form className="login-form" onSubmit={onSubmit}>
              <label>
                Chọn lớp
                <select
                  value={classroomId}
                  onChange={(e) => {
                    const nextClass = classes.find((row) => row.id === e.target.value);
                    setClassroomId(e.target.value);
                    if (nextClass) setSelectedClassroom(nextClass);
                  }}
                >
                  {classes.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.name}
                    </option>
                  ))}
                </select>
              </label>

              {role === "student" && mode === "in" ? (
                <label>
                  Học sinh
                  <select value={studentNo} onChange={(e) => setStudent(e.target.value)}>
                    {studentOptions.map((no) => (
                      <option key={no} value={no}>
                        {studentDisplayName(selectedClass.name, no)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {mode === "up" ? (
                <label>
                  Họ tên
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={studentDisplayName(selectedClass.name, "01")}
                  />
                </label>
              ) : null}

              <label>
                Email
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>

              <label>
                Mật khẩu
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>

              {error ? <p className="login-msg is-bad">{error}</p> : null}
              {info ? <p className="login-msg is-ok">{info}</p> : null}

              <button className="btn btn--primary" type="submit" disabled={busy}>
                {busy ? "Đang đăng nhập..." : mode === "in" ? "Đăng nhập" : "Đăng ký"}
              </button>

              {role === "student" ? (
                <button
                  className="login-switch"
                  type="button"
                  onClick={() => {
                    setMode(mode === "in" ? "up" : "in");
                    setError(null);
                    setInfo(null);
                  }}
                >
                  {mode === "in" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
                </button>
              ) : (
                <p className="login-hint">Giáo viên: Nguyễn Trúc Quỳnh</p>
              )}
            </form>
          )}

          <p className="login-hint">Mật khẩu lớp test: Pass01</p>
        </div>
      </section>
    </AppShell>
  );
}

function translateAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login")) return "Sai email hoặc mật khẩu.";
  if (lower.includes("email not confirmed")) return "Email chưa xác nhận.";
  if (lower.includes("already registered")) return "Email này đã được đăng ký.";
  return message;
}
