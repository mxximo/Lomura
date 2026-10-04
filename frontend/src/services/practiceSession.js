import { useSyncExternalStore } from "react";

const key = "dw-practice-v1";
const listeners = new Set();
let interval;
const empty = { session: null, storageError: false };
let snapshot = empty;
function valid(s) {
  return (
    s &&
    ["eyes", "pomodoro", "stretch"].includes(s.kind) &&
    Array.isArray(s.steps) &&
    s.steps.length > 0 &&
    s.steps.length <= 16 &&
    (s.kind === "eyes"
      ? s.steps.length === 2
      : s.kind === "stretch"
        ? s.steps.length === 3
        : s.steps.length % 2 === 0) &&
    s.steps.every(
      (p) =>
        Number.isInteger(p.seconds) &&
        p.seconds > 0 &&
        p.seconds <= 5400 &&
        [
          "focus",
          "rest",
          "longRest",
          "exercise1",
          "exercise2",
          "exercise3",
        ].includes(p.label),
    ) &&
    Number.isInteger(s.phase) &&
    s.phase >= 0 &&
    s.phase < s.steps.length &&
    Number.isFinite(s.remaining) &&
    s.remaining >= 0 &&
    s.remaining <= s.steps[s.phase].seconds &&
    typeof s.running === "boolean" &&
    Number.isFinite(s.deadline) &&
    s.slug ===
      { eyes: "regla-20-20-20", pomodoro: "pomodoro", stretch: "pausa-activa" }[
        s.kind
      ] &&
    typeof s.done === "boolean"
  );
}
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved?.version === 1 && valid(saved.session))
    snapshot = { session: saved.session, storageError: false };
} catch {
  /* Invalid or blocked storage must not prevent practice. */
}

function emit(session, persist = true) {
  let storageError = snapshot.storageError;
  if (persist) {
    try {
      if (session)
        localStorage.setItem(key, JSON.stringify({ version: 1, session }));
      else localStorage.removeItem(key);
      storageError = false;
    } catch {
      storageError = true;
    }
  }
  snapshot = { session, storageError };
  listeners.forEach((fn) => fn());
}
function tick(recovered = false) {
  const s = snapshot.session;
  if (!s?.running) return;
  const remaining = Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000));
  if (remaining > 0) {
    if (remaining !== s.remaining) emit({ ...s, remaining }, false);
    return;
  }
  if (document.hidden) return;
  const next = s.phase + 1;
  if (next >= s.steps.length && s.kind !== "eyes") {
    emit({ ...s, remaining: 0, running: false, done: true });
    return;
  }
  const phase = next % s.steps.length;
  const seconds = s.steps[phase].seconds;
  // An overdue background phase is never treated as a completed break.
  const running =
    !recovered && !document.hidden && Date.now() - s.deadline < 2000;
  emit({
    ...s,
    phase,
    remaining: seconds,
    deadline: Date.now() + seconds * 1000,
    running,
  });
}
function visibility() {
  tick(true);
}
function storage(event) {
  if (event.key !== key) return;
  try {
    const value = JSON.parse(event.newValue);
    if (event.newValue === null) emit(null, false);
    else if (value?.version === 1 && valid(value.session)) {
      emit(value.session, false);
      tick(true);
    }
  } catch {
    /* Ignore malformed data from another tab. */
  }
}
function subscribe(fn) {
  listeners.add(fn);
  if (listeners.size === 1) {
    tick(true);
    interval = setInterval(() => tick(), 250);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("storage", storage);
  }
  return () => {
    listeners.delete(fn);
    if (!listeners.size) {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("storage", storage);
    }
  };
}
export const usePracticeSession = () =>
  useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => empty,
  );
export const practice = {
  begin(spec, phase = 0, running = true) {
    const seconds = spec.steps[phase].seconds;
    emit({
      ...spec,
      phase,
      remaining: seconds,
      running,
      done: false,
      deadline: Date.now() + seconds * 1000,
    });
  },
  pause() {
    tick();
    const s = snapshot.session;
    if (s) emit({ ...s, running: false });
  },
  resume() {
    const s = snapshot.session;
    if (s && s.remaining > 0 && !s.done)
      emit({ ...s, running: true, deadline: Date.now() + s.remaining * 1000 });
  },
  reset() {
    const s = snapshot.session;
    if (s) practice.begin(s, s.phase, false);
  },
  clear() {
    emit(null);
  },
};
