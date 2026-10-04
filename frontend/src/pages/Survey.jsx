import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { completion } from "../i18n/completion";
import { sendSurvey } from "../services/api";
import Icon from "../components/Icon";
import { refinement } from "../i18n/refinement";
import {
  emptySurvey,
  readSurveyDraft,
  surveyDraftKey,
} from "../services/surveyDraft";

export default function Survey() {
  const { lang } = useLanguage();
  const c = completion[lang];
  const r = refinement[lang];
  const [draft] = useState(readSurveyDraft);
  const [restored, setRestored] = useState(Boolean(draft));
  const [hoursConfirmed, setHoursConfirmed] = useState(
    draft?.hoursConfirmed || false,
  );
  const [invalid, setInvalid] = useState({});
  const [storageError, setStorageError] = useState(false);
  const id = useRef(crypto.randomUUID());
  const sending = useRef(false);
  const heading = useRef(null);
  const [values, setValues] = useState(draft?.values || emptySurvey());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const snapshot = useRef(draft?.snapshot || null);
  useEffect(() => {
    try {
      if (receipt) sessionStorage.removeItem(surveyDraftKey);
      else if (
        restored ||
        hoursConfirmed ||
        values.comment ||
        values.breaks ||
        values.sleep ||
        values.usefulness ||
        values.goal
      )
        sessionStorage.setItem(
          surveyDraftKey,
          JSON.stringify({
            values: { ...values, consent: false },
            hoursConfirmed,
            snapshot: snapshot.current,
          }),
        );
      else sessionStorage.removeItem(surveyDraftKey);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [values, hoursConfirmed, receipt, busy, restored]);
  const update = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key !== "consent") snapshot.current = null;
    setInvalid((old) => ({
      ...old,
      [key]: false,
      ...(key === "goal" ? { "survey-goal": false } : {}),
      ...(key === "consent" ? { "survey-consent": false } : {}),
    }));
  };
  async function submit(e) {
    e.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError(false);
    // Reuse the same ID and exact payload after a lost network response.
    if (!snapshot.current) {
      id.current = crypto.randomUUID();
      snapshot.current = {
        ...values,
        usefulness: Number(values.usefulness),
        submission_id: id.current,
        language: lang,
      };
    }
    try {
      setReceipt(await sendSurvey(snapshot.current));
      requestAnimationFrame(() => heading.current?.focus());
    } catch {
      setError(true);
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <section className="survey-success glass">
        <span className="success-seal">
          <Icon name="check" size={36} />
        </span>
        <span className="eyebrow">{c.survey}</span>
        <h1 tabIndex="-1" ref={heading}>
          {c.sent}
        </h1>
        <p>{c.sentHint}</p>
        <p className="receipt">
          {c.receipt}: <code>{receipt.id}</code>
        </p>
        <div className="button-row">
          <Link to="/videos" className="button primary">
            {c.videos} →
          </Link>
          <Link to="/" className="button secondary">
            {lang === "es" ? "Volver al inicio" : "Back to home"}
          </Link>
        </div>
      </section>
    );
  return (
    <div className="survey-layout">
      <header className="survey-intro">
        <span className="eyebrow">{c.survey}</span>
        <h1>{c.surveyTitle}</h1>
        <p>{c.surveyIntro}</p>
        <span className="privacy-pill">
          <Icon name="shield" size={18} />
          {c.anonymous}
        </span>
        <p className="small muted privacy-copy">{c.privacy}</p>
      </header>
      <form
        className="survey-form glass"
        onSubmit={submit}
        aria-busy={busy}
        onInvalidCapture={(e) =>
          setInvalid((old) => ({
            ...old,
            [e.target.name || e.target.id]: true,
          }))
        }
      >
        {restored && (
          <div className="survey-draft-note">
            <p>{r.draft}</p>
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => {
                snapshot.current = null;
                setValues(emptySurvey());
                setHoursConfirmed(false);
                setRestored(false);
                setInvalid({});
                setError(false);
              }}
            >
              {r.discard}
            </button>
          </div>
        )}
        {storageError && (
          <p className="small" role="alert">
            {r.draftUnavailable}
          </p>
        )}
        <fieldset disabled={busy}>
          <div className="form-question">
            <label htmlFor="screen-hours">
              <span className="form-number">01</span>
              {c.hours}
              <strong className="hours-value">{values.screen_hours} h</strong>
            </label>
            <input
              id="screen-hours"
              type="range"
              min="0"
              max="24"
              value={values.screen_hours}
              onChange={(e) => {
                update("screen_hours", Number(e.target.value));
                setHoursConfirmed(true);
                setInvalid((old) => ({ ...old, "hours-confirmed": false }));
              }}
            />
            <div className="range-endpoints">
              <span>0 h</span>
              <span>24 h</span>
            </div>
            <label className="hours-confirmation">
              <input
                id="hours-confirmed"
                type="checkbox"
                required
                checked={hoursConfirmed}
                onChange={(e) => {
                  setHoursConfirmed(e.target.checked);
                  setInvalid((old) => ({ ...old, "hours-confirmed": false }));
                }}
              />
              {r.confirmHours}
            </label>
            {invalid["hours-confirmed"] && (
              <p className="error-text">{r.required}</p>
            )}
          </div>
          {["breaks", "sleep"].map((key, index) => (
            <fieldset className="form-question" key={key}>
              <legend>
                <span className="form-number">0{index + 2}</span>
                {c[key]}
              </legend>
              <div className="choice-row">
                {["often", "sometimes", "rarely"].map((value) => (
                  <label
                    className={
                      values[key] === value ? "choice selected" : "choice"
                    }
                    key={value}
                  >
                    <input
                      required
                      type="radio"
                      name={key}
                      aria-invalid={invalid[key] || undefined}
                      value={value}
                      checked={values[key] === value}
                      onChange={() => update(key, value)}
                    />
                    {c[value]}
                  </label>
                ))}
              </div>
              {invalid[key] && <p className="error-text">{r.required}</p>}
            </fieldset>
          ))}
          <fieldset className="form-question">
            <legend>
              <span className="form-number">04</span>
              {c.useful}
            </legend>
            <div className="rating-row">
              {[1, 2, 3, 4, 5].map((value) => (
                <label
                  className={
                    Number(values.usefulness) === value
                      ? "rating selected"
                      : "rating"
                  }
                  key={value}
                >
                  <input
                    required
                    type="radio"
                    name="usefulness"
                    aria-invalid={invalid.usefulness || undefined}
                    value={value}
                    aria-label={`${value} / 5`}
                    checked={Number(values.usefulness) === value}
                    onChange={() => update("usefulness", value)}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
            {invalid.usefulness && <p className="error-text">{r.required}</p>}
            <div className="range-endpoints">
              <span>{c.ratingLow}</span>
              <span>{c.ratingHigh}</span>
            </div>
          </fieldset>
          <div className="form-question">
            <label htmlFor="survey-goal">
              <span className="form-number">05</span>
              {c.goal}
            </label>
            <select
              id="survey-goal"
              aria-invalid={invalid["survey-goal"] || undefined}
              required
              value={values.goal}
              onChange={(e) => update("goal", e.target.value)}
            >
              <option value="" disabled>
                {lang === "es" ? "Elige un hábito" : "Choose a habit"}
              </option>
              {["eyes", "posture", "security", "focus", "sleep"].map(
                (value, index) => (
                  <option key={value} value={value}>
                    {c.goals[index]}
                  </option>
                ),
              )}
            </select>
            {invalid["survey-goal"] && (
              <p className="error-text">{r.required}</p>
            )}
          </div>
          <div className="form-question">
            <label htmlFor="survey-comment">
              <span className="form-number">06</span>
              {c.comment}
            </label>
            <p id="comment-help" className="small muted">
              {c.optional}
            </p>
            <textarea
              id="survey-comment"
              rows="4"
              maxLength="1000"
              value={values.comment}
              onChange={(e) => update("comment", e.target.value)}
              aria-describedby="comment-help"
            />
            <span className="character-count">
              {values.comment.length} / 1000
            </span>
          </div>
          <label className="consent-row">
            <input
              required
              type="checkbox"
              id="survey-consent"
              checked={values.consent}
              onChange={(e) => update("consent", e.target.checked)}
            />
            <span>{c.consent}</span>
          </label>
          {invalid["survey-consent"] && (
            <p className="error-text">{r.required}</p>
          )}
          {error && (
            <p role="alert" className="error-text">
              {c.error}
            </p>
          )}
          <button
            className="button primary survey-submit"
            type="submit"
            disabled={busy}
          >
            {busy ? c.sending : c.send}
            <Icon name="arrow" size={18} />
          </button>
        </fieldset>
      </form>
    </div>
  );
}
