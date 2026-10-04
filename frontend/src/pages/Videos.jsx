import { useState } from "react";
import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { useLanguage } from "../context/LanguageContext";
import { completion } from "../i18n/completion";
import VideoEmbed from "../components/VideoEmbed";

export default function Videos() {
  const { modules } = useContent();
  const { lang, tr } = useLanguage();
  const c = completion[lang];
  const [filter, setFilter] = useState("all");
  const entries = modules
    .filter((m) => filter === "all" || m.id === filter)
    .flatMap((m) =>
      m.lessons.flatMap((l) => {
        const media = [
          l.media,
          ...(l.media.extra_videos || []).map((v) => ({
            video: v.url,
            video_title: v.title,
            image: l.media.image,
          })),
        ];
        return media
          .filter((v) => v.video)
          .map((v, i) => ({
            module: m,
            lesson: l,
            media: v,
            key: `${l.id}-${i}`,
          }));
      }),
    );
  return (
    <div className="library-page">
      <header className="page-heading">
        <span className="eyebrow">{c.resources}</span>
        <h1>{c.videosTitle}</h1>
        <p>{c.videosIntro}</p>
      </header>
      <div className="library-toolbar">
        <label htmlFor="video-filter">{lang === "es" ? "Tema" : "Topic"}</label>
        <select
          id="video-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">{c.all}</option>
          {modules.map((m) => (
            <option value={m.id} key={m.id}>
              {tr(m.title)}
            </option>
          ))}
        </select>
        <span className="small muted">{entries.length} videos</span>
      </div>
      <div className="video-grid">
        {entries.map((entry) => (
          <article className="library-entry" key={entry.key}>
            <span className="eyebrow">{tr(entry.module.title)}</span>
            <VideoEmbed media={entry.media} />
            <Link className="text-button" to={`/learn/${entry.lesson.slug}`}>
              {c.lesson} →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
