import { useLanguage } from "../context/LanguageContext";
import { insightsBySlug } from "../data/lessonInsights";

export default function LessonExtras({ slug }) {
  const { t, tr } = useLanguage();
  const insight = insightsBySlug[slug];
  if (!insight) return null;

  const labels = {
    myth: tr({ es: "Mito que conviene romper", en: "Myth worth breaking" }),
    fact: tr({ es: "Para comprender mejor", en: "A closer look" }),
    challenge: tr({ es: "Mini-reto 24 h", en: "24-hour mini-challenge" }),
  };

  return (
    <section
      className="insights"
      aria-label={tr({ es: "Para ir más allá", en: "Going further" })}
    >
      <article className="insight-card myth">
        <h3>
          <span className="insight-emoji" aria-hidden="true">
            🪞
          </span>
          {labels.myth}
        </h3>
        <p>
          <strong>{tr(insight.myth)}</strong>
        </p>
        <p>{tr(insight.mythTruth)}</p>
      </article>
      <article className="insight-card fact">
        <h3>
          <span className="insight-emoji" aria-hidden="true">
            ✅
          </span>
          {labels.fact}
        </h3>
        <p>{tr(insight.fact)}</p>
        <small>
          {t.source}: {insight.source}
        </small>
      </article>
      <article className="insight-card challenge">
        <h3>
          <span className="insight-emoji" aria-hidden="true">
            ⚡
          </span>
          {labels.challenge}
        </h3>
        <p>{tr(insight.challenge)}</p>
      </article>
    </section>
  );
}
