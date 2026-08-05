import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";

type RoleGate = "student" | "teacher";

const FLOAT_SYMBOLS = ["∀", "∃", "π", "√", "∩", "∪", "⇒", "∞", "Δ", "θ", "∑", "∈"];

export function LoginPage() {
  const { configured, user, profile, signIn, signUp } = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const [gate, setGate] = useState<RoleGate>("student");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [studentNo, setStudentNo] = useState("01");
  const [email, setEmail] = useState("user01@toanthpt.test");
  const [password, setPassword] = useState("Pass01");
  const [displayName, setDisplayName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const destination = useMemo(() => {
    if (profile?.role === "teacher" && (next === "/" || next === "")) return "/quan-tri";
    return next;
  }, [profile?.role, next]);

  if (user && profile) return <Navigate to={destination} replace />;
  if (user && !configured) return <Navigate to={next} replace />;

  const applyGate = (nextGate: RoleGate) => {
    setGate(nextGate);
    setError(null);
    setInfo(null);
    setPassword("Pass01");
    if (nextGate === "teacher") {
      setMode("in");
      setEmail("gv.quynh@toanthpt.test");
    } else {
      setEmail(`user${studentNo}@toanthpt.test`);
    }
  };

  const applyStudentNo = (value: string) => {
    const padded = value.replace(/\D/g, "").slice(0, 2).padStart(2, "0");
    const safe = Math.min(40, Math.max(1, Number(padded) || 1));
    const code = String(safe).padStart(2, "0");
    setStudentNo(code);
    if (gate === "student" && mode === "in") setEmail(`user${code}@toanthpt.test`);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    const msg =
      mode === "in"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, displayName.trim() || email.split("@")[0]);
    setBusy(false);
    if (msg) {
      setError(translateAuthError(msg));
      return;
    }
    if (mode === "up") {
      setInfo("Thẻ học viên đã được phát hành! Nếu cần xác nhận email thì kiểm tra hộp thư, rồi đăng nhập nhé.");
      setMode("in");
    }
  };

  return (
    <div className="gate">
      <div className="gate__art" aria-hidden="true">
        <div className="gate__board">
          <p className="gate__eyebrow">Học viện Toán THPT</p>
          <h1>Mở cổng lớp học</h1>
          <p className="gate__lead">
            Vào bằng thẻ học viên hoặc chìa khóa giáo viên. Bên trong có slide, challenge map và bảng giám sát tiến độ.
          </p>
          <ul className="gate__facts">
            <li>
              <strong>P ⇒ Q</strong>
              <span>Đăng nhập đúng mới mở challenge</span>
            </li>
            <li>
              <strong>∀ học sinh</strong>
              <span>Tiến độ được lưu trên Supabase</span>
            </li>
            <li>
              <strong>∃ giáo viên</strong>
              <span>Nhìn thấy cả lớp đang học tới đâu</span>
            </li>
          </ul>
        </div>
        {FLOAT_SYMBOLS.map((sym) => (
          <span key={sym} className="gate__float">
            {sym}
          </span>
        ))}
      </div>

      <div className="gate__panel">
        <Link className="gate__back" to="/">
          ← Về sảnh học tập
        </Link>
        <div className="gate__ticket">
          <div className="gate__stamp">{gate === "teacher" ? "GV" : "HS"}</div>
          <p className="gate__kicker">{mode === "in" ? "Soát vé vào lớp" : "Làm thẻ học viên mới"}</p>
          <h2>{gate === "teacher" ? "Phòng giáo viên" : "Cổng học sinh"}</h2>

          <div className="gate__roles" role="tablist">
            <button type="button" className={gate === "student" ? "is-on" : ""} onClick={() => applyGate("student")}>
              Học sinh
            </button>
            <button type="button" className={gate === "teacher" ? "is-on" : ""} onClick={() => applyGate("teacher")}>
              Giáo viên
            </button>
          </div>

          {user && !profile ? <p className="gate__alert">Đang kiểm tra thẻ học viên...</p> : null}

          {!configured ? (
            <p className="gate__alert">
              Chưa gắn Supabase. Thêm <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> vào{" "}
              <code>web/.env.local</code>.
            </p>
          ) : (
            <form className="gate__form" onSubmit={onSubmit}>
              {gate === "student" && mode === "in" ? (
                <label className="gate__field">
                  Số báo danh lớp test
                  <div className="gate__seat">
                    <button type="button" onClick={() => applyStudentNo(String(Number(studentNo) - 1))} aria-label="Giảm">
                      −
                    </button>
                    <input
                      inputMode="numeric"
                      value={studentNo}
                      onChange={(e) => applyStudentNo(e.target.value)}
                      aria-label="Số học sinh từ 01 đến 40"
                    />
                    <button type="button" onClick={() => applyStudentNo(String(Number(studentNo) + 1))} aria-label="Tăng">
                      +
                    </button>
                  </div>
                </label>
              ) : null}

              {mode === "up" ? (
                <label className="gate__field">
                  Tên trên thẻ
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nguyễn Văn A" />
                </label>
              ) : null}

              <label className="gate__field">
                Email
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>

              <label className="gate__field">
                Mật khẩu
                <div className="gate__pass">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)}>
                    {showPass ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </label>

              {error ? <p className="gate__alert is-bad">{error}</p> : null}
              {info ? <p className="gate__alert is-ok">{info}</p> : null}

              <button className="gate__submit" type="submit" disabled={busy}>
                {busy ? "Đang mở cổng..." : mode === "in" ? "Vào lớp!" : "Nhận thẻ học viên"}
              </button>

              {gate === "student" ? (
                <button
                  className="gate__switch"
                  type="button"
                  onClick={() => {
                    setMode(mode === "in" ? "up" : "in");
                    setError(null);
                    setInfo(null);
                  }}
                >
                  {mode === "in" ? "Chưa có thẻ? Đăng ký học viên mới" : "Đã có thẻ? Đăng nhập tại đây"}
                </button>
              ) : (
                <p className="gate__hint">GVCN lớp test: Nguyễn Trúc Quỳnh</p>
              )}
            </form>
          )}

          <div className="gate__footer">
            <span>Lớp test · mật khẩu chung</span>
            <strong>Pass01</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function translateAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login")) return "Sai email hoặc mật khẩu. Thử lại như làm lại một bài tập nhé!";
  if (lower.includes("email not confirmed")) return "Email chưa xác nhận. Kiểm tra hộp thư rồi quay lại cổng.";
  if (lower.includes("already registered")) return "Email này đã có thẻ học viên. Hãy đăng nhập.";
  return message;
}
