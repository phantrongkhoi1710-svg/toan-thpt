import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useAuth } from "../lib/auth";
import type { Lesson } from "../lib/schema";
import {
  useLessons,
  createEmptyLesson,
  saveLesson,
  deleteLesson,
  saveStoredChapters,
  DEFAULT_LESSONS,
} from "../lib/lessonsStore";
import { LessonEditorModal } from "../components/studio/LessonEditorModal";

export function TeacherStudioPage() {
  const { profile, loading: authLoading } = useAuth();
  const { lessons, chapters, loading } = useLessons();

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newChapterModal, setNewChapterModal] = useState(false);
  const [chapterNameInput, setChapterNameInput] = useState("");

  if (authLoading || loading) {
    return (
      <AppShell>
        <p>Đang tải dữ liệu bài học...</p>
      </AppShell>
    );
  }

  if (profile?.role !== "teacher") {
    return (
      <AppShell>
        <section className="card auth-card">
          <h2>Soạn bài học (Teacher Studio)</h2>
          <p>Mục này chỉ dành cho tài khoản giáo viên.</p>
          <p className="auth-note">
            Đăng nhập giáo viên: <code>gv.quynh@toanthpt.test</code> / <code>Pass01</code>
          </p>
        </section>
      </AppShell>
    );
  }

  // Nhóm bài học theo từng chương
  const lessonsByChapter: Record<string, Lesson[]> = {};
  for (const ch of chapters) {
    lessonsByChapter[ch] = [];
  }
  for (const lesson of lessons) {
    if (!lessonsByChapter[lesson.chapter]) {
      lessonsByChapter[lesson.chapter] = [];
    }
    lessonsByChapter[lesson.chapter].push(lesson);
  }

  const handleCreateLessonInChapter = (chapter: string) => {
    const nextNumber = (lessons.reduce((max, l) => Math.max(max, l.number), 0) || 0) + 1;
    const newLesson = createEmptyLesson(chapter, nextNumber);
    setEditingLesson(newLesson);
  };

  const handleAddChapter = () => {
    const name = chapterNameInput.trim();
    if (!name) return;
    if (chapters.includes(name)) {
      alert("Chương này đã tồn tại.");
      return;
    }
    saveStoredChapters([...chapters, name]);
    setChapterNameInput("");
    setNewChapterModal(false);
  };

  const handleRenameChapter = (oldName: string) => {
    const newName = prompt("Nhập tên mới cho chương:", oldName);
    if (!newName || newName.trim() === "" || newName === oldName) return;

    const updatedChapters = chapters.map((c) => (c === oldName ? newName.trim() : c));
    saveStoredChapters(updatedChapters);

    // Cập nhật lại các bài học thuộc chương cũ
    for (const l of lessons) {
      if (l.chapter === oldName) {
        void saveLesson({ ...l, chapter: newName.trim() });
      }
    }
  };

  const handleDeleteChapter = (chapterName: string) => {
    const count = lessonsByChapter[chapterName]?.length || 0;
    if (count > 0) {
      alert(`Chương "${chapterName}" đang có ${count} bài học. Hãy chuyển hoặc xóa các bài học trước khi xóa chương.`);
      return;
    }
    if (!confirm(`Xóa chương "${chapterName}"?`)) return;
    saveStoredChapters(chapters.filter((c) => c !== chapterName));
  };

  const handleCloneLesson = async (lesson: Lesson) => {
    const nextNum = (lessons.reduce((max, l) => Math.max(max, l.number), 0) || 0) + 1;
    const cloned: Lesson = {
      ...JSON.parse(JSON.stringify(lesson)),
      id: `bai-${nextNum}`,
      number: nextNum,
      slug: `${lesson.slug}-sao-${nextNum}`,
      title: `${lesson.title} (Bản sao)`,
      shortTitle: `${lesson.shortTitle} (Sao)`,
      progressKey: `toan-thpt-map-bai-${nextNum}-v1`,
    };
    await saveLesson(cloned);
    setEditingLesson(cloned);
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    const isDefault = DEFAULT_LESSONS.some((l) => l.id === lesson.id);
    const msg = isDefault
      ? `Bài "${lesson.title}" là bài mẫu. Bạn có chắc muốn xóa bài này khỏi danh sách?`
      : `Bạn có chắc muốn xóa vĩnh viễn bài "${lesson.title}"?`;
    if (!confirm(msg)) return;
    await deleteLesson(lesson.id);
  };

  const totalSlides = lessons.reduce((sum, l) => sum + (l.slides?.length || 0), 0);
  const totalChallenges = lessons.reduce((sum, l) => sum + (l.challenges?.length || 0), 0);

  return (
    <AppShell searchPlaceholder="Tìm bài soạn...">
      <div className="studio-page">
        {/* Header Studio */}
        <div className="page-head" style={{ marginBottom: "1rem" }}>
          <div>
            <h1>Soạn bài học & Quản trị (Teacher Studio)</h1>
            <p>
              Cấu trúc phân cấp chuẩn: <strong>Chương → Bài học → Bài giảng (Slide) + Thử thách</strong>
            </p>
          </div>
          <div className="head-actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setNewChapterModal(true)}
            >
              + Thêm Chương mới
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => handleCreateLessonInChapter(chapters[0] || "Chương I")}
            >
              + Soạn Bài học mới
            </button>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <section className="stats" style={{ marginBottom: "1.25rem" }}>
          <div className="stat stat--blue">
            <div className="stat__label">Chương học</div>
            <div className="stat__value">{String(chapters.length).padStart(2, "0")}</div>
            <div className="stat__hint">Phân cấp lớn</div>
          </div>
          <div className="stat stat--teal">
            <div className="stat__label">Bài học</div>
            <div className="stat__value">{String(lessons.length).padStart(2, "0")}</div>
            <div className="stat__hint">Tổng số bài</div>
          </div>
          <div className="stat stat--orange">
            <div className="stat__label">Slide bài giảng</div>
            <div className="stat__value">{String(totalSlides).padStart(2, "0")}</div>
            <div className="stat__hint">Trình chiếu & PDF</div>
          </div>
          <div className="stat stat--rose">
            <div className="stat__label">Câu hỏi Thử thách</div>
            <div className="stat__value">{String(totalChallenges).padStart(2, "0")}</div>
            <div className="stat__hint">4 Mức độ</div>
          </div>
        </section>

        {/* Danh sách phân cấp Chương -> Bài */}
        <div className="chapters-container">
          {chapters.map((chapterName) => {
            const chapterLessons = lessonsByChapter[chapterName] || [];

            return (
              <div key={chapterName} className="chapter-block card">
                <div className="chapter-block__head">
                  <div className="chapter-title-group">
                    <span className="chapter-ico">📚</span>
                    <h2>{chapterName}</h2>
                    <span className="count-tag">{chapterLessons.length} bài học</span>
                  </div>

                  <div className="chapter-actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleCreateLessonInChapter(chapterName)}
                    >
                      + Thêm bài vào chương
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      title="Đổi tên chương"
                      onClick={() => handleRenameChapter(chapterName)}
                    >
                      ✏️ Đổi tên
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm del-btn"
                      title="Xóa chương"
                      onClick={() => handleDeleteChapter(chapterName)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="chapter-lessons-grid">
                  {chapterLessons.length === 0 ? (
                    <div className="empty-chapter-box">
                      <p>Chưa có bài học nào trong chương này.</p>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => handleCreateLessonInChapter(chapterName)}
                      >
                        + Tạo bài đầu tiên cho {chapterName}
                      </button>
                    </div>
                  ) : (
                    chapterLessons.map((lesson) => (
                      <div key={lesson.id} className="lesson-studio-card">
                        <div
                          className="card-accent-bar"
                          style={{
                            background: `linear-gradient(135deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})`,
                          }}
                        />
                        <div className="lesson-studio-card__body">
                          <div className="lesson-badge-row">
                            <span className="num-badge">Bài {lesson.number}</span>
                            <span className="period-badge">{lesson.periods} tiết</span>
                            {lesson.isNew && <span className="badge-new">Mới</span>}
                          </div>

                          <h3 className="lesson-title">{lesson.title}</h3>
                          <p className="lesson-blurb">{lesson.blurb || "Chưa có tóm tắt"}</p>

                          <div className="lesson-content-summary">
                            <div className="summary-pill">
                              <span>📖 {lesson.slides?.length || 0} slide bài giảng</span>
                            </div>
                            <div className="summary-pill">
                              <span>🏆 {lesson.challenges?.length || 0} câu thử thách</span>
                            </div>
                          </div>

                          <div className="lesson-card-actions">
                            <button
                              type="button"
                              className="btn btn--primary btn--sm"
                              onClick={() => setEditingLesson(lesson)}
                              style={{
                                background: `linear-gradient(135deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})`,
                                flex: 1,
                              }}
                            >
                              ✏️ Soạn & Sửa bài
                            </button>
                            <Link
                              to={`/bai/${lesson.slug}/slides`}
                              className="btn btn--ghost btn--sm"
                              title="Xem giao diện bài giảng"
                            >
                              👁️ Xem
                            </Link>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              title="Nhân bản bài này"
                              onClick={() => handleCloneLesson(lesson)}
                            >
                              📋 Nhân bản
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm del-btn"
                              title="Xóa bài học"
                              onClick={() => handleDeleteLesson(lesson)}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Thêm chương mới */}
        {newChapterModal && (
          <div className="modal-overlay" onClick={() => setNewChapterModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>+ Thêm Chương học mới</h3>
                <button type="button" className="icon-btn" onClick={() => setNewChapterModal(false)}>
                  ✕
                </button>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <label>
                  Tên chương (ví dụ: Chương II: Bất phương trình và hệ bất phương trình):
                  <input
                    type="text"
                    placeholder="Chương II: ..."
                    value={chapterNameInput}
                    onChange={(e) => setChapterNameInput(e.target.value)}
                    style={{ width: "100%", marginTop: "0.5rem", padding: "0.5rem" }}
                  />
                </label>
                <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <button type="button" className="btn btn--ghost" onClick={() => setNewChapterModal(false)}>
                    Hủy
                  </button>
                  <button type="button" className="btn btn--primary" onClick={handleAddChapter}>
                    Tạo chương
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Soạn bài học (3 cấp độ) */}
        {editingLesson && (
          <LessonEditorModal
            initialLesson={editingLesson}
            chapters={chapters}
            onSave={() => {
              // Store automatically triggers refresh
            }}
            onClose={() => setEditingLesson(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
