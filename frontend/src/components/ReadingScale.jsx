import { useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import useSavedPreference from "../hooks/useSavedPreference";

const SCALES = [1, 1.12, 1.25];

export default function ReadingScale() {
  const { t } = useLanguage();
  const [level, setLevel] = useSavedPreference(
    "dw-reading-scale",
    1,
    (v) => Number.isInteger(v) && v >= 0 && v <= 2,
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--reading-scale",
      String(SCALES[level] ?? 1),
    );
  }, [level]);

  return (
    <div className="reading-tools" role="group" aria-label={t.readingSize}>
      <button
        type="button"
        aria-label={t.readingSmaller}
        disabled={level <= 0}
        onClick={() => setLevel(level - 1)}
      >
        A−
      </button>
      <button
        type="button"
        aria-label={t.readingLarger}
        disabled={level >= SCALES.length - 1}
        onClick={() => setLevel(level + 1)}
      >
        A+
      </button>
    </div>
  );
}
