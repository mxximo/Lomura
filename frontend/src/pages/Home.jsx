import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";
import { useProgress } from "../context/ProgressContext";
import GlassCard from "../components/GlassCard";
import FactCarousel from "../components/FactCarousel";
import TopicSpotlight from "../components/TopicSpotlight";
import GuidedTour from "../components/GuidedTour";
import useCountUp from "../hooks/useCountUp";
import Icon from "../components/Icon";
import { completion } from "../i18n/completion";
import { refinement } from "../i18n/refinement";
export default function Home() {
  const { t, tr, lang } = useLanguage();
  const c = completion[lang];
  const { modules } = useContent();
  const { completed, lastLesson, resetProgress, storageError } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const lessons = modules.flatMap((module) => module.lessons);
  const last = lessons.find((lesson) => lesson.slug === lastLesson);
  const resume =
    last && !completed.includes(last.id)
      ? last
      : lessons.find((lesson) => !completed.includes(lesson.id));
  const hasStarted = Boolean(last || completed.length);
  const doneCount = useCountUp(completed.length);
  const featuredId = resume
    ? modules.find((m) => m.lessons.includes(resume))?.id
    : (modules.find((m) =>
        m.lessons.some((lesson) => !completed.includes(lesson.id)),
      )?.id ?? modules[0]?.id);
  const [hours, setHours] = useState(6);
  const [intention, setIntention] = useState(() => {
    try {
      return localStorage.getItem("dw-intention") || "";
    } catch {
      return "";
    }
  });
  const intentions = [
    { id: "eyes", icon: "eye", slug: "regla-20-20-20" },
    { id: "posture", icon: "posture", slug: "espacio-ergonomico" },
    { id: "focus", icon: "timeblock", slug: "pomodoro" },
    { id: "quiet", icon: "bellOff", slug: "notificaciones" },
  ];
  const selectedIntention = intentions.find((item) => item.id === intention);
  function chooseIntention(id) {
    setIntention(id);
    try {
      localStorage.setItem("dw-intention", id);
    } catch {
      /* Optional local preference. */
    }
  }
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="lumora-signature">
            <span aria-hidden="true" /> Lumora · {t.learn}
          </p>
          <h1>
            {t.hero1}
            <br />
            <span>{t.hero2}</span>
          </h1>
          <p className="hero-description">{t.heroDescription}</p>
          <div className="hero-buttons">
            <Link
              className="button primary"
              to={resume ? `/learn/${resume.slug}` : "/quiz"}
            >
              {hasStarted ? (resume ? t.resumeJourney : t.takeQuiz) : t.start}
              <Icon name="arrow" size={18} />
            </Link>
            <a className="text-button" href="#daily-intention">
              {refinement[lang].chooseHabit}
              <span aria-hidden="true"> ↘</span>
            </a>
          </div>
          {hasStarted && resume && (
            <p className="resume-caption">{tr(resume.intro)}</p>
          )}
          <ul className="hero-proof" aria-label={lang === "es" ? "Sobre Lumora" : "About Lumora"}>
            {[t.free, t.accountless, t.bilingual].map((label) => (
              <li key={label}><Icon name="check" size={14} />{label}</li>
            ))}
          </ul>
        </div>
        <div className="hero-art">
          <div className="art-halo" />
          <img
            src="/media/hero-800.webp"
            srcSet="/media/hero-480.webp 480w, /media/hero-800.webp 800w, /media/hero-1254.webp 1254w"
            sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) 70vw, 46vw"
            width="1254"
            height="1254"
            fetchPriority="high"
            alt={t.heroAlt}
            className="hero-illustration"
          />
          <div className="floating-note note-top glass">
            <span className="mini-icon">
              <Icon name="leaf" size={19} />
            </span>
            <div>
              <strong>{t.dailyTitle}</strong>
              <small>{t.learn}</small>
            </div>
          </div>
          <div className="floating-note note-bottom glass">
            <span className="mini-icon purple">
              <Icon name="eye" size={20} />
            </span>
            <span>20 · 20 · 20</span>
            <span className="note-check">
              <Icon name="check" size={15} />
            </span>
          </div>
        </div>
      </section>
      <section id="daily-intention" className="home-intention">
        <GlassCard className="intention-card">
          <div className="intention-header">
            <div>
              <span className="eyebrow">{t.intentionEyebrow}</span>
              <h2>{t.intentionTitle}</h2>
            </div>
            <span className="intention-orbit" aria-hidden="true">
              <Icon name="compass" size={29} />
            </span>
          </div>
          {!selectedIntention ? (
            <>
              <p>{t.intentionText}</p>
              <div className="intention-options">
                {intentions.map((item, index) => (
                  <button
                    key={item.id}
                    className="intention-option"
                    onClick={() => chooseIntention(item.id)}
                  >
                    <span>
                      <Icon name={item.icon} size={20} />
                    </span>
                    {t.intentionOptions[index]}
                    <Icon name="arrow" size={16} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="intention-saved">
              <span className="saved-icon">
                <Icon name={selectedIntention.icon} size={25} />
              </span>
              <div>
                <span className="small muted">{t.intentionSaved}</span>
                <strong>
                  {t.intentionOptions[intentions.indexOf(selectedIntention)]}
                </strong>
              </div>
              <Link
                className="button primary"
                to={`/learn/${selectedIntention.slug}`}
              >
                {t.intentionStart}
                <Icon name="arrow" size={17} />
              </Link>
              <button
                className="text-button"
                onClick={() => chooseIntention("")}
              >
                {t.intentionChange}
              </button>
            </div>
          )}
        </GlassCard>
      </section>
      <section id="modules" className="modules-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t.path}</span>
            <h2>{t.routeTitle}</h2>
            <p>{t.routeDescription}</p>
            <p className="journey-meta">{t.journeyMeta}</p>
            <GuidedTour />
          </div>
          <div className="learning-progress">
            <span>
              {doneCount}
              <span className="muted"> / 10</span>
            </span>
            <small>{t.completedLessons}</small>
            <progress
              value={completed.length}
              max="10"
              aria-label={t.progress}
            />
          </div>
        </div>
        <TopicSpotlight />
        {hasStarted && resume && (
          <Link to={`/learn/${resume.slug}`} className="next-step glass">
            <span className="next-step-label">{t.nextStep}</span>
            <span className="next-step-lesson">{tr(resume.intro)}</span>
            <span className="next-step-go" aria-hidden="true">
              <Icon name="arrow" size={19} />
            </span>
          </Link>
        )}
        <div className="module-grid journey-rail">
          {modules.map((module, index) => {
            const num = String(index + 1).padStart(2, "0");
            const done = module.lessons.filter((lesson) =>
              completed.includes(lesson.id),
            ).length;
            const status =
              done === module.lessons.length
                ? t.statusDone
                : done > 0
                  ? t.statusGoing
                  : t.statusTodo;
            const statusClass =
              done === module.lessons.length
                ? "is-done"
                : done > 0
                  ? "is-going"
                  : "is-todo";
            const target =
              module.lessons.find((lesson) => !completed.includes(lesson.id)) ||
              module.lessons[0];
            if (module.id === featuredId) {
              return (
                <Link
                  key={module.id}
                  to={`/learn/${target.slug}`}
                  className={`module-card glass featured ${module.color}`}
                  aria-label={`${tr(module.title)} — ${done} / ${module.lessons.length}`}
                >
                  <span className="ghost-number" aria-hidden="true">
                    {num}
                  </span>
                  <div className="featured-copy">
                    <div className="module-card-top">
                      <span className="module-icon">
                        <Icon name={module.icon} size={27} />
                      </span>
                      <span className="module-number">
                        {t.module} {num}
                      </span>
                      <span className={`status-pill ${statusClass}`}>
                        {status}
                      </span>
                    </div>
                    <span className="theme-word">{t.topicFocus[index]}</span>
                    <h3>{tr(module.title)}</h3>
                    <p>{tr(module.description)}</p>
                    <ul className="mini-lessons">
                      {module.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className={
                            completed.includes(lesson.id) ? "done" : ""
                          }
                        >
                          <span className="mini-dot" aria-hidden="true">
                            {completed.includes(lesson.id) ? "✓" : ""}
                          </span>
                          {tr(lesson.intro)}
                        </li>
                      ))}
                    </ul>
                    <span className="module-cta">
                      {tr(target.intro)}
                      <Icon name="arrow" size={18} />
                    </span>
                  </div>
                  <div className="featured-art" aria-hidden="true">
                    <img
                      src={module.lessons[0].media.image}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                </Link>
              );
            }
            return (
              <Link
                key={module.id}
                to={`/learn/${target.slug}`}
                className={`module-card glass ${module.color}`}
                aria-label={`${tr(module.title)} — ${done} / ${module.lessons.length}`}
              >
                <span className="ghost-number" aria-hidden="true">
                  {num}
                </span>
                <div className="module-card-top">
                  <span className="module-icon">
                    <Icon name={module.icon} size={27} />
                  </span>
                  <span className={`status-pill ${statusClass}`}>{status}</span>
                </div>
                <div className="module-art-preview" aria-hidden="true">
                  <img src={module.lessons[0].media.image} width="600" height="360" loading="lazy" alt="" />
                </div>
                <span className="theme-word">{t.topicFocus[index]}</span>
                <h3>{tr(module.title)}</h3>
                <ul className="mini-lessons">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className={completed.includes(lesson.id) ? "done" : ""}
                    >
                      <span className="mini-dot" aria-hidden="true">
                        {completed.includes(lesson.id) ? "✓" : ""}
                      </span>
                      {tr(lesson.intro)}
                    </li>
                  ))}
                </ul>
                <div className="module-card-footer">
                  <span
                    className="module-mini-progress"
                    role="img"
                    aria-label={`${done} / ${module.lessons.length}`}
                  >
                    <i
                      style={{
                        "--fill": String(done / module.lessons.length),
                      }}
                    />
                  </span>
                  <span>
                    {done} / {module.lessons.length} {t.checkCount}
                  </span>
                  <span className="card-arrow">
                    <Icon name="arrow" size={19} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      <div className="home-bottom">
        <FactCarousel />
        <GlassCard className="checkin-card">
          <div className="checkin-heading">
            <span className="icon-box">
              <Icon name="clock" />
            </span>
            <div>
              <h2>{t.checkin}</h2>
              <p>{t.checkinDescription}</p>
            </div>
          </div>
          <div className="screen-value">
            <output htmlFor="screen-hours">{hours}</output>
            <span>{t.hours}</span>
          </div>
          <label className="sr-only" htmlFor="screen-hours">
            {t.checkinDescription}
          </label>
          <input
            id="screen-hours"
            type="range"
            min="0"
            max="24"
            step="1"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
          <div className="range-labels">
            <span>0 h</span>
            <span>12 h</span>
            <span>24 h</span>
          </div>
          <p className="checkin-feedback" aria-live="polite">
            {hours < 4 ? t.screenLow : hours < 9 ? t.screenMid : t.screenHigh}
          </p>
          <p className="small muted">{t.checkinNote}</p>
        </GlassCard>
        <GlassCard className="reminder-card">
          <span className="eyebrow">{t.daily}</span>
          <div className="reminder-flower" aria-hidden="true">
            <Icon name="leaf" size={52} />
          </div>
          <h2>{t.dailyTitle}</h2>
          <p>{t.dailyText}</p>
          <Link to="/learn/pausa-activa" className="text-button">
            {t.stretchTitle} <Icon name="arrow" size={17} />
          </Link>
        </GlassCard>
      </div>
      <section className="quiz-banner glass">
        <span className="icon-box">
          <Icon name="compass" size={27} />
        </span>
        <div>
          <h2>{t.finalCta}</h2>
          <p>{t.finalText}</p>
        </div>
        <Link className="button secondary" to="/quiz">
          {t.takeQuiz}
          <Icon name="arrow" size={18} />
        </Link>
      </section>
      <section className="experience-links glass">
        <div>
          <span className="eyebrow">{c.overview}</span>
          <h2>{c.overviewTitle}</h2>
          <p>{c.overviewText}</p>
        </div>
        <div className="button-row">
          <Link className="button secondary" to="/videos">
            <Icon name="play" size={18} />
            {c.videos}
          </Link>
          <Link className="button primary" to="/survey">
            {c.survey} →
          </Link>
        </div>
      </section>
      {hasStarted && (
        <section className="journey-settings">
          <p className="small muted">
            {storageError ? t.storageUnavailable : t.localProgress}
          </p>
          {confirmReset ? (
            <div className="feedback">
              <p>{t.progressResetHint}</p>
              <div className="button-row">
                <button
                  className="button secondary"
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                  }}
                >
                  {t.confirmReset}
                </button>
                <button
                  className="text-button"
                  onClick={() => setConfirmReset(false)}
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <button
              className="text-button"
              onClick={() => setConfirmReset(true)}
            >
              {t.progressReset}
            </button>
          )}
        </section>
      )}
    </>
  );
}
