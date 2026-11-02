import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";
import { useProgress } from "../context/ProgressContext";
import LessonImage from "../components/LessonImage";
import PhotoCaption from "../components/PhotoCaption";
import Icon from "../components/Icon";
import Comments from "../components/Comments";
import { completion } from "../i18n/completion";

export default function Home({ hash = "" }) {
  const { t, tr, lang } = useLanguage();
  const { modules } = useContent();
  const { completed, lastLesson, resetProgress, storageError } = useProgress();
  const [commentsOpen, setCommentsOpen] = useState(hash === "#comments");
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => { if (hash === "#comments") setCommentsOpen(true); }, [hash]);
  const lessons = modules.flatMap(module => module.lessons);
  const last = lessons.find(lesson => lesson.slug === lastLesson);
  const resume = last && !completed.includes(last.id) ? last : lessons.find(lesson => !completed.includes(lesson.id));
  const hasStarted = Boolean(last || completed.length);
  const c = completion[lang];
  const copy = lang === "es" ? {
    intro: "Aprende a cuidar tu vista, tu postura y tu tiempo frente a las pantallas. Lecciones breves con ejercicios para tu día a día.",
    explore: "Ver los temas", title: "¿Por dónde quieres empezar?", hint: "Elige un tema. Puedes seguir el orden o ir directamente a lo que necesitas.",
    lessons: "2 lecciones", progress: "Tu avance", resources: "Para seguir aprendiendo", quiz: "Pon a prueba lo aprendido", videos: "Mira las explicaciones en video", survey: "Cuéntanos cómo fue tu experiencia",
    voices: "Voces de Lumora", voicesHint: "Lee los comentarios o comparte tu experiencia.", settings: "Mi progreso en este navegador",
  } : {
    intro: "Learn to look after your eyes, posture and time in front of screens. Short lessons with exercises for everyday life.",
    explore: "Explore the topics", title: "Where would you like to start?", hint: "Choose a topic. Follow the order or go straight to what you need.",
    lessons: "2 lessons", progress: "Your progress", resources: "Keep learning", quiz: "Put what you learned into practice", videos: "Watch the video explanations", survey: "Tell us about your experience",
    voices: "Voices of Lumora", voicesHint: "Read the comments or share your experience.", settings: "My progress in this browser",
  };
  return <div className="home-simple">
    <section className="simple-hero" aria-labelledby="home-title">
      <div className="simple-hero-copy">
        <p className="simple-eyebrow">{t.free} · {t.accountless}</p>
        <h1 id="home-title">{t.hero1}<br /><span>{t.hero2}</span></h1>
        <p className="simple-intro">{copy.intro}</p>
        <div className="simple-actions">
          <Link className="button primary" to={resume ? `/learn/${resume.slug}` : "/quiz"}>
            {hasStarted ? (resume ? t.resumeJourney : t.takeQuiz) : t.start}<Icon name="arrow" size={18} />
          </Link>
          <a className="text-button" href="#modules">{copy.explore}</a>
        </div>
        {hasStarted && resume && <p className="simple-resume">{tr(resume.intro)} · {completed.length}/10 {t.completedLessons}</p>}
      </div>
      <figure className="simple-photo">
        <LessonImage src="/media/photos/notifications-co-960.webp" sizes="(max-width: 700px) calc(100vw - 48px), 38vw" fetchPriority="high"
          alt={lang === "es" ? "Tres amigos compartiendo un momento alrededor de un teléfono en Barranquilla." : "Three friends sharing a moment around a phone in Barranquilla."} />
        <PhotoCaption attribution={{ location: "Barranquilla, Colombia", author: "Samuel Figueroa", url: "https://www.pexels.com/photo/two-women-and-a-man-smiling-while-looking-at-a-phone-2837382/" }} />
      </figure>
    </section>
    <section id="modules" className="simple-topics" aria-labelledby="topics-title">
      <header><h2 id="topics-title">{copy.title}</h2><p>{copy.hint}</p></header>
      <div className="simple-topic-grid">
        {modules.map((module, index) => {
          const done = module.lessons.filter(lesson => completed.includes(lesson.id)).length;
          const target = module.lessons.find(lesson => !completed.includes(lesson.id)) || module.lessons[0];
          return <Link key={module.id} className="simple-topic" to={`/learn/${target.slug}`}>
            <span className="simple-topic-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{tr(module.title)}</h3><p>{tr(module.description)}</p><span className="simple-topic-meta">{hasStarted ? `${done}/2 ${t.completedLessons}` : copy.lessons}</span></div>
            <Icon name={done === 2 ? "check" : "arrow"} size={20} />
          </Link>;
        })}
      </div>
    </section>
    <section className="simple-resources" aria-labelledby="resources-title">
      <h2 id="resources-title">{copy.resources}</h2>
      <div>
        {[{to:"/quiz", label:t.quiz, text:copy.quiz, icon:"check"}, {to:"/videos",label:c.videos,text:copy.videos,icon:"play"}, {to:"/survey",label:c.survey,text:copy.survey,icon:"arrow"}].map(item =>
          <Link key={item.to} to={item.to}><Icon name={item.icon} size={19} /><span><strong>{item.label}</strong><small>{item.text}</small></span><span aria-hidden="true">↗</span></Link>
        )}
      </div>
    </section>
    <details id="comments" className="simple-community" open={commentsOpen} onToggle={event => setCommentsOpen(event.currentTarget.open)}>
      <summary><span><strong>{copy.voices}</strong><small>{copy.voicesHint}</small></span><span className="simple-disclosure" aria-hidden="true">+</span></summary>
      {commentsOpen && <Comments id="community" />}
    </details>
    {hasStarted && <details className="simple-settings"><summary>{copy.settings}</summary>
      <p>{storageError ? t.storageUnavailable : t.localProgress}</p>
      {confirmReset ? <div><p>{t.progressResetHint}</p><div className="button-row">
        <button className="button secondary" onClick={() => {resetProgress();setConfirmReset(false);}}>{t.confirmReset}</button>
        <button className="text-button" onClick={() => setConfirmReset(false)}>{t.cancel}</button>
      </div></div> : <button className="text-button" onClick={() => setConfirmReset(true)}>{t.progressReset}</button>}
    </details>}
  </div>;
}
