import { useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const { configured, user, signIn, signUp } = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={next} replace />;

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
      setError(msg);
      return;
    }
    if (mode === "up") {
      setInfo("Đăng ký thành công. Nếu Supabase bật xác nhận email, hãy kiểm tra hộp thư rồi đăng nhập.");
      setMode("in");
    }
  };

  return (
    <AppShell searchPlaceholder="Tìm...">
      <section className="card auth-card">
        <div className="card__head">
          <h2>{mode === "in" ? "Đăng nhập" : "Tạo tài khoản học sinh"}</h2>
        </div>
        {!configured ? (
          <p className="auth-note">
            Chưa gắn khóa Supabase. Thêm <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> vào{" "}
            <code>web/.env.local</code>, rồi chạy SQL trong dashboard.
          </p>
        ) : (
          <form className="auth-form" onSubmit={onSubmit}>
            {mode === "up" ? (
              <label>
                Họ tên
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nguyễn Văn A" />
              </label>
            ) : null}
            <label>
              Email
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hs@email.com" />
            </label>
            <label>
              Mật khẩu
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {error ? <p className="auth-error">{error}</p> : null}
            {info ? <p className="auth-info">{info}</p> : null}
            <div className="btn-row">
              <button className="btn btn--primary" type="submit" disabled={busy}>
                {busy ? "Đang xử lý..." : mode === "in" ? "Đăng nhập" : "Đăng ký"}
              </button>
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => {
                  setMode(mode === "in" ? "up" : "in");
                  setError(null);
                  setInfo(null);
                }}
              >
                {mode === "in" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
              </button>
            </div>
          </form>
        )}
        <p className="auth-note">
          <Link to="/">← Về trang chủ</Link>
        </p>
      </section>
    </AppShell>
  );
}
