import { useEffect, useState, useMemo, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLessons } from "../lib/lessonsStore";
import { useAuth } from "../lib/auth";
import { getSelectedClassroom } from "../lib/classrooms";

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
  const { lessons, chapters } = useLessons();

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const currentLesson = lessons.find((l) => location.pathname.includes(`/bai/${l.slug}/`));
    if (currentLesson) {
      return { [currentLesson.chapter]: true };
    }
    return {};
  });

  useEffect(() => {
    const currentLesson = lessons.find((l) => location.pathname.includes(`/bai/${l.slug}/`));
    if (currentLesson) {
      setExpandedChapters(prev => ({ ...prev, [currentLesson.chapter]: true }));
    }
  }, [location.pathname, lessons]);

  const toggleChapter = (chapter: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapter]: !prev[chapter] }));
  };

  const lessonsByChapter = useMemo(() => {
    const groups: Record<string, typeof lessons> = {};
    for (const ch of chapters) {
      groups[ch] = [];
    }
    for (const lesson of lessons) {
      if (!groups[lesson.chapter]) {
        groups[lesson.chapter] = [];
      }
      groups[lesson.chapter].push(lesson);
    }
    return groups;
  }, [lessons, chapters]);
  useEffect(() => {
    document.body.classList.toggle("sidebar-open", open);
    return () => document.body.classList.remove("sidebar-open");
  }, [open]);

  const close = () => setOpen(false);
  const { configured, user, profile, signOut } = useAuth();
  const classroom = getSelectedClassroom();

  return (
    <>
      <div className="overlay" hidden={!open} onClick={close} />
      <div className="app">
        <aside className="sidebar" id="sidebar">
          <Link className="brand" to={user ? "/" : "/dang-nhap"} onClick={close}>
            <span className="brand__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </span>
            Toán THPT
          </Link>

          <nav aria-label="Menu chính">
            {!user ? (
              <>
                <p className="nav-group__label">Tài khoản</p>
                <ul className="nav-list">
                  <li>
                    <NavLink to="/dang-nhap" className={({ isActive }) => (isActive ? "is-active" : undefined)} onClick={close}>
                      <span className="ico">⇨</span> Đăng nhập
                    </NavLink>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <p className="nav-group__label">Chung</p>
                <ul className="nav-list">
                  <li>
                    <NavLink to="/" end className={({ isActive }) => (isActive ? "is-active" : undefined)} onClick={close}>
                      <span className="ico">⌂</span> Trang chủ
                    </NavLink>
                  </li>
                  <li>
                    <button className="nav-text-btn" type="button" onClick={() => void signOut().then(close)}>
                      <span className="ico">⎋</span> Đăng xuất
                    </button>
                  </li>
                  {profile?.role === "teacher" ? (
                    <>
                      <li>
                        <NavLink
                          to="/soan-bai"
                          className={({ isActive }) => (isActive ? "is-active" : undefined)}
                          onClick={close}
                        >
                          <span className="ico">✏️</span> Soạn bài học
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/quan-tri"
                          className={({ isActive }) => (isActive ? "is-active" : undefined)}
                          onClick={close}
                        >
                          <span className="ico">▣</span> Giám sát
                        </NavLink>
                      </li>
                    </>
                  ) : null}
                </ul>

                {Object.entries(lessonsByChapter).map(([chapter, chapterLessons]) => (
                  <div key={chapter} className="nav-chapter-group">
                    <button 
                      className="nav-group__label nav-group__toggle" 
                      onClick={() => toggleChapter(chapter)}
                      type="button"
                    >
                      {chapter}
                      <span className={`toggle-icon ${expandedChapters[chapter] ? "is-open" : ""}`}>
                        ▼
                      </span>
                    </button>
                    <div className={`nav-chapter-lessons ${expandedChapters[chapter] ? "is-open" : ""}`}>
                      <div className="nav-chapter-lessons-inner">
                        {chapterLessons.map((item) => (
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
                                <span className="ico">▣</span> Bài giảng
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
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </nav>

          <div className="sidebar__foot">
            <strong>{user ? profile?.display_name || user.email : "Chưa đăng nhập"}</strong>
            {configured
              ? user
                ? profile?.role === "teacher"
                  ? `Giáo viên · ${classroom.name}`
                  : `Học sinh · ${classroom.name}`
                : "Đăng nhập để lưu tiến độ và để giáo viên theo dõi."
              : "Xem bài giảng trước, rồi làm thử thách của cùng bài đó."}
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
              {user && (
                <div className="avatar" title={profile?.display_name || user?.email || "Học sinh"}>
                  {(profile?.display_name || user?.email || "HS").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </header>
          <main className="content">{children}</main>
        </div>
      </div>
    </>
  );
}
