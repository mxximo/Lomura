import { useLanguage } from "../context/LanguageContext";
import Quiz from "../components/Quiz";
import { completion } from "../i18n/completion";
import { quizExperience } from "../i18n/quizExperience";
import { refinement } from "../i18n/refinement";
export default function FinalQuiz() {
  const { t, lang } = useLanguage();
  return (
    <div className="quiz-page">
      <header className="page-heading">
        <span className="eyebrow">{t.quizEyebrow}</span>
        <h1>{t.quizTitle}</h1>
        <p>{t.quizDescription}</p>
      </header>
      <Quiz />
      <details className="quiz-help">
        <summary>{refinement[lang].quizHelp}</summary>
        <p>{quizExperience[lang].hint}</p>
        <p>{completion[lang].quizPrivacy}</p>
      </details>
    </div>
  );
}
