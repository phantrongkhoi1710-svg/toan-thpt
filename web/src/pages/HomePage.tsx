import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { lessons } from "../lessons/registry";

export function HomePage() {
  const newest = lessons[lessons.length - 1];
  const prev = lessons[lessons.length - 2];

  return (
    <AppShell>
      <div className="dash">
        <div className="dash__main">
          <section className="card welcome">
            <div>
              <h1>Chào bạn! Sẵn sàng học Toán chưa?</h1>
              <p>
                Hệ thống bài giảng chuẩn: slide tương tác + challenge map. Mới nhất:{" "}
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
              <div className="stat__label">Challenge map</div>
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
            {prev ? (
              <Link
                className="promo promo--orange"
                to={`/bai/${prev.slug}/slides`}
                style={{ background: `linear-gradient(145deg, ${prev.theme.accentFrom}, ${prev.theme.accentTo} 55%, #0f172a)` }}
              >
                <div>
                  <h3>
                    Bài {prev.number} · {prev.theme.mapName}
                  </h3>
                  <p>{prev.blurb}</p>
                </div>
                <div className="promo__emoji" aria-hidden="true">
                  {prev.number}
                </div>
              </Link>
            ) : null}
            <Link
              className="promo promo--blue"
              to={`/bai/${newest.slug}/slides`}
              style={{ background: `linear-gradient(145deg, ${newest.theme.accentFrom}, ${newest.theme.accentTo} 55%, #4c1d95)` }}
            >
              <div>
                <h3>
                  Bài {newest.number} · {newest.theme.mapName}
                </h3>
                <p>{newest.blurb}</p>
              </div>
              <div className="promo__emoji" aria-hidden="true">
                {newest.number}
              </div>
            </Link>
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
                  <strong>
                    Bài {lesson.number} · {lesson.shortTitle}
                  </strong>
                  <span>{lesson.theme.mapName}</span>
                  <div className="lesson-mini__foot">
                    <div className="avatars">
                      <span>{lesson.number}</span>
                    </div>
                    <Link className="plus" to={`/bai/${lesson.slug}/slides`}>
                      +
                    </Link>
                  </div>
                </li>
              ))}
              <li className="lesson-mini">
                <strong>{newest.theme.mapName}</strong>
                <span>{newest.challenges.length} suất challenge</span>
                <div className="lesson-mini__foot">
                  <div className="avatars">
                    <span>★</span>
                  </div>
                  <Link className="plus" to={`/bai/${newest.slug}/challenge`}>
                    +
                  </Link>
                </div>
              </li>
            </ul>
          </section>
          <section className="card" style={{ marginTop: "1rem" }}>
            <div className="card__head">
              <h3>Thêm bài mới</h3>
            </div>
            <p style={{ margin: "0 1.1rem 1.1rem", color: "#64748b", fontSize: "0.92rem" }}>
              Copy file <code>web/src/lessons/_template.ts</code>, điền slide + câu hỏi, rồi đăng ký trong{" "}
              <code>registry.ts</code>. Engine slide và map dùng chung, không copy HTML nữa.
            </p>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
