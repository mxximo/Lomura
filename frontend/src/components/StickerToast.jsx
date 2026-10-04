import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";
import { useProgress } from "../context/ProgressContext";
import { moduleEarned } from "./Stickers";
import Icon from "./Icon";

const SEEN_KEY = "dw-stickers-seen";

function readSeen() {
  try {
    const value = JSON.parse(localStorage.getItem(SEEN_KEY));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function StickerToast() {
  const { t, tr } = useLanguage();
  const { modules } = useContent();
  const { completed } = useProgress();
  const [queue, setQueue] = useState([]);
  const prev = useRef(completed);

  function dismiss(id) {
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...readSeen(), id]));
    } catch {
      /* Optional celebration memory. */
    }
    setQueue((current) => current.filter((item) => item !== id));
  }

  useEffect(() => {
    const seen = readSeen();
    const fresh = modules.filter(
      (module) =>
        moduleEarned(module, completed) &&
        !moduleEarned(module, prev.current) &&
        !seen.includes(module.id),
    );
    prev.current = completed;
    if (fresh.length)
      setQueue((current) => [...current, ...fresh.map((m) => m.id)]);
  }, [completed, modules]);

  const current = queue[0];
  const module = modules.find((m) => m.id === current);

  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(() => dismiss(current), 5000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  if (!module) return null;
  return (
    <div
      className={`sticker-toast glass ${module.color}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sticker-ring earned" aria-hidden="true">
        <Icon name={module.icon} size={26} />
      </span>
      <div>
        <strong>{t.stickerUnlocked}</strong>
        <span>{tr(module.title)}</span>
      </div>
      <button
        type="button"
        className="text-button"
        onClick={() => dismiss(module.id)}
        aria-label={t.close}
      >
        ✕
      </button>
    </div>
  );
}
