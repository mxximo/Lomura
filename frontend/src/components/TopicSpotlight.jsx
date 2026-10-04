import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";
import { useProgress } from "../context/ProgressContext";
import Icon from "./Icon";

function statusOf(module, completed, t) {
  const done = module.lessons.filter((lesson) =>
    completed.includes(lesson.id),
  ).length;
  return {
    done,
    label:
      done === module.lessons.length
        ? t.statusDone
        : done > 0
          ? t.statusGoing
          : t.statusTodo,
    className:
      done === module.lessons.length
        ? "is-done"
        : done > 0
          ? "is-going"
          : "is-todo",
  };
}

export default function TopicSpotlight() {
  const { t, tr } = useLanguage();
  const { modules } = useContent();
  const { completed } = useProgress();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [backwards, setBackwards] = useState(false);
  const toggleRef = useRef(null);
  const headingRef = useRef(null);
  const total = modules.length;
  const module = modules[Math.min(index, total - 1)];

  const go = useCallback(
    (next, direction) => {
      setBackwards(direction < 0);
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  function start() {
    const firstPending = modules.findIndex((m) =>
      m.lessons.some((lesson) => !completed.includes(lesson.id)),
    );
    setBackwards(false);
    setIndex(firstPending === -1 ? 0 : firstPending);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const chrome = [
      document.getElementById("main"),
      document.querySelector(".navbar"),
      document.querySelector(".footer"),
    ];
    chrome.forEach((el) => el?.setAttribute("inert", ""));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    headingRef.current?.focus({ preventScroll: true });
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") go(index + 1, 1);
      if (event.key === "ArrowLeft") go(index - 1, -1);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      chrome.forEach((el) => el?.removeAttribute("inert"));
      document.body.style.overflow = previousOverflow;
      toggleRef.current?.focus({ preventScroll: true });
    };
  }, [open, index, go]);

  useEffect(() => {
    if (open) headingRef.current?.focus({ preventScroll: true });
  }, [index, open]);

  if (!module) return null;
  const num = String(modules.indexOf(module) + 1).padStart(2, "0");
  const status = statusOf(module, completed, t);
  const target =
    module.lessons.find((lesson) => !completed.includes(lesson.id)) ||
    module.lessons[0];

  return (
    <>
      <button
        type="button"
        ref={toggleRef}
        className="topics-eye"
        onClick={start}
      >
        <Icon name="eye" size={19} />
        {t.topicsFocus}
      </button>
      {open &&
        createPortal(
          <div
            className="spot-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={t.topicsFocus}
          >
            <div className="spot-top">
              <span className="spot-counter">
                {t.topicCounter} {index + 1} / {total}
              </span>
              <span
                className="spot-progress"
                role="img"
                aria-label={`${index + 1} / ${total}`}
              >
                <i style={{ "--fill": String((index + 1) / total) }} />
              </span>
              <button
                type="button"
                className="spot-exit"
                onClick={() => setOpen(false)}
              >
                <Icon name="eyeOff" size={18} />
                {t.topicsFocusExit}
              </button>
            </div>
            <div
              key={module.id}
              className={`spot-stage glass ${module.color}${backwards ? " is-back" : ""}`}
            >
              <span className="ghost-number" aria-hidden="true">
                {num}
              </span>
              <div className="spot-copy">
                <div className="module-card-top">
                  <span className="module-icon">
                    <Icon name={module.icon} size={27} />
                  </span>
                  <span className="module-number">
                    {t.module} {num}
                  </span>
                  <span className={`status-pill ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <h2 ref={headingRef} tabIndex="-1">
                  {tr(module.title)}
                </h2>
                <p>{tr(module.description)}</p>
                <ul className="mini-lessons">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className={completed.includes(lesson.id) ? "done" : ""}
                    >
                      <span className="mini-dot" aria-hidden="true">
                        {completed.includes(lesson.id) ? "✓" : ""}
                      </span>
                      {tr(lesson.intro)}
                    </li>
                  ))}
                </ul>
                <Link
                  className="button primary spot-cta"
                  to={`/learn/${target.slug}`}
                >
                  {tr(target.intro)}
                  <Icon name="arrow" size={18} />
                </Link>
              </div>
              <div className="spot-art" aria-hidden="true">
                <img src={module.lessons[0].media.image} alt="" />
              </div>
            </div>
            <div className="spot-nav">
              <button
                type="button"
                aria-label={t.previous}
                onClick={() => go(index - 1, -1)}
              >
                ←
              </button>
              <div className="spot-dots" role="tablist">
                {modules.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-current={i === index}
                    aria-label={`${t.topicCounter} ${i + 1}: ${tr(m.title)}`}
                    onClick={() => go(i, i < index ? -1 : 1)}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={t.next}
                onClick={() => go(index + 1, 1)}
              >
                →
              </button>
            </div>
            <p className="sr-only" role="status">
              {tr(module.title)} — {status.done} / {module.lessons.length}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
