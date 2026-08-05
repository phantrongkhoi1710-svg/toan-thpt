import { useEffect, useMemo, useState } from "react";
import type { ChallengeQuestion, Lesson, Level } from "../lib/schema";
import {
  fetchRemoteProgress,
  loadProgress,
  logProgressEvent,
  mergeProgress,
  saveProgress,
  syncProgress,
  type ProgressState,
} from "../lib/progress";
import { MathHtml } from "../lib/math";
import { useAuth } from "../lib/auth";

export function ChallengeMap({ lesson }: { lesson: Lesson }) {
  const { user } = useAuth();
  const [state, setState] = useState<ProgressState>(() => loadProgress(lesson.progressKey));
  const [activeId, setActiveId] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!user) return;
    void fetchRemoteProgress(user.id, lesson.id).then((remote) => {
      if (!remote) {
        void syncProgress(user.id, lesson.id, loadProgress(lesson.progressKey), lesson.challenges.length);
        return;
      }
      const merged = mergeProgress(loadProgress(lesson.progressKey), remote);
      setState(merged);
      saveProgress(lesson.progressKey, merged);
      void syncProgress(user.id, lesson.id, merged, lesson.challenges.length);
    });
  }, [user, lesson.id, lesson.progressKey, lesson.challenges.length]);

  const bank = lesson.challenges;
  const firstOpen = useMemo(() => {
    for (let i = 0; i < bank.length; i++) if (!state.done[String(i)]) return i;
    return bank.length;
  }, [bank.length, state.done]);

  const statusOf = (i: number) => {
    if (state.done[String(i)]) return "done" as const;
    if (i === firstOpen) return "current" as const;
    return "locked" as const;
  };

  const tip = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  };

  const persist = (next: ProgressState) => {
    setState(next);
    saveProgress(lesson.progressKey, next);
    if (user) void syncProgress(user.id, lesson.id, next, lesson.challenges.length);
  };

  const open = (id: number) => {
    if (statusOf(id) === "locked") {
      tip(lesson.theme.lockedToast);
      return;
    }
    setActiveId(id);
    setChosen(null);
    setChecked(false);
  };

  const close = () => {
    setActiveId(null);
    setChosen(null);
    setChecked(false);
  };

  const check = () => {
    if (activeId == null) return;
    const q = bank[activeId];
    if (chosen == null) return;
    setChecked(true);
    const ok = chosen === q.answer;
    if (user) void logProgressEvent(user.id, lesson.id, activeId, ok);
    if (ok && !state.done[String(activeId)]) {
      const next = {
        ...state,
        done: { ...state.done, [String(activeId)]: true },
        xp: state.xp + lesson.xpByLevel[q.level],
        streak: state.streak + 1,
      };
      persist(next);
      tip(`+${lesson.xpByLevel[q.level]} ${lesson.theme.xpLabel} · Chuỗi ${next.streak}`);
    } else if (!ok) {
      persist({ ...state, streak: 0 });
      window.setTimeout(() => {
        setChecked(false);
        setChosen(null);
      }, 1400);
    }
  };

  const reset = () => {
    if (!confirm(lesson.theme.resetConfirm)) return;
    persist({ done: {}, xp: 0, streak: 0 });
    close();
    tip("Đã xóa tiến độ.");
  };

  const active = activeId == null ? null : bank[activeId];
  const groups: Level[] = [1, 2, 3, 4];

  return (
    <>
      <div className="page-head" style={{ marginBottom: "0.75rem" }}>
        <h1>{lesson.theme.mapName}</h1>
        <p>
          Challenge map Bài {lesson.number} — {lesson.title}
        </p>
      </div>
      <div className="map-hud">
        <div className="map-stat">
          ★ <strong>{state.xp}</strong> <span>{lesson.theme.xpLabel}</span>
        </div>
        <div className="map-stat">
          ✓ <strong>{Object.keys(state.done).length}</strong>
          <span>
            /<span>{bank.length}</span>
          </span>
        </div>
        <div className="map-stat">
          🔥 <strong>{state.streak}</strong> <span>chuỗi</span>
        </div>
        <button type="button" className="btn btn--ghost" onClick={reset}>
          {lesson.theme.resetLabel}
        </button>
      </div>
      <div className={`map-board ${lesson.theme.mapBoardClass}`}>
        {groups.map((lv) => {
          const items = bank.map((q, i) => ({ q, i })).filter(({ q }) => q.level === lv);
          if (!items.length) return null;
          const allDone = items.every(({ i }) => state.done[String(i)]);
          return (
            <div key={lv}>
              <div className="map-section">
                <div className={`map-section__badge map-section__badge--${lv}`}>
                  {lesson.theme.sectionPrefix} {lv} · {lesson.levelLabels[lv]}
                </div>
              </div>
              <ul className="map-path">
                {items.map(({ q, i }) => {
                  const st = statusOf(i);
                  return (
                    <li className="map-node" key={i}>
                      <div style={{ position: "relative" }}>
                        <button
                          type="button"
                          className={`map-node__btn ${lesson.theme.nodeClass} map-node__btn--${q.level} ${
                            st === "done" ? "is-done" : st === "current" ? "is-current" : "is-locked"
                          }`}
                          disabled={st === "locked"}
                          onClick={() => open(i)}
                        >
                          {st === "locked" ? "🔒" : i + 1}
                        </button>
                        <div className="map-node__label">{q.title}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="map-chest">
                <button type="button" className={allDone ? "is-open" : ""}>
                  {allDone ? lesson.theme.chestOpen : lesson.theme.chestClosed}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`challenge-overlay${active ? " is-open" : ""}`}
        aria-hidden={active ? "false" : "true"}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {active && activeId != null ? (
          <div className="challenge-panel" role="dialog" aria-modal="true">
            <div className="challenge-panel__head">
              <h2>
                Mốc {activeId + 1} · {active.title}
              </h2>
              <button type="button" className="btn btn--ghost" onClick={close}>
                Đóng
              </button>
            </div>
            <div className="challenge-panel__body">
              <QuestionBody
                q={active}
                lesson={lesson}
                chosen={chosen}
                checked={checked}
                onChoose={setChosen}
              />
            </div>
            <div className="challenge-panel__foot">
              <button type="button" className="btn btn--ghost" onClick={close}>
                Để sau
              </button>
              <button
                type="button"
                className="btn btn--primary"
                style={{ background: `linear-gradient(135deg, ${lesson.theme.accentFrom}, ${lesson.theme.accentTo})` }}
                onClick={check}
                disabled={checked && chosen === active.answer}
              >
                {checked && chosen === active.answer ? "Đã mở mốc tiếp" : "Kiểm tra"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
      <div className={`map-toast${toast ? " is-show" : ""}`}>{toast}</div>
    </>
  );
}

function QuestionBody({
  q,
  lesson,
  chosen,
  checked,
  onChoose,
}: {
  q: ChallengeQuestion;
  lesson: Lesson;
  chosen: number | null;
  checked: boolean;
  onChoose: (i: number) => void;
}) {
  return (
    <>
      {q.image ? <img className="quiz-illust" src={q.image} alt="" /> : null}
      <div className={`level-badge level-badge--${q.level}`}>
        {lesson.levelLabels[q.level]} · +{lesson.xpByLevel[q.level]} {lesson.theme.xpLabel}
      </div>
      <MathHtml className="quiz-prompt" as="p" html={q.prompt} />
      <div className="options">
        {q.options.map((opt, j) => {
          const cls = [
            "option",
            chosen === j ? "is-selected" : "",
            checked && j === q.answer ? "is-correct" : "",
            checked && chosen === j && j !== q.answer ? "is-wrong" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <label className={cls} key={opt}>
              <input
                type="radio"
                name="chAns"
                value={j}
                checked={chosen === j}
                disabled={checked && chosen === q.answer}
                onChange={() => onChoose(j)}
              />
              <MathHtml as="span" html={`${String.fromCharCode(65 + j)}. ${opt}`} />
            </label>
          );
        })}
      </div>
      {checked ? (
        <MathHtml
          className={`quiz-result is-visible ${chosen === q.answer ? "is-ok" : "is-bad"}`}
          html={`<strong>${chosen === q.answer ? lesson.theme.successText : lesson.theme.failText}</strong> ${q.explain}`}
        />
      ) : null}
    </>
  );
}
