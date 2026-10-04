import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";
import Icon from "../components/Icon";
export default function Credits() {
  const { t, tr, lang } = useLanguage();
  const { credits } = useContent();
  const [copied, setCopied] = useState("");
  const [failed, setFailed] = useState("");
  const [category, setCategory] = useState(null);
  const descriptions =
    lang === "es"
      ? {
          source:
            "Referencias que apoyan las lecciones y los datos del recorrido.",
          art: "Fotografías de las lecciones e ilustraciones de la marca, con sus fuentes.",
          video: "Enlaces de YouTube compartidos para las lecciones.",
          software: "Tipografías utilizadas y sus licencias.",
        }
      : {
          source: "References supporting the lessons and course facts.",
          art: "Lesson photographs and brand illustrations, with their sources.",
          video: "YouTube links provided for the lessons.",
          software: "Typefaces and their licenses.",
        };
  async function copy(ref) {
    try {
      await navigator.clipboard.writeText(tr(ref.citation));
      setCopied(ref.id);
      setFailed("");
    } catch {
      setFailed(ref.id);
      setCopied("");
    }
  }
  return (
    <div className="credits-page">
      <header className="page-heading">
        <span className="eyebrow">{t.creditsEyebrow}</span>
        <h1>{t.creditsTitle}</h1>
        <p>{t.creditsDescription}</p>
      </header>
      <div className="credit-folders">
        {["source", "video", "art", "software"].map((group) => (
          <details
            className="credit-folder glass"
            key={group}
            open={category === group}
            onToggle={(event) => {
              if (event.currentTarget.open) setCategory(group);
              else
                setCategory((current) => (current === group ? null : current));
            }}
          >
            <summary>
              <span className="credit-folder-icon">
                <Icon
                  name={
                    group === "source"
                      ? "book"
                      : group === "video"
                        ? "play"
                        : group === "art"
                          ? "leaf"
                          : "bookmark"
                  }
                />
              </span>
              <span>
                <strong>{t[`${group}Category`]}</strong>
                <span className="small muted">{descriptions[group]}</span>
              </span>
              <span className="credit-count">
                {
                  credits.references.filter((ref) => ref.category === group)
                    .length
                }
              </span>
              <span className="expand-sign" aria-hidden="true">
                +
              </span>
            </summary>
            <div className="credit-folder-content">
              {credits.references
                .filter((ref) => ref.category === group)
                .map((ref) => (
                  <details className="credit-item glass" key={ref.id}>
                    <summary>
                      {tr(ref.title)}
                      <span className="expand-sign">+</span>
                    </summary>
                    <div className="credit-content">
                      <span className="eyebrow">{t.citation}</span>
                      <p className="citation-text">{tr(ref.citation)}</p>
                      <p className="small muted">{tr(ref.note)}</p>
                      <div className="button-row">
                        <button
                          className="button secondary"
                          onClick={() => copy(ref)}
                        >
                          {copied === ref.id ? t.copied : t.copy}
                        </button>
                        {ref.url && (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-button"
                          >
                            {t.visit} ↗
                          </a>
                        )}
                      </div>
                      <span className="small" role="status">
                        {failed === ref.id
                          ? t.copyError
                          : copied === ref.id
                            ? t.copied
                            : ""}
                      </span>
                    </div>
                  </details>
                ))}
            </div>
          </details>
        ))}
      </div>
      <section className="ai-note glass credits-authorship">
        <Icon name="compass" size={24} />
        <div>
          <h2>{t.ai}</h2>
          <p>{tr(credits.ai_note)}</p>
        </div>
      </section>
    </div>
  );
}
