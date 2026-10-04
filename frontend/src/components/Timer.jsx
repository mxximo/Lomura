import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
export function useCountdown(seconds, onComplete, autoStart = false) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(autoStart);
  const deadline = useRef(Date.now() + seconds * 1000);
  const callback = useRef(onComplete);
  useEffect(() => {
    callback.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setRemaining(left);
      if (!left) {
        setRunning(false);
        callback.current?.();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [running]);
  function start() {
    if (remaining <= 0) return;
    deadline.current = Date.now() + remaining * 1000;
    setRunning(true);
  }
  function pause() {
    setRemaining(
      Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
    );
    setRunning(false);
  }
  function reset(value = seconds) {
    setRunning(false);
    setRemaining(value);
  }
  return { remaining, running, start, pause, reset };
}
export default function Timer({
  seconds,
  title,
  onComplete,
  compact = false,
  autoStart = false,
}) {
  const { t } = useLanguage();
  const timer = useCountdown(seconds, onComplete, autoStart);
  const minutes = Math.floor(timer.remaining / 60)
    .toString()
    .padStart(2, "0");
  const secs = (timer.remaining % 60).toString().padStart(2, "0");
  return (
    <div
      className={`timer ${compact ? "compact" : ""} ${timer.running ? "is-running" : ""}`}
    >
      <span className="timer-state">
        {timer.remaining === 0
          ? t.timerDone
          : timer.running
            ? t.timerRunning
            : timer.remaining === seconds
              ? t.timerReady
              : t.timerPaused}
      </span>
      <div
        className="timer-ring"
        style={{
          "--timer-progress": `${(1 - timer.remaining / seconds) * 100}%`,
        }}
      >
        <span className="eyebrow">{title}</span>
        <span className="timer-digits" role="timer" aria-label={title}>
          {minutes}:{secs}
        </span>
        <span className="timer-decoration" aria-hidden="true">
          • &nbsp; • &nbsp; •
        </span>
      </div>
      <div className="button-row">
        <button
          className="button primary"
          disabled={timer.remaining === 0}
          onClick={timer.running ? timer.pause : timer.start}
        >
          {timer.running
            ? t.pause
            : timer.remaining === seconds
              ? t.timerStart
              : t.resume}
        </button>
        <button className="button secondary" onClick={() => timer.reset()}>
          {t.reset}
        </button>
      </div>
      <p className="small timer-status" role="status">
        {timer.remaining === 0 ? t.timerDone : "\u00a0"}
      </p>
    </div>
  );
}
