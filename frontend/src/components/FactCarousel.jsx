import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { homeFacts } from "../data/lessonInsights";
import useCountUp from "../hooks/useCountUp";

function AnimatedFigure({ stat }) {
  const { lang } = useLanguage();
  const tenths = useCountUp(Math.round(stat.value * 10), 900) / 10;
  const text = tenths.toFixed(1).replace(".", lang === "es" ? "," : ".");
  return (
    <span className="fact-stat" aria-hidden="true">
      {text}
      {stat.suffix}
    </span>
  );
}

export default function FactCarousel() {
  const { tr, lang } = useLanguage();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const timer = useRef(null);
  const total = homeFacts.length;
  const fact = homeFacts[index];

  const go = useCallback(
    (next) => setIndex(((next % total) + total) % total),
    [total],
  );

  useEffect(() => {
    if (paused || stopped) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = window.setTimeout(() => go(index + 1), 6500);
    return () => window.clearTimeout(timer.current);
  }, [index, paused, stopped, go]);

  return (
    <section
      className="fact-carousel glass"
      aria-roledescription="carousel"
      aria-label={tr({ es: "Ideas para tu día", en: "Ideas for your day" })}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="fact-carousel-top">
        <span className="fact-badge">
          {tr({
            es: "PARA EXPLORAR",
            en: "TO EXPLORE",
          })}
        </span>
        <div className="fact-nav">
          <button
            type="button"
            aria-label={tr(
              stopped
                ? { es: "Reanudar carrusel", en: "Resume carousel" }
                : { es: "Pausar carrusel", en: "Pause carousel" },
            )}
            aria-pressed={stopped}
            onClick={() => setStopped((v) => !v)}
          >
            {stopped ? "▶" : "Ⅱ"}
          </button>
          <button
            type="button"
            aria-label={tr({ es: "Dato anterior", en: "Previous fact" })}
            onClick={() => go(index - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label={tr({ es: "Dato siguiente", en: "Next fact" })}
            onClick={() => go(index + 1)}
          >
            →
          </button>
        </div>
      </div>
      <div
        className="fact-body"
        key={index}
        aria-live={paused || stopped ? "polite" : "off"}
      >
        {fact.stat && (
          <>
            <AnimatedFigure key={`stat-${index}`} stat={fact.stat} />
            <span className="sr-only">
              {String(fact.stat.value).replace(".", lang === "es" ? "," : ".")}
              {fact.stat.suffix}.{" "}
            </span>
          </>
        )}
        <blockquote>“{tr(fact.quote)}”</blockquote>
        <p>{tr(fact.detail)}</p>
        <span className="fact-source">{fact.source}</span>
      </div>
      <div
        className="fact-dots"
        role="group"
        aria-label={tr({ es: "Elegir idea", en: "Choose an idea" })}
      >
        {homeFacts.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={i === index}
            aria-current={i === index}
            aria-label={`${i + 1} / ${total}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}
