import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import PracticeTimer from "./PracticeTimer";
import { usePracticeSession, practice } from "../services/practiceSession";
import Icon from "./Icon";
import useSavedPreference from "../hooks/useSavedPreference";

function Eyes() {
  const { t } = useLanguage();
  const spec = {
    kind: "eyes",
    slug: "regla-20-20-20",
    steps: [
      { seconds: 20, label: "rest" },
      { seconds: 1200, label: "focus" },
    ],
  };
  return (
    <>
      <h2>{t.eyeTimer}</h2>
      <PracticeTimer spec={spec}>
        {({ current }) => <p>{current.phase === 0 ? t.eyeRest : t.eyeFocus}</p>}
      </PracticeTimer>
      <p className="small muted">{t.persistentTimerHint}</p>
    </>
  );
}
function Display() {
  const { t } = useLanguage();
  const [dark, setDark] = useSavedPreference(
    "dw-display-dark",
    false,
    (v) => typeof v === "boolean",
  );
  const [warm, setWarm] = useSavedPreference(
    "dw-display-warm",
    false,
    (v) => typeof v === "boolean",
  );
  return (
    <>
      <h2>{t.displayTitle}</h2>
      <div className="button-row">
        <button
          role="switch"
          aria-checked={dark}
          className={`switch-button ${dark ? "on" : ""}`}
          onClick={() => setDark(!dark)}
        >
          <span className="switch-track" />
          {t.dark}
        </button>
        <button
          role="switch"
          aria-checked={warm}
          className={`switch-button ${warm ? "on" : ""}`}
          onClick={() => setWarm(!warm)}
        >
          <span className="switch-track" />
          {t.warm}
        </button>
      </div>
      <div
        className={`display-demo ${dark ? "dark" : ""} ${warm ? "warm" : ""}`}
      >
        <div className="window-dots" aria-hidden="true">
          ● ● ●
        </div>
        <Icon name="book" size={35} />
        <h3>{t.demoTitle}</h3>
        <p>{t.demoText}</p>
        <div className="demo-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
      <p className="small muted">{t.demoNote}</p>
    </>
  );
}
export function Checklist({ items, title, storageKey }) {
  const { t } = useLanguage();
  const [checks, setChecks] = useSavedPreference(
    storageKey,
    [],
    (v) =>
      Array.isArray(v) &&
      new Set(v).size === v.length &&
      v.every((i) => Number.isInteger(i) && i >= 0 && i < items.length),
  );
  return (
    <div className="checklist">
      <h3>{title}</h3>
      <div className="progress-caption">
        <span>
          {checks.length} / {items.length} {t.checkCount}
        </span>
        <span>{Math.round((checks.length / items.length) * 100)}%</span>
      </div>
      <progress value={checks.length} max={items.length} aria-label={title} />
      {items.map((item, i) => (
        <label
          key={i}
          className={checks.includes(i) ? "checked check-item" : "check-item"}
        >
          <input
            type="checkbox"
            checked={checks.includes(i)}
            onChange={() =>
              setChecks((old) =>
                old.includes(i) ? old.filter((v) => v !== i) : [...old, i],
              )
            }
          />
          <span>{item}</span>
        </label>
      ))}
      <p className="checklist-summary" aria-live="polite">
        {checks.length === items.length ? t.checklistDone : t.pendingChecks}
      </p>
      {checks.length > 0 && (
        <button className="text-button" onClick={() => setChecks([])}>
          {t.resetChecks}
        </button>
      )}
    </div>
  );
}
function Ergonomics({ data }) {
  const { t, tr } = useLanguage();
  return (
    <Checklist
      storageKey="dw-ergonomics-checks"
      title={t.checklist}
      items={data.checklist.map(tr)}
    />
  );
}
function Stretch({ data }) {
  const { t, tr } = useLanguage();
  const spec = {
    kind: "stretch",
    slug: "pausa-activa",
    steps: data.cards.map((card, i) => ({
      seconds: card.seconds,
      label: `exercise${i + 1}`,
    })),
  };
  return (
    <>
      <h2>{t.stretchTitle}</h2>
      <PracticeTimer spec={spec}>
        {({ current, begin }) => (
          <>
            <div className="stretch-options">
              {data.cards.map((card, i) => (
                <button
                  key={i}
                  className={`stretch-option ${current.phase === i ? "selected" : ""}`}
                  aria-pressed={current.phase === i}
                  onClick={() => begin(i)}
                >
                  <Icon name={["body", "posture", "footprints"][i]} size={28} />
                  <span>{tr(card.title)}</span>
                </button>
              ))}
            </div>
            <p>{tr(data.cards[current.phase].description)}</p>
            <p className="small">
              {t.exercise} {current.phase + 1} / {data.cards.length} ·{" "}
              {t.guidedSequence}
            </p>
          </>
        )}
      </PracticeTimer>
      <p className="small muted">{t.stretchNote}</p>
    </>
  );
}
export function passwordScore(value) {
  if (!value) return 0;
  if (
    value.length < 10 ||
    /(.)\1{3,}|password|contrase[nñ]a|12345|qwerty|abcdef/i.test(value) ||
    new Set(value.toLowerCase()).size < 5
  )
    return 1;
  if (value.length < 15) return 2;
  return value.length >= 20 && new Set(value).size >= 10 ? 4 : 3;
}
export function generatePassword() {
  // 64 symbols: every random 6-bit value maps uniformly to one character.
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  return Array.from(
    crypto.getRandomValues(new Uint8Array(20)),
    (byte) => alphabet[byte & 63],
  ).join("");
}
function Password() {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const score = passwordScore(value);
  return (
    <>
      <h2>{t.passwordTitle}</h2>
      <label className="field-label" htmlFor="practice-password">
        {t.passwordLabel}
      </label>
      <div className="input-row">
        <input
          id="practice-password"
          type={show ? "text" : "password"}
          value={value}
          maxLength={128}
          autoComplete="off"
          spellCheck="false"
          autoCapitalize="none"
          placeholder={t.passwordPlaceholder}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          className="button secondary"
          aria-pressed={show}
          onClick={() => setShow(!show)}
        >
          {show ? t.hide : t.show}
        </button>
      </div>
      <div className="strength-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <i key={n} className={score >= n ? "filled" : ""} />
        ))}
      </div>
      <p role="status">
        {t.strength}: <strong>{t.strengths[score]}</strong>
      </p>
      <p className="password-advice">{t.passwordAdvice[score]}</p>
      <button
        className="button primary"
        onClick={() => {
          setValue(generatePassword());
          setShow(true);
        }}
      >
        <Icon name="lock" size={18} />
        {t.generate}
      </button>
      <p className="privacy-note">
        <Icon name="shield" size={16} />
        {t.passwordNote}
      </p>
      <p className="small muted">{t.passwordCaution}</p>
    </>
  );
}
function Phishing({ data }) {
  const { t, tr } = useLanguage();
  const [order, setOrder] = useState(() => data.emails.map((_, i) => i));
  const emails = order.map((i) => data.emails[i]);
  const [mistakes, setMistakes] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const email = emails[index];
  function choose(value) {
    if (answer !== null) return;
    setAnswer(value);
    if (value === email.is_phishing) setScore((s) => s + 1);
    else setMistakes((old) => [...old, order[index]]);
  }
  if (!email)
    return (
      <>
        <h2>{t.phishingDone}</h2>
        <div className="result-number">
          {score} / {emails.length}
        </div>
        <p>{t.phishingCaution}</p>
        {mistakes.length > 0 && (
          <>
            <div className="phishing-review">
              {mistakes.map((i) => (
                <article key={i}>
                  <h3>{tr(data.emails[i].subject)}</h3>
                  <p>{tr(data.emails[i].explanation)}</p>
                </article>
              ))}
            </div>
            <button
              className="button secondary"
              onClick={() => {
                setOrder(mistakes);
                setMistakes([]);
                setIndex(0);
                setAnswer(null);
                setScore(0);
              }}
            >
              {t.retryErrors}
            </button>
          </>
        )}
        <button
          className="button primary"
          onClick={() => {
            setOrder(data.emails.map((_, i) => i));
            setMistakes([]);
            setIndex(0);
            setAnswer(null);
            setScore(0);
          }}
        >
          {t.again}
        </button>
      </>
    );
  return (
    <>
      <h2>{t.phishingTitle}</h2>
      <p className="small muted">
        {t.fictional} · {index + 1} / {emails.length}
      </p>
      <article className="email-example">
        <span className="small">
          {t.from}: {email.sender}
        </span>
        <h3>{tr(email.subject)}</h3>
        <p>{tr(email.body)}</p>
      </article>
      <div className="button-row">
        <button
          disabled={answer !== null}
          className="button secondary"
          onClick={() => choose(true)}
        >
          {t.phishing}
        </button>
        <button
          disabled={answer !== null}
          className="button secondary"
          onClick={() => choose(false)}
        >
          {t.legitimate}
        </button>
      </div>
      {answer !== null && (
        <div
          className={`feedback ${answer === email.is_phishing ? "success" : ""}`}
          role="status"
        >
          <strong>
            {answer === email.is_phishing ? t.correct : t.incorrect}
          </strong>
          <p>{tr(email.explanation)}</p>
          <button
            className="text-button"
            onClick={() => {
              setIndex(index + 1);
              setAnswer(null);
            }}
          >
            {t.another} →
          </button>
        </div>
      )}
    </>
  );
}
function Pomodoro() {
  const { t } = useLanguage();
  const [config, setConfig] = useSavedPreference(
    "dw-pomodoro-config",
    {
      focus: 25,
      rest: 5,
      long: 15,
      cycles: 4,
    },
    (value) =>
      value &&
      [
        ["focus", 90],
        ["rest", 30],
        ["long", 60],
        ["cycles", 8],
      ].every(
        ([key, max]) =>
          Number.isInteger(value[key]) && value[key] >= 1 && value[key] <= max,
      ),
  );
  const [draft, setDraft] = useState(config);
  const { session } = usePracticeSession();
  const [confirmConfig, setConfirmConfig] = useState(false);
  const spec = {
    kind: "pomodoro",
    slug: "pomodoro",
    steps: Array.from({ length: config.cycles * 2 }, (_, i) => ({
      seconds:
        (i % 2
          ? i === config.cycles * 2 - 1
            ? config.long
            : config.rest
          : config.focus) * 60,
      label:
        i % 2 ? (i === config.cycles * 2 - 1 ? "longRest" : "rest") : "focus",
    })),
  };
  function applyConfig() {
    setConfig(draft);
    setConfirmConfig(false);
    if (session?.kind === "pomodoro") practice.clear();
  }
  return (
    <>
      <h2>{t.pomodoroTitle}</h2>
      <PracticeTimer spec={spec}>
        {({ current }) => (
          <div
            className="flow-blocks"
            aria-label={`${t.cycle} ${Math.min(Math.floor(current.phase / 2) + 1, current.steps.length / 2)} / ${current.steps.length / 2}`}
          >
            {Array.from({ length: current.steps.length / 2 }, (_, i) => (
              <span
                key={i}
                className={
                  current.done || Math.floor(current.phase / 2) > i
                    ? "finished"
                    : Math.floor(current.phase / 2) === i
                      ? "current"
                      : ""
                }
              >
                {current.done || Math.floor(current.phase / 2) > i
                  ? "✓"
                  : String(i + 1).padStart(2, "0")}
              </span>
            ))}
          </div>
        )}
      </PracticeTimer>
      <details className="timer-settings">
        <summary>{t.settings}</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (session?.kind === "pomodoro" && !session.done)
              setConfirmConfig(true);
            else applyConfig();
          }}
        >
          <div className="settings-grid">
            {[
              ["focus", t.focusMinutes, 90],
              ["rest", t.restMinutes, 30],
              ["long", t.longMinutes, 60],
              ["cycles", t.cycles, 8],
            ].map(([key, label, max]) => (
              <label key={key}>
                {label}
                <input
                  type="number"
                  min="1"
                  max={max}
                  required
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [key]:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                />
              </label>
            ))}
          </div>
          <button className="button secondary" type="submit">
            {t.apply}
          </button>
        </form>
      </details>
      {confirmConfig && (
        <div className="feedback" role="alert">
          <p>{t.replaceConfig}</p>
          <button className="button primary" onClick={applyConfig}>
            {t.apply}
          </button>
          <button
            className="text-button"
            onClick={() => setConfirmConfig(false)}
          >
            {t.cancel}
          </button>
        </div>
      )}
      <p className="small muted">{t.persistentTimerHint}</p>
    </>
  );
}
function Blockers({ data }) {
  const { t, tr } = useLanguage();
  const blockers = data.tools;
  const [filter, setFilter] = useState("all");
  return (
    <>
      <h2>{t.blockersTitle}</h2>
      <label className="field-label" htmlFor="platform">
        {t.platform}
      </label>
      <select
        id="platform"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        {["all", "Android", "iOS", "browser"].map((p) => (
          <option key={p} value={p}>
            {t[p] || p}
          </option>
        ))}
      </select>
      <div className="tool-list">
        {blockers
          .filter((b) => filter === "all" || b.platform === filter)
          .map((b) => (
            <details key={b.name} className="tool-card">
              <summary>
                <span className="icon-box">
                  <Icon name={b.icon} />
                </span>
                <span>
                  <strong>{b.name}</strong>
                  <small>{t[b.platform] || b.platform}</small>
                </span>
                <span className="expand-sign">+</span>
              </summary>
              <p>{tr(b.description)}</p>
              <a
                className="text-button"
                href={b.url}
                target="_blank"
                rel="noreferrer"
              >
                {t.visit} ↗
              </a>
            </details>
          ))}
      </div>
    </>
  );
}
function Notifications() {
  const { t } = useLanguage();
  const [count, setCount] = useState(12);
  return (
    <>
      <h2>{t.notificationsTitle}</h2>
      <div className="notification-demo">
        <div className="phone-outline">
          <Icon name={count ? "bell" : "leaf"} size={36} />
          <strong>{count ? t.notice : t.quiet}</strong>
          <span>
            {count} {t.notifications}
          </span>
        </div>
        <div className="notification-dots" aria-hidden="true">
          {Array.from({ length: 60 }, (_, i) => (
            <i key={i} className={i < count ? "active-dot" : ""} />
          ))}
        </div>
      </div>
      <label className="field-label" htmlFor="notifications">
        {t.notificationLabel}: <strong>{count}</strong>
      </label>
      <input
        id="notifications"
        type="range"
        min="0"
        max="60"
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
      />
      <div className="range-labels">
        <span>0</span>
        <span>30</span>
        <span>60</span>
      </div>
      <button className="button secondary" onClick={() => setCount(0)}>
        {t.mute}
      </button>
      <p className="small muted">{t.simulation}</p>
      <div className="takeaway">
        <Icon name="bell" size={20} />
        <p>{t.notificationAction}</p>
      </div>
    </>
  );
}
function Sleep({ data }) {
  const { t, tr } = useLanguage();
  const [bed, setBed] = useSavedPreference(
    "dw-bedtime",
    "23:00",
    (v) => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
  );
  const parts = bed.split(":").map(Number);
  const minutes = parts[0] * 60 + parts[1];
  const adjusted = (minutes + 1380) % 1440;
  const time = `${String(Math.floor(adjusted / 60)).padStart(2, "0")}:${String(adjusted % 60).padStart(2, "0")}`;
  return (
    <>
      <h2>{t.sleepTitle}</h2>
      <label className="field-label" htmlFor="bedtime">
        {t.bedtime}
      </label>
      <input
        id="bedtime"
        type="time"
        required
        value={bed}
        onChange={(e) => setBed(e.target.value)}
      />
      {bed && (
        <div className="sleep-result" role="status">
          <Icon name="moon" size={28} />
          <span>{t.disconnect}</span>
          <strong>{time}</strong>
          {minutes < 60 && <small>{t.dayBefore}</small>}
        </div>
      )}
      <p className="small muted">{t.sleepNote}</p>
      <Checklist
        storageKey="dw-sleep-checks"
        title={t.learn}
        items={data.checklist.map(tr)}
      />
    </>
  );
}
const components = {
  eyes: Eyes,
  display: Display,
  ergonomics: Ergonomics,
  stretch: Stretch,
  password: Password,
  phishing: Phishing,
  pomodoro: Pomodoro,
  blockers: Blockers,
  notifications: Notifications,
  sleep: Sleep,
};
export default function Activities({ type, data }) {
  const Component = components[type];
  return <Component data={data} />;
}
