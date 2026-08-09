import { useState, useRef } from "react";
import type { Slide, QuizOption } from "../../lib/schema";
import { MathToolbar } from "./MathToolbar";
import { AssetPickerModal } from "./AssetPickerModal";
import { convertPdfToSlides } from "../../lib/pdfConverter";
import { MathHtml } from "../../lib/math";

interface SlideEditorTabProps {
  slides: Slide[];
  onChange: (slides: Slide[]) => void;
}

export function SlideEditorTab({ slides, onChange }: SlideEditorTabProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>("");
  const [pdfConfirm, setPdfConfirm] = useState<{ newSlides: Slide[] } | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const currentSlide = slides[selectedIdx] || slides[0];

  const updateSlide = (updated: Slide) => {
    const next = [...slides];
    next[selectedIdx] = updated;
    onChange(next);
  };

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= slides.length) return;
    const next = [...slides];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    onChange(next);
    setSelectedIdx(to);
  };

  const removeSlide = (idx: number) => {
    if (slides.length <= 1) {
      alert("Bài học cần có ít nhất 1 slide bài giảng.");
      return;
    }
    if (!confirm(`Xóa slide số ${idx + 1}?`)) return;
    const next = slides.filter((_, i) => i !== idx);
    onChange(next);
    setSelectedIdx(Math.max(0, Math.min(next.length - 1, selectedIdx)));
  };

  const addSlide = (type: Slide["type"]) => {
    let newSlide: Slide;
    if (type === "hero") {
      newSlide = {
        type: "hero",
        title: "Mở đầu",
        eyebrow: "Toán 10",
        heading: "Tiêu đề mở đầu",
        body: "Giới thiệu chủ đề bài học.",
      };
    } else if (type === "quiz") {
      newSlide = {
        type: "quiz",
        title: "Câu hỏi tương tác",
        banner: "Tương tác",
        bannerTone: "orange",
        heading: "Chọn đáp án đúng",
        quiz: {
          kind: "single",
          options: [{ html: "Phương án A" }, { html: "Phương án B" }],
          correct: 0,
          explain: "Giải thích đáp án đúng.",
        },
      };
    } else if (type === "summary") {
      newSlide = {
        type: "summary",
        title: "Tổng kết",
        banner: "Tổng kết",
        bannerTone: "blue",
        heading: "Nhớ nhanh trọng tâm",
        ctaLabel: "Sang Thử thách →",
        parts: [
          { n: "1", title: "Ý 1", text: "Nội dung tóm tắt", color: "#2563eb" },
          { n: "2", title: "Ý 2", text: "Nội dung tóm tắt", color: "#10b981" },
        ],
      };
    } else {
      newSlide = {
        type: "content",
        title: `Nội dung ${slides.length + 1}`,
        banner: "Chốt kiến thức",
        bannerTone: "blue",
        heading: "Khái niệm và định nghĩa",
        definition: "Định nghĩa toán học...",
        bullets: ["Ý 1", "Ý 2"],
      };
    }

    const next = [...slides, newSlide];
    onChange(next);
    setSelectedIdx(next.length - 1);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfLoading(true);
    setPdfProgress("Đang đọc file PDF...");
    try {
      const buffer = await file.arrayBuffer();
      const newSlides = await convertPdfToSlides(buffer, file.name, (p) => {
        setPdfProgress(`Đang chuyển đổi trang ${p.current}/${p.total}...`);
      });

      if (newSlides.length > 0) {
        setPdfConfirm({ newSlides });
      }
    } catch (err) {
      console.error(err);
      alert("Không thể chuyển đổi file PDF. Vui lòng kiểm tra lại định dạng file.");
    } finally {
      setPdfLoading(false);
      setPdfProgress("");
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handlePdfConfirmChoice = (replace: boolean) => {
    if (!pdfConfirm) return;
    const { newSlides } = pdfConfirm;
    if (replace) {
      onChange(newSlides);
      setSelectedIdx(0);
    } else {
      onChange([...slides, ...newSlides]);
      setSelectedIdx(slides.length);
    }
    setPdfConfirm(null);
  };

  const insertMath = (tex: string, field: "heading" | "definition" | "body" | "prompt") => {
    if (!currentSlide) return;
    if (field === "heading") {
      updateSlide({ ...currentSlide, heading: `${currentSlide.heading || ""} ${tex}` });
    } else if (field === "definition" && currentSlide.type === "content") {
      updateSlide({ ...currentSlide, definition: `${currentSlide.definition || ""} ${tex}` });
    } else if (field === "body" && currentSlide.type === "hero") {
      updateSlide({ ...currentSlide, body: `${currentSlide.body || ""} ${tex}` });
    } else if (field === "prompt" && currentSlide.type === "quiz") {
      updateSlide({ ...currentSlide, prompt: `${currentSlide.prompt || ""} ${tex}` });
    }
  };

  return (
    <div className="slide-editor-container">
      {/* Cột trái: Danh sách các Slide */}
      <div className="slide-sidebar">
        <div className="slide-sidebar__head">
          <h4>Danh sách Slide ({slides.length})</h4>
          <div className="slide-import-row">
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              hidden
              onChange={handlePdfUpload}
            />
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => pdfInputRef.current?.click()}
              disabled={pdfLoading}
            >
              {pdfLoading ? pdfProgress : "📄 Nhập từ file PDF"}
            </button>
          </div>
        </div>

        <div className="slide-list">
          {slides.map((s, idx) => (
            <div
              key={idx}
              className={`slide-list-item ${selectedIdx === idx ? "is-active" : ""}`}
              onClick={() => setSelectedIdx(idx)}
            >
              <div className="slide-item-num">{idx + 1}</div>
              <div className="slide-item-info">
                <strong>{s.title || `Slide ${idx + 1}`}</strong>
                <span>
                  {s.type === "hero"
                    ? "Mở đầu"
                    : s.type === "quiz"
                    ? "Tương tác"
                    : s.type === "summary"
                    ? "Tổng kết"
                    : "Lý thuyết"}
                </span>
              </div>
              <div className="slide-item-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  title="Di chuyển lên"
                  disabled={idx === 0}
                  onClick={() => moveSlide(idx, idx - 1)}
                >
                  ▲
                </button>
                <button
                  type="button"
                  title="Di chuyển xuống"
                  disabled={idx === slides.length - 1}
                  onClick={() => moveSlide(idx, idx + 1)}
                >
                  ▼
                </button>
                <button
                  type="button"
                  title="Xóa slide"
                  className="del-btn"
                  onClick={() => removeSlide(idx)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="add-slide-menu">
          <p>+ Thêm slide kiểu:</p>
          <div className="add-slide-btns">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => addSlide("content")}>
              📖 Lý thuyết
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => addSlide("quiz")}>
              ❓ Trắc nghiệm
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => addSlide("hero")}>
              🌟 Mở đầu
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => addSlide("summary")}>
              🏁 Tổng kết
            </button>
          </div>
        </div>
      </div>

      {/* Cột phải: Form biên tập nội dung slide được chọn */}
      <div className="slide-main-editor">
        {currentSlide && (
          <>
            <div className="editor-card">
              <div className="editor-card__head">
                <h3>Biên tập Slide {selectedIdx + 1}: {currentSlide.title}</h3>
                <span className="badge-type">{currentSlide.type.toUpperCase()}</span>
              </div>

              {/* Thông tin chung */}
              <div className="form-grid">
                <label>
                  Tên Slide (hiển thị trên thanh điều hướng):
                  <input
                    type="text"
                    value={currentSlide.title || ""}
                    onChange={(e) => updateSlide({ ...currentSlide, title: e.target.value })}
                  />
                </label>

                {currentSlide.type !== "hero" && (
                  <label>
                    Nhãn biểu ngữ (Banner):
                    <input
                      type="text"
                      placeholder="Ví dụ: Phần 1 · Chốt kiến thức"
                      value={currentSlide.banner || ""}
                      onChange={(e) => updateSlide({ ...currentSlide, banner: e.target.value })}
                    />
                  </label>
                )}
              </div>

              <MathToolbar onInsert={(tex) => insertMath(tex, "heading")} />

              <label style={{ marginTop: "0.5rem" }}>
                Tiêu đề chính (Heading):
                <input
                  type="text"
                  value={currentSlide.heading || ""}
                  onChange={(e) => updateSlide({ ...currentSlide, heading: e.target.value })}
                />
              </label>

              {/* Tùy theo loại slide */}
              {currentSlide.type === "hero" && (
                <div className="type-fields" style={{ marginTop: "0.75rem" }}>
                  <label>
                    Dòng phụ đề (Eyebrow):
                    <input
                      type="text"
                      value={currentSlide.eyebrow || ""}
                      onChange={(e) => updateSlide({ ...currentSlide, eyebrow: e.target.value })}
                    />
                  </label>
                  <label style={{ marginTop: "0.5rem" }}>
                    Nội dung câu chuyện mở đầu:
                    <textarea
                      rows={3}
                      value={currentSlide.body || ""}
                      onChange={(e) => updateSlide({ ...currentSlide, body: e.target.value })}
                    />
                  </label>
                </div>
              )}

              {currentSlide.type === "content" && (
                <div className="type-fields" style={{ marginTop: "0.75rem" }}>
                  <label>
                    Định nghĩa / Nội dung trọng tâm (hỗ trợ công thức \LaTeX):
                    <textarea
                      rows={4}
                      value={currentSlide.definition || ""}
                      onChange={(e) => updateSlide({ ...currentSlide, definition: e.target.value })}
                    />
                  </label>

                  <label style={{ marginTop: "0.5rem" }}>
                    Ghi chú / Callout nổi bật:
                    <input
                      type="text"
                      placeholder="Ví dụ: Lưu ý rằng tam giác đều luôn là tam giác cân."
                      value={currentSlide.callout || ""}
                      onChange={(e) => updateSlide({ ...currentSlide, callout: e.target.value })}
                    />
                  </label>
                </div>
              )}

              {currentSlide.type === "quiz" && (
                <div className="type-fields" style={{ marginTop: "0.75rem" }}>
                  <label>
                    Lời dẫn câu hỏi (Prompt):
                    <input
                      type="text"
                      placeholder="Ví dụ: Chọn câu khẳng định đúng:"
                      value={currentSlide.prompt || ""}
                      onChange={(e) => updateSlide({ ...currentSlide, prompt: e.target.value })}
                    />
                  </label>

                  <div className="quiz-options-builder" style={{ marginTop: "0.75rem" }}>
                    <strong>Các phương án lựa chọn:</strong>
                    {("options" in currentSlide.quiz ? currentSlide.quiz.options : []).map((opt: QuizOption, optIdx: number) => (
                      <div key={optIdx} className="quiz-option-row">
                        <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                        <input
                          type="text"
                          value={opt.html}
                          onChange={(e) => {
                            const prevOpts = "options" in currentSlide.quiz ? currentSlide.quiz.options : [];
                            const newOpts = [...prevOpts];
                            newOpts[optIdx] = { ...newOpts[optIdx], html: e.target.value };
                            updateSlide({
                              ...currentSlide,
                              quiz: {
                                kind: "single",
                                options: newOpts,
                                correct: currentSlide.quiz.kind === "single" ? currentSlide.quiz.correct : 0,
                                explain: currentSlide.quiz.explain || "",
                              },
                            });
                          }}
                        />
                        <label className="correct-radio">
                          <input
                            type="radio"
                            name="correctQuizOpt"
                            checked={currentSlide.quiz.kind === "single" && currentSlide.quiz.correct === optIdx}
                            onChange={() => {
                              const prevOpts = "options" in currentSlide.quiz ? currentSlide.quiz.options : [];
                              updateSlide({
                                ...currentSlide,
                                quiz: {
                                  kind: "single",
                                  options: prevOpts,
                                  correct: optIdx,
                                  explain: currentSlide.quiz.explain || "",
                                },
                              });
                            }}
                          />
                          Đáp án đúng
                        </label>
                        <button
                          type="button"
                          className="icon-btn del-btn"
                          onClick={() => {
                            const prevOpts = "options" in currentSlide.quiz ? currentSlide.quiz.options : [];
                            const newOpts = prevOpts.filter((_, i: number) => i !== optIdx);
                            updateSlide({
                              ...currentSlide,
                              quiz: {
                                kind: "single",
                                options: newOpts,
                                correct: 0,
                                explain: currentSlide.quiz.explain || "",
                              },
                            });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      style={{ marginTop: "0.4rem" }}
                      onClick={() => {
                        const prevOpts = "options" in currentSlide.quiz ? currentSlide.quiz.options : [];
                        const newOpts = [
                          ...prevOpts,
                          { html: `Phương án ${String.fromCharCode(65 + prevOpts.length)}` },
                        ];
                        updateSlide({
                          ...currentSlide,
                          quiz: {
                            kind: "single",
                            options: newOpts,
                            correct: currentSlide.quiz.kind === "single" ? currentSlide.quiz.correct : 0,
                            explain: currentSlide.quiz.explain || "",
                          },
                        });
                      }}
                    >
                      + Thêm phương án
                    </button>
                  </div>

                  <label style={{ marginTop: "0.75rem" }}>
                    Lời giải thích chi tiết:
                    <textarea
                      rows={2}
                      value={currentSlide.quiz.explain || ""}
                      onChange={(e) => {
                        const prevOpts = "options" in currentSlide.quiz ? currentSlide.quiz.options : [];
                        updateSlide({
                          ...currentSlide,
                          quiz: {
                            kind: "single",
                            options: prevOpts,
                            correct: currentSlide.quiz.kind === "single" ? currentSlide.quiz.correct : 0,
                            explain: e.target.value,
                          },
                        });
                      }}
                    />
                  </label>
                </div>
              )}

              {currentSlide.type === "summary" && (
                <div className="type-fields" style={{ marginTop: "0.75rem" }}>
                  <label>
                    Nhãn nút chuyển tiếp (CTA):
                    <input
                      type="text"
                      value={currentSlide.ctaLabel || "Sang Thử thách →"}
                      onChange={(e) => updateSlide({ ...currentSlide, ctaLabel: e.target.value })}
                    />
                  </label>
                </div>
              )}

              {/* Quản lý hình ảnh đính kèm */}
              <div className="image-field-block" style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>Hình ảnh minh họa slide:</strong>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => setShowAssetModal(true)}
                  >
                    {currentSlide.image ? "🖼️ Thay đổi ảnh" : "➕ Thêm ảnh"}
                  </button>
                </div>

                {currentSlide.image ? (
                  <div className="slide-image-preview">
                    <img src={currentSlide.image} alt={currentSlide.imageAlt || "Slide image"} />
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm remove-img"
                      onClick={() => updateSlide({ ...currentSlide, image: undefined, imageAlt: undefined })}
                    >
                      Xóa ảnh
                    </button>
                  </div>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem", margin: "0.4rem 0 0" }}>
                    Chưa có ảnh minh họa. Bấm "Thêm ảnh" để tải ảnh hoặc chọn từ kho ảnh mẫu.
                  </p>
                )}
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="preview-box">
              <div className="preview-box__head">
                <span>👁️ Xem trước giao diện học sinh</span>
              </div>
              <div className="preview-slide-render">
                <h2>{currentSlide.heading}</h2>
                {currentSlide.type === "content" && currentSlide.definition && (
                  <MathHtml className="teach-def" html={currentSlide.definition} />
                )}
                {currentSlide.type === "hero" && currentSlide.body && (
                  <MathHtml as="p" html={currentSlide.body} />
                )}
                {currentSlide.image && (
                  <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
                    <img src={currentSlide.image} alt="" style={{ width: "100%", maxHeight: "160px", borderRadius: "8px", objectFit: "contain" }} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {pdfConfirm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-head">
              <h3>📄 Xác nhận nạp PDF</h3>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <p>
                Đã trích xuất thành công <strong>{pdfConfirm.newSlides.length}</strong> slide từ PDF.
              </p>
              <p>Bạn có muốn <strong>thay thế</strong> toàn bộ các slide hiện tại, hay <strong>thêm vào sau</strong> các slide đã có?</p>
              
              <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button type="button" className="btn btn--ghost" onClick={() => handlePdfConfirmChoice(false)}>
                  Thêm vào sau
                </button>
                <button type="button" className="btn btn--primary" onClick={() => handlePdfConfirmChoice(true)}>
                  Thay thế
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showAssetModal && (
        <AssetPickerModal
          currentUrl={currentSlide?.image}
          onSelect={(url) => {
            if (currentSlide) {
              updateSlide({ ...currentSlide, image: url });
            }
          }}
          onClose={() => setShowAssetModal(false)}
        />
      )}
    </div>
  );
}
