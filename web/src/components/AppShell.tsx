import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { lessons } from "../lessons/registry";
import { useAuth } from "../lib/auth";

interface AppShellProps {
  children: ReactNode;
  searchPlaceholder?: string;
  topAction?: ReactNode;
}

export function AppShell({
  children,
  searchPlaceholder = "Tìm bài giảng, bài tập...",
  topAction,
}: AppShellProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    document.body.classList.toggle("sidebar-open", open);
    return () => document.body.classList.remove("sidebar-open");
  }, [open]);

  const close = () => setOpen(false);
  const { configured, user, profile, signOut } = useAuth();

  return (
    <>
      <div className="overlay" hidden={!open} onClick={close} />
      <div className="app">
        <aside className="sidebar" id="sidebar">
          <Link className="brand" to="/" onClick={close}>
            <span className="brand__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </span>
            Toán THPT
          </Link>

          <nav aria-label="Menu chính">
            <p className="nav-group__label">Chung</p>
            <ul className="nav-list">
              <li>
                <NavLink to="/" end className={({ isActive }) => (isActive ? "is-active" : undefined)} onClick={close}>
                  <span className="ico">⌂</span> Trang chủ
                </NavLink>
              </li>
              <li>
                {user ? (
                  <button className="nav-text-btn" type="button" onClick={() => void signOut().then(close)}>
                    <span className="ico">⎋</span> Đăng xuất
                  </button>
                ) : (
                  <NavLink to="/dang-nhap" className={({ isActive }) => (isActive ? "is-active" : undefined)} onClick={close}>
                    <span className="ico">⇨</span> Đăng nhập
                  </NavLink>
                )}
              </li>
              {profile?.role === "teacher" ? (
                <li>
                  <NavLink
                    to="/quan-tri"
                    className={({ isActive }) => (isActive ? "is-active" : undefined)}
                    onClick={close}
                  >
                    <span className="ico">▣</span> Giám sát
                  </NavLink>
                </li>
              ) : null}
            </ul>

            <p className="nav-group__label">Chương I</p>
            {lessons.map((item) => (
              <div
                className={`nav-lesson${location.pathname.includes(`/bai/${item.slug}/`) ? " is-current" : ""}`}
                key={item.id}
              >
                <div className="nav-lesson__title">
                  <span className="nav-lesson__num">{item.number}</span>
                  <span>{item.shortTitle}</span>
                  {item.isNew ? <span className="badge-new">Mới</span> : null}
                </div>
                <ul className="nav-list">
                  <li>
                    <NavLink
                      to={`/bai/${item.slug}/slides`}
                      className={({ isActive }) => (isActive ? "is-active" : undefined)}
                      onClick={close}
                    >
                      <span className="ico">▣</span> Slide
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to={`/bai/${item.slug}/challenge`}
                      className={({ isActive }) => (isActive ? "is-active" : undefined)}
                      onClick={close}
                    >
                      <span className="ico">✎</span> {item.theme.mapName}
                    </NavLink>
                  </li>
                </ul>
              </div>
            ))}
          </nav>

          <div className="sidebar__foot">
            <strong>{user ? profile?.display_name || user.email : "Chưa đăng nhập"}</strong>
            {configured
              ? user
                ? profile?.role === "teacher"
                  ? "Tài khoản giáo viên · xem Giám sát để theo dõi lớp."
                  : "Tiến độ challenge đang được lưu lên Supabase."
                : "Đăng nhập để lưu tiến độ và để giáo viên theo dõi."
              : "Xem slide trước, rồi làm challenge map của cùng bài đó."}
          </div>
        </aside>

        <div className="main-col">
          <header className="topbar">
            <button className="menu-toggle" type="button" aria-label="Mở menu" onClick={() => setOpen((v) => !v)}>
              ☰
            </button>
            <label className="search">
              <span aria-hidden="true">⌕</span>
              <input type="search" placeholder={searchPlaceholder} />
            </label>
            <div className="topbar__actions">
              {topAction}
              <div className="avatar" title={profile?.display_name || user?.email || "Học sinh"}>
                {(profile?.display_name || user?.email || "HS").slice(0, 2).toUpperCase()}
              </div>
            </div>
          </header>
          <main className="content">{children}</main>
        </div>
      </div>
    </>
  );
}
