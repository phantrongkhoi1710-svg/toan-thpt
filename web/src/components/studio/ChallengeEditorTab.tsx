import { useState } from "react";
import type { ChallengeQuestion, Level } from "../../lib/schema";
import { MathToolbar } from "./MathToolbar";
import { AssetPickerModal } from "./AssetPickerModal";
import { MathHtml } from "../../lib/math";

interface ChallengeEditorTabProps {
  challenges: ChallengeQuestion[];
  levelLabels: Record<Level, string>;
  xpByLevel: Record<Level, number>;
  onChange: (challenges: ChallengeQuestion[]) => void;
}

const LEVEL_COLORS: Record<Level, string> = {
  1: "#3b82f6",
  2: "#14b8a6",
  3: "#f97316",
  4: "#e11d48",
};

export function ChallengeEditorTab({
  challenges,
  levelLabels,
  xpByLevel,
  onChange,
}: ChallengeEditorTabProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [showAssetModal, setShowAssetModal] = useState(false);

  const currentQ = challenges[selectedIdx] || challenges[0];

  const updateQuestion = (updated: ChallengeQuestion) => {
    const next = [...challenges];
    next[selectedIdx] = updated;
    onChange(next);
  };

  const addQuestion = (level: Level) => {
    const newQ: ChallengeQuestion = {
      level,
      title: `Mốc ${challenges.length + 1}`,
      prompt: "Nhập đề bài câu hỏi tại đây (hỗ trợ công thức \\(x^2\\)).",
      options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
      answer: 0,
      explain: "Giải thích chi tiết các bước làm câu hỏi này.",
    };
    const next = [...challenges, newQ];
    onChange(next);
    setSelectedIdx(next.length - 1);
  };

  const duplicateQuestion = (idx: number) => {
    const item = challenges[idx];
    if (!item) return;
    const cloned: ChallengeQuestion = {
      ...item,
      title: `${item.title} (Bản sao)`,
      options: [...item.options],
    };
    const next = [...challenges];
    next.splice(idx + 1, 0, cloned);
    onChange(next);
    setSelectedIdx(idx + 1);
  };

  const removeQuestion = (idx: number) => {
    if (challenges.length <= 1) {
      alert("Bài học cần có ít nhất 1 câu hỏi thử thách.");
      return;
    }
    if (!confirm(`Xóa câu hỏi mốc số ${idx + 1}?`)) return;
    const next = challenges.filter((_, i) => i !== idx);
    onChange(next);
    setSelectedIdx(Math.max(0, Math.min(next.length - 1, selectedIdx)));
  };

  const insertMath = (tex: string, target: "prompt" | "explain") => {
    if (!currentQ) return;
    if (target === "prompt") {
      updateQuestion({ ...currentQ, prompt: `${currentQ.prompt || ""} ${tex}` });
    } else {
      updateQuestion({ ...currentQ, explain: `${currentQ.explain || ""} ${tex}` });
    }
  };

  return (
    <div className="challenge-editor-container">
      {/* Cột trái: Ngân hàng câu hỏi theo 4 Mức độ */}
      <div className="challenge-sidebar">
        <div className="challenge-sidebar__head">
          <h4>Ngân hàng Thử thách ({challenges.length} câu)</h4>
        </div>

        {([1, 2, 3, 4] as Level[]).map((lv) => {
          const levelItems = challenges
            .map((q, idx) => ({ q, idx }))
            .filter(({ q }) => q.level === lv);

          return (
            <div key={lv} className="challenge-level-group">
              <div className="level-header" style={{ borderLeftColor: LEVEL_COLORS[lv] }}>
                <span className="level-badge" style={{ background: LEVEL_COLORS[lv], color: "#fff" }}>
                  Mức {lv}: {levelLabels[lv]}
                </span>
                <span className="level-xp">+{xpByLevel[lv]} XP</span>
              </div>

              <div className="level-questions-list">
                {levelItems.length === 0 ? (
                  <div className="empty-level-hint">Chưa có câu hỏi</div>
                ) : (
                  levelItems.map(({ q, idx }) => (
                    <div
                      key={idx}
                      className={`challenge-item-btn ${selectedIdx === idx ? "is-active" : ""}`}
                      onClick={() => setSelectedIdx(idx)}
                    >
                      <span className="q-num">{idx + 1}</span>
                      <span className="q-title">{q.title || `Câu ${idx + 1}`}</span>
                      <div className="q-item-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          title="Nhân bản"
                          onClick={() => duplicateQuestion(idx)}
                        >
                          📋
                        </button>
                        <button
                          type="button"
                          title="Xóa câu hỏi"
                          className="del-btn"
                          onClick={() => removeQuestion(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                className="btn btn--ghost btn--sm add-to-level-btn"
                onClick={() => addQuestion(lv)}
              >
                + Thêm câu Mức {lv}
              </button>
            </div>
          );
        })}
      </div>

      {/* Cột phải: Form biên tập câu hỏi */}
      <div className="challenge-main-editor">
        {currentQ && (
          <>
            <div className="editor-card">
              <div className="editor-card__head">
                <h3>Biên tập Câu hỏi Mốc {selectedIdx + 1}: {currentQ.title}</h3>
                <label className="level-selector">
                  Mức độ:
                  <select
                    value={currentQ.level}
                    onChange={(e) => updateQuestion({ ...currentQ, level: Number(e.target.value) as Level })}
                  >
                    <option value={1}>Mức 1: Nhận biết (+{xpByLevel[1]} XP)</option>
                    <option value={2}>Mức 2: Thông hiểu (+{xpByLevel[2]} XP)</option>
                    <option value={3}>Mức 3: Vận dụng (+{xpByLevel[3]} XP)</option>
                    <option value={4}>Mức 4: Vận dụng cao (+{xpByLevel[4]} XP)</option>
                  </select>
                </label>
              </div>

              <label style={{ marginTop: "0.5rem" }}>
                Tên mốc hiển thị trên bản đồ:
                <input
                  type="text"
                  value={currentQ.title || ""}
                  onChange={(e) => updateQuestion({ ...currentQ, title: e.target.value })}
                />
              </label>

              <MathToolbar onInsert={(tex) => insertMath(tex, "prompt")} />

              <label style={{ marginTop: "0.5rem" }}>
                Đề bài câu hỏi (Prompt - hỗ trợ công thức Toán \LaTeX):
                <textarea
                  rows={3}
                  value={currentQ.prompt || ""}
                  onChange={(e) => updateQuestion({ ...currentQ, prompt: e.target.value })}
                />
              </label>

              {/* 4 Phương án A, B, C, D */}
              <div className="options-editor" style={{ marginTop: "1rem" }}>
                <strong>4 Phương án trả lời (Chọn nút tròn bên phải đáp án đúng):</strong>
                {currentQ.options.map((opt, optIdx) => (
                  <div key={optIdx} className="option-edit-row">
                    <span className="opt-label-badge">{String.fromCharCode(65 + optIdx)}</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...currentQ.options];
                        newOpts[optIdx] = e.target.value;
                        updateQuestion({ ...currentQ, options: newOpts });
                      }}
                    />
                    <label className={`correct-choice ${currentQ.answer === optIdx ? "is-chosen" : ""}`}>
                      <input
                        type="radio"
                        name="correctAnswerRadio"
                        checked={currentQ.answer === optIdx}
                        onChange={() => updateQuestion({ ...currentQ, answer: optIdx })}
                      />
                      {currentQ.answer === optIdx ? "✓ Đáp án ĐÚNG" : "Đặt là đúng"}
                    </label>
                  </div>
                ))}
              </div>

              <label style={{ marginTop: "1rem" }}>
                Lời giải thích chi tiết khi học sinh làm:
                <textarea
                  rows={3}
                  value={currentQ.explain || ""}
                  onChange={(e) => updateQuestion({ ...currentQ, explain: e.target.value })}
                />
              </label>

              {/* Hình ảnh đính kèm câu hỏi */}
              <div className="image-field-block" style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>Hình ảnh minh họa cho câu hỏi (nếu có):</strong>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setShowAssetModal(true)}
                  >
                    {currentQ.image ? "🖼️ Thay đổi ảnh" : "➕ Thêm ảnh minh họa"}
                  </button>
                </div>

                {currentQ.image ? (
                  <div className="slide-image-preview">
                    <img src={currentQ.image} alt="Question illust" />
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm remove-img"
                      onClick={() => updateQuestion({ ...currentQ, image: undefined })}
                    >
                      Xóa ảnh
                    </button>
                  </div>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem", margin: "0.4rem 0 0" }}>
                    Không bắt buộc. Thêm ảnh nếu câu hỏi có hình hình học, biểu đồ hoặc bảng số liệu.
                  </p>
                )}
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="preview-box">
              <div className="preview-box__head">
                <span>👁️ Xem trước giao diện câu hỏi thử thách</span>
                <span className="badge-preview">Mức {currentQ.level} · +{xpByLevel[currentQ.level]} XP</span>
              </div>
              <div className="preview-challenge-render">
                {currentQ.image && (
                  <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                    <img src={currentQ.image} alt="" style={{ maxHeight: "140px", borderRadius: "6px" }} />
                  </div>
                )}
                <MathHtml as="p" className="preview-prompt" html={currentQ.prompt} />
                <div className="preview-options">
                  {currentQ.options.map((opt, j) => (
                    <div
                      key={j}
                      className={`preview-opt-item ${currentQ.answer === j ? "preview-correct" : ""}`}
                    >
                      <span className="opt-key">{String.fromCharCode(65 + j)}.</span>
                      <MathHtml as="span" html={opt} />
                      {currentQ.answer === j && <span className="check-tag">✓ Đáp án đúng</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showAssetModal && (
        <AssetPickerModal
          currentUrl={currentQ?.image}
          onSelect={(url) => {
            if (currentQ) {
              updateQuestion({ ...currentQ, image: url });
            }
          }}
          onClose={() => setShowAssetModal(false)}
        />
      )}
    </div>
  );
}
