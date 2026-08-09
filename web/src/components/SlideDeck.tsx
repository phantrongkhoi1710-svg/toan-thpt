import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Lesson, Quiz, Slide } from "../lib/schema";
import { MathHtml } from "../lib/math";
import { HalfPlaneLab } from "./HalfPlaneLab";
import { VennLab } from "./VennLab";

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

export function SlideDeck({ lesson }: { lesson: Lesson }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState<Record<number, { ok: boolean; selected: string[] }>>({});

  const slide = lesson.slides[index];
  const quiz = slide.type === "quiz" ? slide.quiz : null;
  const saved = answered[index];

  useEffect(() => {
    if (saved) {
      setSelected(saved.selected);
      setRevealed(true);
    } else {
      setSelected([]);
      setRevealed(false);
    }
  }, [index, saved]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(lesson.slides.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lesson.slides.length]);

  const toggle = (key: string) => {
    if (revealed || !quiz) return;
    if (quiz.kind === "multi" || quiz.kind === "venn") {
      setSelected((cur) => (cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key]));
      return;
    }
    setSelected([key]);
  };

  const check = () => {
    if (!quiz) return;
    let ok = false;
    if (quiz.kind === "single") ok = selected[0] === String(quiz.correct);
    if (quiz.kind === "multi") ok = sameSet(selected, quiz.correct.map(String));
    if (quiz.kind === "venn") ok = sameSet(selected, quiz.correct);
    if (quiz.kind === "halfplane") ok = selected[0] === quiz.correct;
    setRevealed(true);
    setAnswered((prev) => ({ ...prev, [index]: { ok, selected } }));
  };

  const reset = () => {
    setSelected([]);
    setRevealed(false);
    setAnswered((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const bar = ((index + 1) / lesson.slides.length) * 100;
  const accent = `linear-gradient(90deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})`;
  const btnAccent = {
    background: `linear-gradient(135deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})`,
    boxShadow: "0 8px 20px rgba(15,23,42,.18)",
  };

  return (
    <>
      <div className="page-head" style={{ marginBottom: "0.4rem" }}>
        <h1 style={{ fontSize: "1.2rem", margin: "0 0 0.15rem" }}>
          Bài {lesson.number} · {lesson.title}
        </h1>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)" }}>
          {lesson.periods} tiết · {lesson.theme.mapName} · {lesson.blurb}
        </p>
      </div>
      <section className="deck" aria-label="Bài giảng">
        <div className="deck__card">
          <div className="deck__progress">
            <i id="deckBar" style={{ width: `${bar}%`, background: accent }} />
          </div>
          <div className="deck__body teach">
            <SlideView
              slide={slide}
              lesson={lesson}
              quiz={quiz}
              selected={selected}
              revealed={revealed}
              ok={saved?.ok}
              onToggle={toggle}
              onCheck={check}
              onReset={reset}
            />
          </div>
          <div className="deck__foot">
            <div className="deck__meta">
              <strong>{slide.title}{quiz ? " · Tương tác" : ""}</strong>
              <span>
                Bài giảng {index + 1} / {lesson.slides.length}
              </span>
            </div>
            <div className="deck__dots">
              {lesson.slides.map((s, i) => (
                <button
                  key={`${s.title}-${i}`}
                  type="button"
                  className={i === index ? "is-active" : ""}
                  aria-label={s.title}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <div className="deck__actions">
              <button type="button" className="btn btn--ghost" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
                ← Trước
              </button>
              <button
                type="button"
                className="btn btn--primary"
                style={btnAccent}
                disabled={index === lesson.slides.length - 1}
                onClick={() => setIndex((i) => i + 1)}
              >
                Tiếp →
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SlideView({
  slide,
  lesson,
  quiz,
  selected,
  revealed,
  ok,
  onToggle,
  onCheck,
  onReset,
}: {
  slide: Slide;
  lesson: Lesson;
  quiz: Quiz | null;
  selected: string[];
  revealed: boolean;
  ok?: boolean;
  onToggle: (key: string) => void;
  onCheck: () => void;
  onReset: () => void;
}) {
  if (slide.type === "hero") {
    return (
      <div
        className="teach-hero"
        style={{
          background: `linear-gradient(135deg, ${lesson.theme.accentFrom} 0%, ${lesson.theme.accentTo} 55%, #0f172a 140%)`,
        }}
      >
        <div className="teach-hero__text">
          <p className="deck__eyebrow">{slide.eyebrow}</p>
          <h2>{slide.heading}</h2>
          <MathHtml as="p" html={slide.body} />
        </div>
        {slide.image ? (
          <div className="teach-hero__art">
            <img src={slide.image} alt={slide.imageAlt ?? ""} />
          </div>
        ) : null}
      </div>
    );
  }

  const bannerClass = slide.bannerTone ? `teach-banner teach-banner--${slide.bannerTone}` : "teach-banner";

  if (slide.type === "summary") {
    return (
      <div className="teach-pad">
        {slide.banner ? <span className={bannerClass}>{slide.banner}</span> : null}
        <h2>{slide.heading}</h2>
        <div className="teach-parts">
          {slide.parts.map((part) => (
            <div className="teach-part" key={part.title}>
              <div className="teach-part__n" style={part.color ? { background: part.color } : undefined}>
                {part.n}
              </div>
              <MathHtml as="h3" html={part.title} />
              <MathHtml as="p" html={part.text} />
            </div>
          ))}
        </div>
        <p className="slide-note" style={{ marginTop: "1.25rem" }}>
          <Link
            className="btn btn--primary"
            to={`/bai/${lesson.slug}/challenge`}
            style={{ background: `linear-gradient(135deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})` }}
          >
            {slide.ctaLabel}
          </Link>
        </p>
      </div>
    );
  }

  if (slide.type === "content") {
    return (
      <div className="teach-pad">
        {slide.banner ? <span className={bannerClass}>{slide.banner}</span> : null}
        <MathHtml as="h2" html={slide.heading} />
        <div className={slide.image ? "teach-split teach-split--img-right" : undefined}>
          <div>
            {slide.definition ? (
              <MathHtml className="teach-def" html={slide.definition} />
            ) : null}
            {slide.afterDefinition ? <MathHtml as="p" html={slide.afterDefinition} /> : null}
            {slide.bullets ? (
              <ul>
                {slide.bullets.map((b) => (
                  <MathHtml as="li" key={b} html={b} />
                ))}
              </ul>
            ) : null}
            {slide.parts ? (
              <div className="teach-parts">
                {slide.parts.map((part) => (
                  <div className="teach-part" key={part.title}>
                    <div className="teach-part__n" style={part.color ? { background: part.color } : undefined}>
                      {part.n}
                    </div>
                    <MathHtml as="h3" html={part.title} />
                    <MathHtml as="p" html={part.text} />
                  </div>
                ))}
              </div>
            ) : null}
            {slide.nests ? (
              <div className="nest-stack stagger">
                {slide.nests.map((row) => (
                  <MathHtml className="nest-row" key={row} html={row} />
                ))}
              </div>
            ) : null}
            {slide.callout ? <MathHtml className="teach-callout" html={slide.callout} /> : null}
            {slide.tags ? (
              <div className="teach-tags">
                {slide.tags.map((tag) => (
                  <MathHtml as="span" className="teach-tag" key={tag} html={tag} />
                ))}
              </div>
            ) : null}
          </div>
          {slide.image ? (
            <div className="teach-media">
              <img src={slide.image} alt={slide.imageAlt ?? ""} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="teach-pad">
      {slide.banner ? <span className={bannerClass}>{slide.banner}</span> : null}
      <MathHtml as="h2" html={slide.heading} />
      {slide.prompt ? <MathHtml as="p" html={slide.prompt} /> : null}
      <div className={slide.image ? "teach-split teach-split--img-right" : undefined}>
        <div>
          {quiz ? (
            <QuizBlock
              quiz={quiz}
              selected={selected}
              revealed={revealed}
              ok={ok}
              onToggle={onToggle}
              onCheck={onCheck}
              onReset={onReset}
            />
          ) : null}
        </div>
        {slide.image ? (
          <div className="teach-media">
            <img src={slide.image} alt={slide.imageAlt ?? ""} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function QuizBlock({
  quiz,
  selected,
  revealed,
  ok,
  onToggle,
  onCheck,
  onReset,
}: {
  quiz: Quiz;
  selected: string[];
  revealed: boolean;
  ok?: boolean;
  onToggle: (key: string) => void;
  onCheck: () => void;
  onReset: () => void;
}) {
  const feedback = useMemo(() => {
    if (!revealed) return null;
    return (
      <MathHtml
        className={`teach-feedback is-visible ${ok ? "is-ok" : "is-bad"}`}
        html={`<strong>${ok ? "Chuẩn!" : "Chưa đúng."}</strong> ${quiz.explain}`}
      />
    );
  }, [revealed, ok, quiz.explain]);

  if (quiz.kind === "halfplane") {
    return (
      <>
        <HalfPlaneLab
          selected={selected[0] ?? null}
          revealed={revealed}
          correct={quiz.correct}
          onSelect={(zone) => onToggle(zone)}
          disabled={revealed}
        />
        <p className="venn-caption">A = nửa chứa gốc · B = nửa kia · đường vàng = biên</p>
        <QuizActions revealed={revealed} onCheck={onCheck} onReset={onReset} checkLabel="Khóa đáp án" />
        {feedback}
      </>
    );
  }

  if (quiz.kind === "venn") {
    return (
      <>
        <VennLab
          selected={selected}
          revealed={revealed}
          correct={quiz.correct}
          onToggle={onToggle}
          disabled={revealed}
        />
        <p className="venn-caption">Bấm vùng trên biểu đồ Ven</p>
        <QuizActions revealed={revealed} onCheck={onCheck} onReset={onReset} checkLabel="Khóa đáp án" />
        {feedback}
      </>
    );
  }

  const options = quiz.options;
  const isVs = quiz.kind === "single" && quiz.variant === "vs";

  return (
    <>
      <div className={isVs ? "teach-vs" : "teach-choices stagger"}>
        {isVs ? null : null}
        {options.map((opt, i) => {
          const key = String(i);
          const on = selected.includes(key);
          const correct =
            quiz.kind === "single" ? i === quiz.correct : quiz.correct.includes(i);
          const cls = [
            isVs ? "teach-bubble teach-pick" : "teach-choice",
            isVs ? (i === 0 ? "teach-bubble--ok" : "teach-bubble--bad") : "",
            on ? "is-selected" : "",
            revealed && correct ? "is-correct" : "",
            revealed && on && !correct ? "is-wrong" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button key={key} type="button" className={cls} onClick={() => onToggle(key)} disabled={revealed}>
              {isVs ? (
                <MathHtml html={opt.html} />
              ) : (
                <>
                  <span className="teach-choice__key">{opt.label ?? String.fromCharCode(65 + i)}</span>
                  <MathHtml as="p" html={opt.html} />
                </>
              )}
            </button>
          );
        })}
      </div>
      <QuizActions revealed={revealed} onCheck={onCheck} onReset={onReset} />
      {feedback}
    </>
  );
}

function QuizActions({
  revealed,
  onCheck,
  onReset,
  checkLabel = "Kiểm tra",
}: {
  revealed: boolean;
  onCheck: () => void;
  onReset: () => void;
  checkLabel?: string;
}) {
  return (
    <div className="teach-quiz-actions">
      <button type="button" className="btn btn--primary" onClick={onCheck} disabled={revealed}>
        {checkLabel}
      </button>
      {revealed ? (
        <button type="button" className="btn btn--ghost" onClick={onReset}>
          Chọn lại
        </button>
      ) : null}
    </div>
  );
}
