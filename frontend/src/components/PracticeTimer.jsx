import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { usePracticeSession, practice } from "../services/practiceSession";

export function clockText(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
export default function PracticeTimer({ spec, children }) {
  const { t } = useLanguage();
  const { session, storageError } = usePracticeSession();
  const [replacement, setReplacement] = useState(null);
  const own = session?.kind === spec.kind;
  const current = own
    ? session
    : { ...spec, phase: 0, remaining: spec.steps[0].seconds };
  const step = current.steps[current.phase];
  function begin(phase = 0) {
    if (session && !own && !session.done) setReplacement(phase);
    else practice.begin(spec, phase);
  }
  return (
    <>
      {children?.({ current, own, begin })}
      {current.done ? (
        <div className="completion-box" role="status">
          <h3>{t.sessionDone}</h3>
          <p>{t.practiceComplete}</p>
          <button className="button primary" onClick={() => begin()}>
            {t.again}
          </button>
        </div>
      ) : (
        <div className={`timer ${current.running ? "is-running" : ""}`}>
          <span className="timer-state">
            {current.running
              ? t.timerRunning
              : current.remaining === step.seconds
                ? t.timerReady
                : t.timerPaused}
          </span>
          <div
            className="timer-ring"
            style={{
              "--timer-progress": `${(1 - current.remaining / step.seconds) * 100}%`,
            }}
          >
            <span className="eyebrow">{t[step.label] || step.label}</span>
            <span
              className="timer-digits"
              role="timer"
              aria-label={t[step.label] || step.label}
            >
              {clockText(current.remaining)}
            </span>
          </div>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() =>
                current.running
                  ? practice.pause()
                  : own
                    ? practice.resume()
                    : begin()
              }
            >
              {current.running
                ? t.pause
                : current.remaining === step.seconds
                  ? t.timerStart
                  : t.resume}
            </button>
            <button
              className="button secondary"
              onClick={() => own && practice.reset()}
            >
              {t.reset}
            </button>
          </div>
        </div>
      )}
      {replacement !== null && (
        <div className="feedback" role="alert">
          <p>{t.replaceSession}</p>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() => {
                practice.begin(spec, replacement);
                setReplacement(null);
              }}
            >
              {t.replaceAndStart}
            </button>
            <button
              className="button secondary"
              onClick={() => setReplacement(null)}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
      {storageError && (
        <p role="alert" className="small">
          {t.storageUnavailable}
        </p>
      )}
    </>
  );
}
export function PracticeDock() {
  const { session } = usePracticeSession();
  const { pathname } = useLocation();
  const { t } = useLanguage();
  if (!session || pathname === `/learn/${session.slug}`) return null;
  return (
    <aside className="practice-dock glass" aria-label={t.activePractice}>
      <Link to={`/learn/${session.slug}`}>
        <span>
          {
            t[
              session.kind === "eyes"
                ? "eyeTimer"
                : session.kind === "pomodoro"
                  ? "pomodoroTitle"
                  : "stretchTitle"
            ]
          }
        </span>
        <strong>
          {session.done ? t.sessionDone : clockText(session.remaining)}
        </strong>
      </Link>
      {!session.done && (
        <button
          className="button secondary"
          onClick={session.running ? practice.pause : practice.resume}
        >
          {session.running ? t.pause : t.resume}
        </button>
      )}
      <button className="text-button" onClick={practice.clear}>
        {t.endSession}
      </button>
    </aside>
  );
}
