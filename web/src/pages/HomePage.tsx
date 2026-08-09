import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useLessons } from "../lib/lessonsStore";

export function HomePage() {
  const { lessons } = useLessons();
  const newest = lessons[lessons.length - 1] || lessons[0];

  return (
    <AppShell>
      <div className="dash">
        <div className="dash__main">
          <section className="card welcome">
            <div>
              <h1>Chào bạn! Sẵn sàng học Toán chưa?</h1>
              <p>
                Hệ thống bài giảng chuẩn: bài giảng tương tác + thử thách. Mới nhất:{" "}
                <strong>
                  Bài {newest.number} · {newest.theme.mapName}
                </strong>{" "}
                — {newest.blurb}
              </p>
              <div className="btn-row">
                <Link className="btn btn--primary" to={`/bai/${newest.slug}/slides`}>
                  Xem Bài {newest.number}
                </Link>
                <Link className="btn btn--ghost" to={`/bai/${newest.slug}/challenge`}>
                  {newest.theme.mapName}
                </Link>
              </div>
            </div>
            <svg className="welcome__art" viewBox="0 0 220 140" fill="none" aria-hidden="true">
              <rect x="40" y="30" width="120" height="80" rx="12" fill="#fff" />
              <rect x="52" y="42" width="96" height="48" rx="6" fill="#dbeafe" />
              <circle cx="100" cy="66" r="14" fill="#3b82f6" opacity="0.9" />
              <text x="100" y="71" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="Be Vietnam Pro, sans-serif" fontWeight="700">
                P
              </text>
              <rect x="150" y="55" width="50" height="55" rx="10" fill="#fdba74" />
              <circle cx="175" cy="48" r="14" fill="#fb923c" />
              <path d="M20 110h180" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round" />
              <circle cx="48" cy="108" r="10" fill="#14b8a6" />
              <circle cx="175" cy="108" r="10" fill="#8b5cf6" />
            </svg>
          </section>

          <section className="stats">
            <div className="stat stat--blue">
              <div className="stat__label">Bài đã mở</div>
              <div className="stat__value">{String(lessons.length).padStart(2, "0")}</div>
              <div className="stat__hint">Chương I</div>
            </div>
            <div className="stat stat--orange">
              <div className="stat__label">Thử thách</div>
              <div className="stat__value">{String(lessons.length).padStart(2, "0")}</div>
              <div className="stat__hint">Mỗi bài 1 theme</div>
            </div>
            <div className="stat stat--teal">
              <div className="stat__label">Bài mới</div>
              <div className="stat__value">{String(newest.number).padStart(2, "0")}</div>
              <div className="stat__hint">{newest.theme.mapName}</div>
            </div>
          </section>

          <section className="promos">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                className="promo"
                to={`/bai/${lesson.slug}/slides`}
                style={{
                  background: `linear-gradient(145deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo} 55%, #0f172a)`,
                }}
              >
                <div>
                  <h3>
                    Bài {lesson.number} · {lesson.shortTitle}
                  </h3>
                  <p>{lesson.blurb}</p>
                </div>
                <div className="promo__emoji" aria-hidden="true">
                  {lesson.number}
                </div>
              </Link>
            ))}
          </section>
        </div>

        <aside className="dash__side">
          <section className="card">
            <div className="card__head">
              <h3>Bài học</h3>
              <Link className="link-soft" to={`/bai/${lessons[0].slug}/slides`}>
                Xem tất cả
              </Link>
            </div>
            <ul className="lesson-stack">
              {lessons.map((lesson) => (
                <li className="lesson-mini" key={lesson.id}>
                  <Link to={`/bai/${lesson.slug}/slides`} style={{ color: "inherit", textDecoration: "none", display: "block" }}>
                    <strong>
                      Bài {lesson.number} · {lesson.shortTitle}
                    </strong>
                    <span>{lesson.theme.mapName}</span>
                    <div className="lesson-mini__foot">
                      <div className="avatars">
                        <span>{lesson.number}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="card" style={{ marginTop: "1rem" }}>
            <div className="card__head">
              <h3>Soạn bài mới</h3>
            </div>
            <p style={{ margin: "0 1.1rem 1.1rem", color: "#64748b", fontSize: "0.92rem" }}>
              Sử dụng <strong>Teacher Studio</strong> để tạo bài giảng, câu hỏi thử thách, tải PDF và thiết kế lộ trình học tập trực quan ngay trên trình duyệt.
            </p>
            <div style={{ margin: "0 1.1rem 1.1rem" }}>
              <Link to="/soan-bai" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
                Vào Teacher Studio
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
