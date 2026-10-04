import LessonImage from "../components/LessonImage";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";
import { useProgress } from "../context/ProgressContext";
import Activities from "../components/Activities";
import FocusMode from "../components/FocusMode";
import LessonExtras from "../components/LessonExtras";
import ReadingScale from "../components/ReadingScale";
import ConfettiBurst from "../components/Confetti";
import VideoEmbed from "../components/VideoEmbed";
import GlassCard from "../components/GlassCard";
import Icon from "../components/Icon";
import NotFound from "./NotFound";
export default function Lesson() {
  const { slug } = useParams();
  const { t, tr } = useLanguage();
  const { modules } = useContent();
  const { completed, toggle, visit, storageError } = useProgress();
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const lessons = modules.flatMap((m) => m.lessons);
  const index = lessons.findIndex((l) => l.slug === slug);
  const lesson = lessons[index];
  const module = modules.find((m) => m.lessons.includes(lesson));
  useEffect(() => {
    if (lesson) visit(lesson.slug);
  }, [lesson, visit]);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [copied]);
  useEffect(() => {
    if (!celebrate) return;
    const timer = setTimeout(() => setCelebrate(false), 2400);
    return () => clearTimeout(timer);
  }, [celebrate]);
  if (!lesson) return <NotFound />;
  async function copyTakeaway() {
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(tr(lesson.takeaway));
      setCopied(true);
    } catch {
      setCopied(false);
      setCopyFailed(true);
    }
  }
  return (
    <div className={`lesson-page ${module.color}`}>
      <FocusMode />
      <nav className="breadcrumb" aria-label={t.path}>
        <Link to="/">{t.home}</Link>
        <span>/</span>
        <Link to="/#modules">{tr(module.title)}</Link>
        <span>/</span>
        <span>{lesson.id}</span>
      </nav>
      <div className="lesson-layout">
        <button
          className="journey-toggle"
          aria-expanded={journeyOpen}
          aria-controls="lesson-journey"
          onClick={() => setJourneyOpen(!journeyOpen)}
        >
          <Icon name="book" size={20} />
          <span>
            {t.chooseLesson}
            <small>{tr(module.title)}</small>
          </span>
          <span aria-hidden="true">{journeyOpen ? "−" : "+"}</span>
        </button>
        <aside
          id="lesson-journey"
          className={`lesson-sidebar glass ${journeyOpen ? "journey-open" : ""}`}
          aria-label={t.path}
        >
          <span className="eyebrow">{t.path}</span>
          {modules.map((m, i) => {
            const isCurrentModule = m.id === module.id;
            return (
              <div
                className={`sidebar-module ${m.color} ${isCurrentModule ? "is-current-module" : ""}`}
                key={m.id}
              >
                <span className={`sidebar-title ${m.color}`}>
                  <span className="sidebar-module-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon name={m.icon} size={16} />
                  <span>{tr(m.title)}</span>
                  {isCurrentModule && (
                    <small className="sidebar-current-tag">{t.current}</small>
                  )}
                </span>
                {m.lessons.map((l) => (
                  <Link
                    className={l.slug === slug ? "current-lesson" : ""}
                    to={`/learn/${l.slug}`}
                    key={l.id}
                    aria-current={l.slug === slug ? "page" : undefined}
                    onClick={() => setJourneyOpen(false)}
                  >
                    <span
                      className={
                        completed.includes(l.id)
                          ? "lesson-dot done"
                          : "lesson-dot"
                      }
                    >
                      {completed.includes(l.id) ? "✓" : ""}
                    </span>
                    {tr(l.intro)}
                  </Link>
                ))}
              </div>
            );
          })}
          <div className="sidebar-progress">
            <span>
              {completed.length} / 10 {t.completedLessons}
            </span>
            <progress
              value={completed.length}
              max="10"
              aria-label={t.progress}
            />
          </div>
        </aside>
        <div className="lesson-main" key={slug}>
          <header className="lesson-heading">
            <div className="lesson-topic-bar">
              <span className="lesson-topic-icon">
                <Icon name={module.icon} size={22} />
              </span>
              <span>
                <small>
                  {t.module}{" "}
                  {String(modules.indexOf(module) + 1).padStart(2, "0")}
                </small>
                <strong>{tr(module.title)}</strong>
              </span>
              <em>{String(index + 1).padStart(2, "0")} / 10</em>
            </div>
            <span className="eyebrow">
              {t.module} {lesson.id} <span className="label-divider">/</span>{" "}
              {tr(lesson.intro)}
            </span>
            <h1>{tr(lesson.title)}</h1>
            <p className="reading-time">
              {Math.max(
                1,
                Math.round(
                  lesson.paragraphs
                    .map((p) => tr(p))
                    .join(" ")
                    .split(/\s+/).length / 200,
                ),
              )}{" "}
              {t.readingTime}
            </p>
            <a className="text-button practice-jump" href="#lesson-practice">
              {t.goPractice} ↓
            </a>
          </header>
          <div className="lesson-columns">
            <div className="lesson-reading">
              <GlassCard className="lesson-text">
                <ReadingScale />
                <LessonImage
                  className="lesson-art"
                  src={lesson.media.image}
                  alt={tr(lesson.media.alt)}
                />
                {lesson.paragraphs.map((p, i) => (
                  <p key={i}>{tr(p)}</p>
                ))}
                <div className="takeaway">
                  <Icon name="bookmark" size={20} />
                  <div>
                    <strong>{t.takeaway}</strong>
                    <p>{tr(lesson.takeaway)}</p>
                  </div>
                </div>
                <button
                  className="copy-takeaway"
                  onClick={copyTakeaway}
                  aria-live="polite"
                >
                  <Icon name="copy" size={16} />
                  {copied ? t.copiedIdea : t.copyIdea}
                </button>
                {copyFailed && (
                  <p className="error-text" role="alert">
                    {t.copyIdeaError}
                  </p>
                )}
                <div className="sources">
                  <span>{t.source}:</span>
                  {lesson.sources.map((s) => (
                    <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
                      {s.name} ↗
                    </a>
                  ))}
                  <span className="review-tag">{t.review}</span>
                </div>
              </GlassCard>
              <VideoEmbed key={lesson.id} media={lesson.media} />
              {lesson.media.extra_videos?.map((video) => (
                <VideoEmbed
                  key={video.url}
                  media={{
                    video: video.url,
                    video_title: video.title,
                    image: lesson.media.image,
                  }}
                />
              ))}
              <LessonExtras slug={lesson.slug} />
            </div>
            <GlassCard
              id="lesson-practice"
              className="activity-card"
              tabIndex="-1"
            >
              <span className="eyebrow">{t.activity}</span>
              <Activities
                key={lesson.id}
                type={lesson.interaction}
                data={lesson.interaction_data}
              />
            </GlassCard>
          </div>
          <div className="lesson-complete">
            {celebrate && <ConfettiBurst />}
            <button
              className={`button ${completed.includes(lesson.id) ? "secondary" : "primary"}`}
              aria-pressed={completed.includes(lesson.id)}
              onClick={() => {
                if (!completed.includes(lesson.id)) setCelebrate(true);
                toggle(lesson.id);
              }}
            >
              <Icon name="check" size={18} />
              {completed.includes(lesson.id) ? t.completed : t.complete}
            </button>
            <span className="completion-message" role="status">
              {completed.includes(lesson.id)
                ? storageError
                  ? t.storageUnavailable
                  : t.progressSaved
                : ""}
            </span>
            {completed.includes(lesson.id) && (
              <Link
                className="button primary"
                to={
                  index < lessons.length - 1
                    ? `/learn/${lessons[index + 1].slug}`
                    : "/quiz"
                }
              >
                {index < lessons.length - 1 ? t.continue : t.takeQuiz}
                <Icon name="arrow" size={18} />
              </Link>
            )}
          </div>
          <nav className="lesson-navigation" aria-label={t.path}>
            <Link to={index > 0 ? `/learn/${lessons[index - 1].slug}` : "/"}>
              <span>← {t.previous}</span>
              <strong>
                {index > 0 ? tr(lessons[index - 1].intro) : t.home}
              </strong>
            </Link>
            <Link
              to={index < 9 ? `/learn/${lessons[index + 1].slug}` : "/quiz"}
            >
              <span>{t.next} →</span>
              <strong>
                {index < 9 ? tr(lessons[index + 1].intro) : t.quiz}
              </strong>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
