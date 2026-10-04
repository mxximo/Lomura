import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import Icon from "./Icon";
import { completion } from "../i18n/completion";
export default function VideoEmbed({ media }) {
  const { tr, lang } = useLanguage();
  const c = completion[lang];
  const [loaded, setLoaded] = useState(false);
  if (!media.video) return null;
  const valid = /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}$/.test(
    media.video,
  );
  if (!valid) return null;
  return (
    <section className="video-card">
      <div className="video-heading">
        <span className="icon-box">
          <Icon name="play" />
        </span>
        <div>
          <strong>{tr(media.video_title)}</strong>
          <span className="small muted">YouTube · {c.videos}</span>
        </div>
      </div>
      {loaded ? (
        <iframe
          src={media.video}
          title={tr(media.video_title)}
          loading="lazy"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
      ) : (
        <button
          className="video-preview"
          onClick={() => setLoaded(true)}
          aria-label={`${c.loadVideo}: ${tr(media.video_title)}`}
        >
          {media.image && <img src={media.image} alt="" loading="lazy" />}
          <span className="video-play">
            <Icon name="play" size={26} />
          </span>
          <span>{c.loadVideo}</span>
        </button>
      )}
      <p className="video-privacy small muted">{c.videoNote}</p>
      <a
        className="text-button"
        href={`https://www.youtube.com/watch?v=${media.video.split("/").pop()}`}
        target="_blank"
        rel="noreferrer"
      >
        {c.openVideo} ↗
      </a>
    </section>
  );
}
