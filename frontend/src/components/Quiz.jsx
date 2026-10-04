import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";
import { submitQuiz, completeQuiz } from "../services/api";
import { completion } from "../i18n/completion";
import { quizExperience } from "../i18n/quizExperience";
import { refinement } from "../i18n/refinement";
import Icon from "./Icon";
import ConfettiBurst from "./Confetti";
import useSavedPreference from "../hooks/useSavedPreference";
import useCountUp from "../hooks/useCountUp";

const draftKey = "dw-quiz-draft-v1";
function contentVersion(questions) {
  let hash = 2166136261;
  for (const c of JSON.stringify(questions))
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return String(hash >>> 0);
}
function readDraft(bank, version) {
  try {
    const d = JSON.parse(localStorage.getItem(draftKey));
    if (
      !d ||
      d.version !== version ||
      !Array.isArray(d.ids) ||
      !d.ids.length ||
      new Set(d.ids).size !== d.ids.length ||
      !d.ids.every((id) => bank.some((q) => q.id === id))
    )
      return null;
    if (
      !Number.isInteger(d.index) ||
      d.index < 0 ||
      d.index >= d.ids.length ||
      !Array.isArray(d.answers) ||
      d.answers.length < d.index ||
      d.answers.length > d.index + 1
    )
      return null;
    if (
      !d.answers.every(
        (a, i) =>
          a.question_id === d.ids[i] &&
          bank
            .find((q) => q.id === a.question_id)
            .options.some((o) => o.id === a.option_id),
      )
    )
      return null;
    if (
      d.selected &&
      !bank
        .find((q) => q.id === d.ids[d.index])
        .options.some((o) => o.id === d.selected)
    )
      return null;
    return d;
  } catch {
    return null;
  }
}

export default function Quiz() {
  const { t, tr, lang } = useLanguage();
  const copy = quizExperience[lang];
  const { questions: bank, modules } = useContent();
  const version = contentVersion(bank);
  const submissionId = useRef(crypto.randomUUID());
  const submittedLanguage = useRef(null);
  const [pending, setPending] = useState(() => readDraft(bank, version));
  const [ids, setIds] = useState(() => bank.map((q) => q.id));
  const questions = ids.map((id) => bank.find((q) => q.id === id));
  const [manual, setManual] = useSavedPreference(
    "dw-quiz-manual",
    true,
    (v) => typeof v === "boolean",
  );
  const [restored, setRestored] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [lastResult, setLastResult] = useSavedPreference(
    "dw-last-result-v1",
    null,
    (value) =>
      value === null ||
      (value &&
        Number.isInteger(value.score) &&
        Number.isInteger(value.total) &&
        value.total > 0 &&
        value.total <= 10 &&
        value.score >= 0 &&
        value.score <= value.total &&
        Number.isFinite(value.date) &&
        value.date > 0),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [verifiedAnswers, setVerifiedAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [slideBack, setSlideBack] = useState(false);
  const prevIndex = useRef(0);
  const animatedScore = useCountUp(result?.score ?? 0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const advancing = useRef(false);
  const advanceTimer = useRef(null);
  const checking = useRef(false);
  const question = questions[index];
  const heading = useRef(null);
  useEffect(() => {
    if (index > 0 || result) heading.current?.focus({ preventScroll: true });
    if (index !== prevIndex.current || result)
      heading.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    setSlideBack(index < prevIndex.current);
    prevIndex.current = index;
  }, [index, result]);
  async function check() {
    if (checking.current || !selected || feedback) return;
    checking.current = true;
    setBusy(true);
    setError(false);
    try {
      const answer = { question_id: question.id, option_id: selected };
      const data = await submitQuiz([answer]);
      setFeedback(data.results[0]);
      setVerifiedAnswers((old) => [
        ...old.filter((r) => r.question_id !== question.id),
        data.results[0],
      ]);
      if (data.results[0]?.correct) {
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        setStreak(0);
      }
      setRestored(false);
      setAutoAdvance(!manual && !document.hidden);
      setAnswers((old) => [
        ...old.filter((a) => a.question_id !== question.id),
        answer,
      ]);
    } catch {
      setError(true);
    } finally {
      checking.current = false;
      setBusy(false);
    }
  }
  const next = useCallback(async () => {
    if (!feedback || advancing.current) return;
    window.clearTimeout(advanceTimer.current);
    advancing.current = true;
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setSelected("");
      setFeedback(null);
      setError(false);
      advancing.current = false;
    } else {
      setBusy(true);
      setError(false);
      try {
        if (!submittedLanguage.current) submittedLanguage.current = lang;
        setResult(
          answers.length === bank.length
            ? await completeQuiz(
                answers,
                submissionId.current,
                submittedLanguage.current,
              )
            : await submitQuiz(answers),
        );
      } catch {
        setError(true);
      } finally {
        advancing.current = false;
        setBusy(false);
      }
    }
  }, [index, questions.length, answers, feedback, bank.length, lang]);
  useEffect(() => {
    if (!feedback?.correct || !autoAdvance || result || error) return;
    advanceTimer.current = window.setTimeout(next, 3000);
    return () => window.clearTimeout(advanceTimer.current);
  }, [feedback?.correct, autoAdvance, result, error, next]);
  useEffect(() => {
    function pauseWhenHidden() {
      if (document.hidden) {
        window.clearTimeout(advanceTimer.current);
        setAutoAdvance(false);
      }
    }
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () =>
      document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);
  useEffect(() => {
    if (pending) return;
    try {
      if (result || (!answers.length && !selected))
        localStorage.removeItem(draftKey);
      else
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            version,
            ids,
            index,
            answers,
            selected,
            submissionId: submissionId.current,
            submittedLanguage: submittedLanguage.current,
          }),
        );
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [version, ids, index, answers, selected, result, pending]);
  useEffect(() => {
    if (result)
      setLastResult({
        score: result.score,
        total: result.total,
        date: Date.now(),
      });
  }, [result, setLastResult]);
  async function resumeDraft() {
    if (checking.current) return;
    checking.current = true;
    setBusy(true);
    setError(false);
    try {
      const verified = pending.answers.length
        ? await submitQuiz(pending.answers)
        : null;
      const current = pending.answers.find(
        (a) => a.question_id === pending.ids[pending.index],
      );
      setIds(pending.ids);
      if (
        typeof pending.submissionId === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          pending.submissionId,
        )
      )
        submissionId.current = pending.submissionId;
      if (["es", "en"].includes(pending.submittedLanguage))
        submittedLanguage.current = pending.submittedLanguage;
      setIndex(pending.index);
      setAnswers(pending.answers);
      setVerifiedAnswers(verified?.results || []);
      setSelected(current?.option_id || pending.selected || "");
      setFeedback(
        current
          ? verified.results.find((r) => r.question_id === current.question_id)
          : null,
      );
      setAutoAdvance(false);
      setRestored(true);
      setPending(null);
      if (verified) {
        let trailing = 0;
        let best = 0;
        let run = 0;
        for (const id of pending.ids.slice(0, pending.index + 1)) {
          const r = verified.results.find((x) => x.question_id === id);
          if (r?.correct) {
            run += 1;
            best = Math.max(best, run);
          } else if (pending.answers.some((a) => a.question_id === id)) {
            run = 0;
          }
        }
        const currentCorrect =
          current &&
          verified.results.find((r) => r.question_id === current.question_id)
            ?.correct;
        trailing = currentCorrect ? run : 0;
        // If current not yet answered, trailing counts answers before it.
        if (!current) {
          trailing = 0;
          run = 0;
          for (const id of pending.ids.slice(0, pending.index)) {
            const r = verified.results.find((x) => x.question_id === id);
            if (r?.correct) {
              run += 1;
              best = Math.max(best, run);
            } else {
              run = 0;
            }
          }
          trailing = run;
        }
        setStreak(trailing);
        setBestStreak(best);
      }
    } catch {
      setError(true);
    } finally {
      checking.current = false;
      setBusy(false);
    }
  }
  function reset(nextIds = bank.map((q) => q.id)) {
    submissionId.current = crypto.randomUUID();
    submittedLanguage.current = null;
    setIds(nextIds);
    setPending(null);
    setRestored(false);
    setStreak(0);
    setBestStreak(0);
    prevIndex.current = 0;
    window.clearTimeout(advanceTimer.current);
    setIndex(0);
    setSelected("");
    setAnswers([]);
    setFeedback(null);
    setVerifiedAnswers([]);
    setResult(null);
    setError(false);
  }
  if (pending)
    return (
      <section className="quiz-card glass resume-quiz" aria-busy={busy}>
        <Icon name="book" size={32} />
        <h2>{t.resumeQuiz}</h2>
        <p>
          {t.question} {pending.index + 1} / {pending.ids.length}.{" "}
          {t.resumeQuizHint}
        </p>
        <div className="button-row">
          <button
            className="button primary"
            disabled={busy}
            onClick={resumeDraft}
          >
            {busy ? t.checking : t.continueAttempt}
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => reset()}
          >
            {t.newAttempt}
          </button>
        </div>
        {error && (
          <p role="alert" className="error-text">
            {t.quizError}
          </p>
        )}
      </section>
    );
  if (result) {
    const ratio = result.total ? result.score / result.total : 0;
    const tier =
      ratio >= 1
        ? t.tierPerfect
        : ratio >= 0.8
          ? t.tierHigh
          : ratio >= 0.5
            ? t.tierMid
            : t.tierLow;
    const mistakes = result.results.filter((r) => !r.correct);
    const reviewLesson = mistakes.length
      ? modules
          .flatMap((m) => m.lessons)
          .find(
            (l) =>
              l.id ===
              bank.find((q) => q.id === mistakes[0].question_id)?.lesson_id,
          )
      : null;
    return (
      <section className="quiz-card glass quiz-result">
        <span className="result-icon">
          <Icon name="badge" size={40} />
        </span>
        <h2 ref={heading} tabIndex="-1">
          {t.result}
        </h2>
        <p className="quiz-result-kicker">{copy.saved}</p>
        <div
          className="quiz-score-ring"
          style={{ "--score-angle": `${ratio * 360}deg` }}
        >
          <div
            className="result-number result-score-big"
            role="img"
            aria-label={`${result.score} / ${result.total}`}
          >
            <span aria-hidden="true">
              {animatedScore}
              <span> / {result.total}</span>
            </span>
          </div>
        </div>
        <span className="result-tier">{tier}</span>
        <p>
          {t.scoreText}
          {bestStreak >= 2 ? ` · 🔥 ${bestStreak} ${t.streak}` : ""}
        </p>
        <p>{t.resultText}</p>
        {result.receipt && (
          <p className="server-receipt" role="status">
            ✓ {completion[lang].quizSaved}
            <code>{result.receipt.id}</code>
          </p>
        )}
        <div className="quiz-next-step">
          <Icon name={mistakes.length ? "book" : "leaf"} size={26} />
          <h3>{copy.nextTitle}</h3>
          <p>{mistakes.length ? copy.nextHint : copy.perfectHint}</p>
          <Link
            className="text-button"
            to={reviewLesson ? `/learn/${reviewLesson.slug}` : "/"}
          >
            {reviewLesson ? tr(reviewLesson.title) : copy.explore}
            <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="quiz-result-actions">
          <Link className="button secondary" to="/survey">
            {completion[lang].survey} →
          </Link>
          <button className="button primary" onClick={() => reset()}>
            {t.restart}
          </button>
          {result.results.some((r) => !r.correct) && (
            <button
              className="button secondary retry-errors"
              onClick={() =>
                reset(
                  result.results
                    .filter((r) => !r.correct)
                    .map((r) => r.question_id),
                )
              }
            >
              {t.retryErrors}
            </button>
          )}
        </div>
        <div className="quiz-mastery-heading">
          <h3>{t.mastery}</h3>
          <p>{copy.masteryHint}</p>
        </div>
        <div className="module-mastery" aria-label={t.mastery}>
          {modules.map((m) => {
            const rows = result.results.filter(
              (r) =>
                bank.find((q) => q.id === r.question_id).module_id === m.id,
            );
            if (!rows.length) return null;
            const good = rows.filter((r) => r.correct).length;
            const pct = Math.round((good / rows.length) * 100);
            return (
              <div key={m.id}>
                <span>{tr(m.title)}</span>
                <strong>
                  {good} / {rows.length}
                </strong>
                <span
                  className="mastery-bar"
                  role="img"
                  aria-label={`${tr(m.title)} ${pct}%`}
                >
                  <i style={{ "--mastery": String(good / rows.length) }} />
                </span>
              </div>
            );
          })}
        </div>
        <details className="answer-review">
          <summary>{t.reviewAnswers}</summary>
          {result.results.map((r) => (
            <article key={r.question_id}>
              <h3>
                {r.correct ? "✓" : "○"}{" "}
                {tr(questions.find((q) => q.id === r.question_id).prompt)}
              </h3>
              <p>{tr(r.explanation)}</p>
              {!r.correct && (
                <Link
                  className="text-button"
                  to={`/learn/${modules.flatMap((m) => m.lessons).find((l) => l.id === bank.find((q) => q.id === r.question_id).lesson_id)?.slug}`}
                >
                  {t.reviewLesson}
                  <Icon name="arrow" size={16} />
                </Link>
              )}
            </article>
          ))}
        </details>
      </section>
    );
  }
  return (
    <section className="quiz-card glass" aria-busy={busy}>
      {feedback?.correct &&
        !restored &&
        (streak % 3 === 0 || index === questions.length - 1) && (
          <ConfettiBurst key={`confetti-${question.id}`} />
        )}
      {lastResult && index === 0 && !answers.length && (
        <div className="last-result">
          <span>
            {t.lastResult}:{" "}
            <strong>
              {lastResult.score} / {lastResult.total}
            </strong>{" "}
            ·{" "}
            {new Date(lastResult.date).toLocaleDateString(
              lang === "es" ? "es-CO" : "en-GB",
            )}
          </span>
          <button className="text-button" onClick={() => setLastResult(null)}>
            {t.forgetResult}
          </button>
        </div>
      )}
      <label className="quiz-preference">
        <input
          type="checkbox"
          checked={manual}
          onChange={(e) => {
            setManual(e.target.checked);
            setAutoAdvance(!e.target.checked && !document.hidden);
            if (e.target.checked) {
              window.clearTimeout(advanceTimer.current);
              setAutoAdvance(false);
            }
          }}
        />
        {t.manualQuiz}
      </label>
      <p className="quiz-pace-hint">
        {manual ? refinement[lang].ownPace : refinement[lang].automatic}
      </p>
      {questions.length < bank.length && (
        <p className="quiz-practice-note">{copy.retryHint}</p>
      )}
      {saveError && (
        <p className="small" role="alert">
          {t.storageUnavailable}
        </p>
      )}
      <div className="quiz-meta">
        <span>
          {t.question} {index + 1} / {questions.length}
        </span>
        <span>
          {tr(modules.find((m) => m.id === question.module_id).title)}
        </span>
      </div>
      {streak >= 2 && (
        <span className="quiz-streak" aria-hidden="true">
          🔥 {streak} {t.streak}
        </span>
      )}
      <div className="quiz-segments" aria-hidden="true">
        {questions.map((q, i) => (
          <i
            key={q.id}
            className={
              verifiedAnswers.some((r) => r.question_id === q.id)
                ? `done ${verifiedAnswers.find((r) => r.question_id === q.id).correct ? "answered-correct" : "answered-review"}`
                : i === index
                  ? "current"
                  : ""
            }
          />
        ))}
      </div>
      <progress
        value={index + (feedback ? 1 : 0)}
        max={questions.length}
        aria-label={t.progress}
      />
      <p className="quiz-progress-caption">
        {answers.length} / {questions.length} {copy.completed}
      </p>
      {index > 0 && (
        <p className="quiz-encourage" aria-live="polite">
          {streak < 2 &&
          index >= questions.length / 2 &&
          index < questions.length * 0.75
            ? copy.learning
            : t.encourage[
                Math.min(
                  Math.floor((index / Math.max(questions.length, 1)) * 4),
                  3,
                )
              ]}
        </p>
      )}
      <fieldset
        key={`question-${question.id}`}
        className={`quiz-question${slideBack ? " slide-back" : ""}`}
        disabled={busy || !!feedback}
      >
        <legend ref={heading} tabIndex="-1">
          {tr(question.prompt)}
        </legend>
        <div className="quiz-options">
          {question.options.map((option, i) => (
            <label
              key={option.id}
              className={`quiz-option ${selected === option.id ? "selected" : ""} ${feedback?.correct_option === option.id ? "correct-option" : ""} ${feedback && !feedback.correct && selected === option.id ? "incorrect-option" : ""}`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={selected === option.id}
                onChange={() => setSelected(option.id)}
              />
              <span className="option-letter">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{tr(option.text)}</span>
              {feedback?.correct_option === option.id && (
                <Icon name="check" size={19} />
              )}
            </label>
          ))}
        </div>
      </fieldset>
      {!feedback && (
        <p className="quiz-selection-hint">
          {selected ? copy.selection : copy.choose}
        </p>
      )}
      {feedback && (
        <div
          className={`feedback ${feedback.correct ? "success" : ""}`}
          role="status"
        >
          <strong>{feedback.correct ? t.correct : t.incorrect}</strong>
          <p>{tr(feedback.explanation)}</p>
          {feedback.correct && (
            <small>
              {autoAdvance && !error
                ? index === questions.length - 1
                  ? t.resultsSoon
                  : t.nextQuestionSoon
                : t.autoStopped}
            </small>
          )}
        </div>
      )}
      {feedback?.correct && autoAdvance && !busy && !error && (
        <div className="quiz-auto" key={`countdown-${question.id}`}>
          <span className="auto-track" aria-hidden="true">
            <i />
          </span>
          <button
            className="text-button"
            onClick={() => {
              window.clearTimeout(advanceTimer.current);
              setAutoAdvance(false);
            }}
          >
            {t.keepReading}
          </button>
        </div>
      )}
      {error && (
        <p className="error-text" role="alert">
          {t.quizError}
        </p>
      )}
      <div className="quiz-actions">
        {feedback ? (
          <button className="button primary" disabled={busy} onClick={next}>
            {busy
              ? copy.saving
              : index === questions.length - 1
                ? t.finish
                : t.next}
            <Icon name="arrow" size={17} />
          </button>
        ) : (
          <button
            className="button primary"
            disabled={!selected || busy}
            onClick={check}
          >
            {busy ? t.checking : t.check}
          </button>
        )}
      </div>
    </section>
  );
}
