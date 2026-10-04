import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import useSavedPreference from "../hooks/useSavedPreference";
import Icon from "./Icon";

const DEPTHS = [1, 2, 3];

export default function FocusMode() {
  const { t } = useLanguage();
  const [active, setActive] = useState(false);
  const [depth, setDepth] = useSavedPreference(
    "dw-focus-depth",
    2,
    (v) => Number.isInteger(v) && v >= 1 && v <= 3,
  );
  const restoreFocus = useRef(null);
  const depthBar = useRef(null);

  const names = [t.focusDepth1, t.focusDepth2, t.focusDepth3];
  const hints = [t.focusDepthHint1, t.focusDepthHint2, t.focusDepthHint3];

  useEffect(() => {
    document.body.classList.toggle("focus-mode", active);
    document.body.setAttribute("data-focus-depth", String(depth));
    if (!active) document.body.removeAttribute("data-focus-depth");
    return () => {
      document.body.classList.remove("focus-mode");
      document.body.removeAttribute("data-focus-depth");
    };
  }, [active, depth]);

  useEffect(() => {
    if (!active) return;
    restoreFocus.current = document.activeElement;
    depthBar.current?.querySelector("button")?.focus({ preventScroll: true });
    function onKey(event) {
      if (event.key === "Escape") setActive(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (restoreFocus.current?.focus) {
        restoreFocus.current.focus({ preventScroll: true });
      }
    };
  }, [active]);

  return (
    <>
      <button
        type="button"
        className={`focus-fab${active ? " is-active" : ""}`}
        aria-pressed={active}
        aria-label={active ? t.focusExit : t.focusMode}
        onClick={() => setActive(!active)}
      >
        <Icon name={active ? "eyeOff" : "eye"} size={22} />
        <span className="focus-fab-label">
          {active ? t.focusExit : t.focusMode}
        </span>
      </button>
      {active && (
        <div
          className="focus-depthbar"
          ref={depthBar}
          role="group"
          aria-label={t.focusMode}
        >
          <span className="focus-orb" aria-hidden="true" />
          <span className="focus-breath" aria-hidden="true">
            <i className="breath-in">{t.focusBreathIn}</i>
            <i className="breath-out">{t.focusBreathOut}</i>
          </span>
          <span className="focus-depth-name">
            {t.focusLevel} {depth} · {names[depth - 1]}
          </span>
          <span className="focus-dots" role="group" aria-label={t.focusLevel}>
            {DEPTHS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={depth === level}
                aria-label={`${t.focusLevel} ${level}: ${names[level - 1]}`}
                title={hints[level - 1]}
                onClick={() => setDepth(level)}
              />
            ))}
          </span>
        </div>
      )}
      {active && (
        <p className="sr-only" role="status">
          {`${t.focusMode}: ${t.focusLevel} ${depth} · ${names[depth - 1]}. ${hints[depth - 1]}`}
        </p>
      )}
    </>
  );
}
