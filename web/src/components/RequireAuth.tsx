import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { AppShell } from "./AppShell";

export function RequireAuth({ children, teacherOnly = false }: { children: ReactNode; teacherOnly?: boolean }) {
  const { configured, loading, user, profile } = useAuth();
  const location = useLocation();

  if (!configured) return <>{children}</>;
  if (loading) {
    return (
      <AppShell>
        <p>Đang tải phiên đăng nhập...</p>
      </AppShell>
    );
  }
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/dang-nhap?next=${next}`} replace />;
  }
  if (teacherOnly && profile?.role !== "teacher") {
    return (
      <AppShell>
        <section className="card auth-card">
          <h2>Không đủ quyền</h2>
          <p>Chỉ tài khoản giáo viên mới xem được mục giám sát.</p>
        </section>
      </AppShell>
    );
  }
  return <>{children}</>;
}
