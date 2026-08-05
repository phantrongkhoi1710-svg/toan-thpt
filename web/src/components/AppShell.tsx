import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import type { Lesson } from "../lib/schema";
import { lessons } from "../lessons/registry";

function BrandMark({ kind }: { kind: Lesson["theme"]["brandMark"] }) {
  if (kind === "venn") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="12" r="5" />
        <circle cx="15" cy="12" r="5" />
      </svg>
    );
  }
  if (kind === "cinema") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 6V4h10v2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

interface AppShellProps {
  children: ReactNode;
  lesson?: Lesson;
  active?: "home" | "slides" | "challenge";
  searchPlaceholder?: string;
  topAction?: ReactNode;
  foot?: ReactNode;
}

export function AppShell({
  children,
  lesson,
  active = "home",
  searchPlaceholder = "Tìm bài giảng, bài tập...",
  topAction,
  foot,
}: AppShellProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("sidebar-open", open);
    return () => document.body.classList.remove("sidebar-open");
  }, [open]);
  const markStyle = lesson
    ? { background: `linear-gradient(135deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})` }
    : undefined;

  return (
    <>
      <div className="overlay" hidden={!open} onClick={() => setOpen(false)} />
      <div className={`app${open ? " sidebar-open-wrap" : ""}`}>
        <aside className="sidebar" id="sidebar">
          <Link className="brand" to="/">
            <span className="brand__mark" style={markStyle} aria-hidden="true">
              <BrandMark kind={lesson?.theme.brandMark ?? "book"} />
            </span>
            Toán THPT
          </Link>
          <nav aria-label="Menu chính">
            <p className="nav-group__label">Học tập</p>
            <ul className="nav-list">
              <li>
                <NavLink to="/" className={() => (active === "home" && !lesson ? "is-active" : "")} end>
                  <span className="ico">⌂</span> Trang chủ
                </NavLink>
              </li>
              {lesson ? (
                <>
                  <li>
                    <NavLink
                      to={`/bai/${lesson.slug}/slides`}
                      className={() => (active === "slides" ? "is-active" : "")}
                    >
                      <span className="ico">▣</span> Slide {lesson.shortTitle}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to={`/bai/${lesson.slug}/challenge`}
                      className={() => (active === "challenge" ? "is-active" : "")}
                    >
                      <span className="ico">✎</span> {lesson.theme.mapName}
                      {lesson.isNew ? <span className="badge-new">Mới</span> : null}
                    </NavLink>
                  </li>
                </>
              ) : (
                <li>
                  <NavLink to={`/bai/${lessons[lessons.length - 1].slug}/challenge`}>
                    <span className="ico">🎟</span> {lessons[lessons.length - 1].theme.mapName}
                    <span className="badge-new">Mới</span>
                  </NavLink>
                </li>
              )}
            </ul>
            <p className="nav-group__label">Chương I</p>
            <ul className="nav-list">
              {lessons.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={`/bai/${item.slug}/slides`}
                    className={({ isActive }) => (isActive || lesson?.id === item.id ? "is-active" : "")}
                  >
                    <span className="ico">{item.number}</span> {item.shortTitle}
                    {item.isNew ? <span className="badge-new">Mới</span> : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="sidebar__foot">
            {foot ?? (
              <>
                <strong>{lesson ? lesson.theme.mapName : "Hệ thống bài giảng"}</strong>
                {lesson
                  ? lesson.sidebarFoot
                  : "Mỗi bài = slide chuẩn + challenge map. Thêm bài mới chỉ cần một file dữ liệu."}
              </>
            )}
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
              <div
                className="avatar"
                title="Học sinh"
                style={
                  lesson
                    ? { background: `linear-gradient(135deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})` }
                    : undefined
                }
              >
                HS
              </div>
            </div>
          </header>
          <main className="content">{children}</main>
        </div>
      </div>
    </>
  );
}
