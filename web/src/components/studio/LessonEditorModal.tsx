import { useState } from "react";
import type { Lesson, LessonTheme } from "../../lib/schema";
import { SlideEditorTab } from "./SlideEditorTab";
import { ChallengeEditorTab } from "./ChallengeEditorTab";
import { THEME_PRESETS, saveLesson, resetDefaultLesson, DEFAULT_LESSONS } from "../../lib/lessonsStore";

interface LessonEditorModalProps {
  initialLesson: Lesson;
  chapters: string[];
  onSave: (lesson: Lesson) => void;
  onClose: () => void;
}

export function LessonEditorModal({
  initialLesson,
  chapters,
  onSave,
  onClose,
}: LessonEditorModalProps) {
  const [lesson, setLesson] = useState<Lesson>(() => JSON.parse(JSON.stringify(initialLesson)));
  const [activeTab, setActiveTab] = useState<"general" | "slides" | "challenges">("general");
  const [saving, setSaving] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");
  const [isCreatingNewChapter, setIsCreatingNewChapter] = useState(false);

  const isDefaultLesson = DEFAULT_LESSONS.some((l) => l.id === lesson.id);

  const handleSave = async () => {
    if (!lesson.title.trim()) {
      alert("Vui lòng nhập tên bài học.");
      return;
    }
    if (!lesson.slug.trim()) {
      alert("Vui lòng nhập định danh đường dẫn (slug).");
      return;
    }
    if (lesson.slides.length === 0) {
      alert("Bài học cần ít nhất 1 slide bài giảng.");
      return;
    }
    if (lesson.challenges.length === 0) {
      alert("Bài học cần ít nhất 1 câu hỏi thử thách.");
      return;
    }

    setSaving(true);
    try {
      await saveLesson(lesson);
      onSave(lesson);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu bài học.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = async () => {
    if (!confirm(`Khôi phục nội dung Bài ${lesson.number} về mặc định ban đầu?`)) return;
    setSaving(true);
    await resetDefaultLesson(lesson.id);
    const original = DEFAULT_LESSONS.find((l) => l.id === lesson.id);
    if (original) {
      setLesson(JSON.parse(JSON.stringify(original)));
    }
    setSaving(false);
    alert("Đã khôi phục về bài học gốc!");
  };

  const applyThemePreset = (preset: typeof THEME_PRESETS[0]) => {
    const updatedTheme: LessonTheme = {
      ...lesson.theme,
      id: preset.id,
      accentFrom: preset.accentFrom,
      accentTo: preset.accentTo,
      mapName: preset.mapName,
      mapBoardClass: preset.id === "island" ? "map-board--island" : preset.id === "cinema" ? "map-board--cinema" : "",
      nodeClass: preset.id === "island" ? "map-node__btn--island" : preset.id === "cinema" ? "map-node__btn--cinema" : "",
    };
    setLesson({ ...lesson, theme: updatedTheme });
  };

  return (
    <div className="studio-modal-overlay">
      <div className="studio-modal-window">
        {/* Thanh tiêu đề & nút lưu */}
        <div className="studio-modal-header">
          <div className="header-info">
            <span className="chapter-tag">{lesson.chapter}</span>
            <h2>Soạn bài: {lesson.title}</h2>
          </div>
          <div className="header-actions">
            {isDefaultLesson && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                title="Khôi phục lại phiên bản gốc ban đầu"
                onClick={handleResetDefault}
                disabled={saving}
              >
                ↺ Khôi phục gốc
              </button>
            )}
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Đóng
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSave}
              disabled={saving}
              style={{ background: `linear-gradient(135deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})` }}
            >
              {saving ? "Đang lưu..." : "💾 Lưu bài học"}
            </button>
          </div>
        </div>

        {/* 3 Tab Cấp độ: Thông tin chung -> Bài giảng -> Thử thách */}
        <div className="studio-nav-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "general" ? "is-active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            ⚙️ 1. Thông tin chung & Chương
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "slides" ? "is-active" : ""}`}
            onClick={() => setActiveTab("slides")}
          >
            📖 2. Bài giảng ({lesson.slides.length} slide)
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "challenges" ? "is-active" : ""}`}
            onClick={() => setActiveTab("challenges")}
          >
            🏆 3. Thử thách ({lesson.challenges.length} câu)
          </button>
        </div>

        {/* Nội dung Tab */}
        <div className="studio-tab-body">
          {activeTab === "general" && (
            <div className="general-settings-pane">
              <div className="editor-card">
                <h3>Phân loại Chương & Thông tin bài học</h3>

                <div className="form-grid">
                  <label>
                    Chương trực thuộc:
                    {!isCreatingNewChapter ? (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem" }}>
                        <select
                          value={lesson.chapter}
                          onChange={(e) => setLesson({ ...lesson, chapter: e.target.value })}
                          style={{ flex: 1 }}
                        >
                          {chapters.map((ch) => (
                            <option key={ch} value={ch}>
                              {ch}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setIsCreatingNewChapter(true)}
                        >
                          + Thêm chương mới
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem" }}>
                        <input
                          type="text"
                          placeholder="Nhập tên chương mới (ví dụ: Chương II: Bất đẳng thức)"
                          value={newChapterName}
                          onChange={(e) => setNewChapterName(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => {
                            if (newChapterName.trim()) {
                              setLesson({ ...lesson, chapter: newChapterName.trim() });
                              setIsCreatingNewChapter(false);
                            }
                          }}
                        >
                          Dùng chương này
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setIsCreatingNewChapter(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </label>

                  <label>
                    Số thứ tự bài:
                    <input
                      type="number"
                      min={1}
                      value={lesson.number}
                      onChange={(e) => setLesson({ ...lesson, number: Number(e.target.value) })}
                    />
                  </label>
                </div>

                <div className="form-grid" style={{ marginTop: "1rem" }}>
                  <label>
                    Tên bài học đầy đủ:
                    <input
                      type="text"
                      placeholder="Ví dụ: Bài 1. Mệnh đề"
                      value={lesson.title}
                      onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
                    />
                  </label>

                  <label>
                    Tên ngắn (hiển thị trên menu sidebar):
                    <input
                      type="text"
                      placeholder="Ví dụ: Mệnh đề"
                      value={lesson.shortTitle}
                      onChange={(e) => setLesson({ ...lesson, shortTitle: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid" style={{ marginTop: "1rem" }}>
                  <label>
                    Đường dẫn (Slug URL):
                    <input
                      type="text"
                      placeholder="menh-de"
                      value={lesson.slug}
                      onChange={(e) => setLesson({ ...lesson, slug: e.target.value })}
                    />
                  </label>

                  <label>
                    Số tiết giảng dạy:
                    <input
                      type="number"
                      min={1}
                      value={lesson.periods}
                      onChange={(e) => setLesson({ ...lesson, periods: Number(e.target.value) })}
                    />
                  </label>
                </div>

                <label style={{ marginTop: "1rem" }}>
                  Tóm tắt ngắn / Blurb:
                  <input
                    type="text"
                    placeholder="Ví dụ: Logic · phủ định · kéo theo · ∀ ∃"
                    value={lesson.blurb}
                    onChange={(e) => setLesson({ ...lesson, blurb: e.target.value })}
                  />
                </label>
              </div>

              {/* Theme & Giao diện */}
              <div className="editor-card" style={{ marginTop: "1rem" }}>
                <h3>Giao diện & Theme màu chủ đề</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                  Chọn nhanh bảng màu có sẵn hoặc tùy chỉnh tự do theo sở thích:
                </p>

                <div className="theme-preset-grid">
                  {THEME_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      className={`theme-preset-card ${lesson.theme.accentFrom === preset.accentFrom && lesson.theme.accentTo === preset.accentTo ? "is-selected" : ""}`}
                      onClick={() => applyThemePreset(preset)}
                    >
                      <div
                        className="color-bar"
                        style={{ background: `linear-gradient(135deg, ${preset.accentFrom}, ${preset.accentTo})` }}
                      />
                      <strong>{preset.name}</strong>
                      <span>{preset.accentFrom} → {preset.accentTo}</span>
                    </div>
                  ))}
                </div>

                {/* Tùy chỉnh màu Gradient tự do */}
                <div className="custom-color-panel" style={{ marginTop: "1.25rem", padding: "1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>🎨 Tự chọn mã màu Gradient tùy ý</h4>
                  
                  <div className="form-grid">
                    <label>
                      Màu bắt đầu (Accent From):
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.3rem" }}>
                        <input
                          type="color"
                          value={lesson.theme.accentFrom.startsWith("#") ? lesson.theme.accentFrom : "#3b82f6"}
                          onChange={(e) =>
                            setLesson({
                              ...lesson,
                              theme: { ...lesson.theme, accentFrom: e.target.value },
                            })
                          }
                          style={{ width: "42px", height: "38px", padding: "2px", cursor: "pointer", borderRadius: "6px" }}
                        />
                        <input
                          type="text"
                          value={lesson.theme.accentFrom}
                          onChange={(e) =>
                            setLesson({
                              ...lesson,
                              theme: { ...lesson.theme, accentFrom: e.target.value },
                            })
                          }
                          style={{ flex: 1 }}
                        />
                      </div>
                    </label>

                    <label>
                      Màu kết thúc (Accent To):
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.3rem" }}>
                        <input
                          type="color"
                          value={lesson.theme.accentTo.startsWith("#") ? lesson.theme.accentTo : "#2563eb"}
                          onChange={(e) =>
                            setLesson({
                              ...lesson,
                              theme: { ...lesson.theme, accentTo: e.target.value },
                            })
                          }
                          style={{ width: "42px", height: "38px", padding: "2px", cursor: "pointer", borderRadius: "6px" }}
                        />
                        <input
                          type="text"
                          value={lesson.theme.accentTo}
                          onChange={(e) =>
                            setLesson({
                              ...lesson,
                              theme: { ...lesson.theme, accentTo: e.target.value },
                            })
                          }
                          style={{ flex: 1 }}
                        />
                      </div>
                    </label>
                  </div>

                  {/* Thanh xem trước nút và gradient */}
                  <div style={{ marginTop: "0.85rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Xem trước nút bấm:</span>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      style={{ background: `linear-gradient(135deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})` }}
                    >
                      Nút bấm mẫu ✨
                    </button>
                    <div
                      style={{
                        flex: 1,
                        minWidth: "120px",
                        height: "28px",
                        borderRadius: "6px",
                        background: `linear-gradient(135deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})`,
                      }}
                    />
                  </div>
                </div>

                <div className="form-grid" style={{ marginTop: "1rem" }}>
                  <label>
                    Tên bản đồ Thử thách:
                    <input
                      type="text"
                      placeholder="Ví dụ: Thử thách / Đảo Thử Thách / Rạp Chiếu Phim"
                      value={lesson.theme.mapName}
                      onChange={(e) =>
                        setLesson({
                          ...lesson,
                          theme: { ...lesson.theme, mapName: e.target.value },
                        })
                      }
                    />
                  </label>

                  <label>
                    Đơn vị điểm (XP / Ngọc / Vé / Sao):
                    <input
                      type="text"
                      placeholder="XP"
                      value={lesson.theme.xpLabel}
                      onChange={(e) =>
                        setLesson({
                          ...lesson,
                          theme: { ...lesson.theme, xpLabel: e.target.value },
                        })
                      }
                    />
                  </label>
                </div>

                <div className="form-grid" style={{ marginTop: "1rem" }}>
                  <label>
                    Biểu tượng Rương đóng:
                    <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem" }}>
                      <input
                        type="text"
                        value={lesson.theme.chestClosed}
                        onChange={(e) =>
                          setLesson({
                            ...lesson,
                            theme: { ...lesson.theme, chestClosed: e.target.value },
                          })
                        }
                        style={{ width: "60px", textAlign: "center", fontSize: "1.2rem" }}
                      />
                      <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                        {["📦", "🎁", "🔒", "🪨", "🪙", "🎒", "🪵"].map((emo) => (
                          <button
                            key={emo}
                            type="button"
                            className="icon-btn"
                            style={{ fontSize: "1.1rem" }}
                            onClick={() =>
                              setLesson({
                                ...lesson,
                                theme: { ...lesson.theme, chestClosed: emo },
                              })
                            }
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                    </div>
                  </label>

                  <label>
                    Biểu tượng Rương mở thưởng:
                    <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem" }}>
                      <input
                        type="text"
                        value={lesson.theme.chestOpen}
                        onChange={(e) =>
                          setLesson({
                            ...lesson,
                            theme: { ...lesson.theme, chestOpen: e.target.value },
                          })
                        }
                        style={{ width: "60px", textAlign: "center", fontSize: "1.2rem" }}
                      />
                      <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                        {["🎁", "💎", "🔓", "🌟", "👑", "🏆", "✨"].map((emo) => (
                          <button
                            key={emo}
                            type="button"
                            className="icon-btn"
                            style={{ fontSize: "1.1rem" }}
                            onClick={() =>
                              setLesson({
                                ...lesson,
                                theme: { ...lesson.theme, chestOpen: emo },
                              })
                            }
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                    </div>
                  </label>
                </div>

                <div className="form-grid" style={{ marginTop: "1rem" }}>
                  <label>
                    Thông điệp khi trả lời đúng:
                    <input
                      type="text"
                      placeholder="Chính xác!"
                      value={lesson.theme.successText}
                      onChange={(e) =>
                        setLesson({
                          ...lesson,
                          theme: { ...lesson.theme, successText: e.target.value },
                        })
                      }
                    />
                  </label>

                  <label>
                    Thông điệp khi chưa đúng:
                    <input
                      type="text"
                      placeholder="Chưa đúng."
                      value={lesson.theme.failText}
                      onChange={(e) =>
                        setLesson({
                          ...lesson,
                          theme: { ...lesson.theme, failText: e.target.value },
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "slides" && (
            <SlideEditorTab
              slides={lesson.slides}
              onChange={(slides) => setLesson({ ...lesson, slides })}
            />
          )}

          {activeTab === "challenges" && (
            <ChallengeEditorTab
              challenges={lesson.challenges}
              levelLabels={lesson.levelLabels}
              xpByLevel={lesson.xpByLevel}
              onChange={(challenges) => setLesson({ ...lesson, challenges })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
