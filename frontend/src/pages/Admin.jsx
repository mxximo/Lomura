import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { completion } from "../i18n/completion";
import { adminRequest, exportResponses, loadResource } from "../services/api";
import Icon from "../components/Icon";
import AdminComments from "../components/AdminComments";
import { refinement } from "../i18n/refinement";

export default function Admin() {
  const { lang, tr } = useLanguage();
  const c = completion[lang];
  const r = refinement[lang];
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    loadResource("quiz")
      .then((value) => {
        if (active) setQuestions(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [authenticated]);
  const [filters, setFilters] = useState({ kind: "all", start: "", end: "" });
  const [applied, setApplied] = useState({ kind: "all", start: "", end: "" });
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const loginLock = useRef(false);
  const queryFor = (f, p) =>
    new URLSearchParams(
      Object.entries({ ...f, page: p }).filter(
        ([, value]) => value !== "" && value !== undefined,
      ),
    ).toString();
  useEffect(() => {
    let active = true;
    setChecking(true);
    setError("");
    setData(null);
    adminRequest(`/responses?${queryFor(applied, page)}`)
      .then((value) => {
        if (active) {
          setData(value);
          setAuthenticated(true);
        }
      })
      .catch((e) => {
        if (!active) return;
        if (e.status === 401 || e.status === 503) setAuthenticated(false);
        if (e.status !== 401)
          setError(e.status === 503 ? "unavailable" : "loadError");
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [applied, page, refresh]);
  async function login(e) {
    e.preventDefault();
    if (loginLock.current) return;
    loginLock.current = true;
    setBusy(true);
    setError("");
    try {
      await adminRequest("/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setPassword("");
      setAuthenticated(true);
      setRefresh((v) => v + 1);
    } catch (e) {
      setError(
        e.status === 503
          ? "unavailable"
          : e.status === 429
            ? "limited"
            : "loginError",
      );
    } finally {
      loginLock.current = false;
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      await adminRequest("/logout", { method: "POST" });
      setAuthenticated(false);
      setData(null);
    } catch {
      setError("loadError");
    } finally {
      setBusy(false);
    }
  }
  async function download(format = "raw") {
    if (exporting) return;
    setExporting(true);
    setError("");
    try {
      await exportResponses(
        `${queryFor(applied, undefined)}&language=${lang}${format === "dictionary" ? "" : `&format=${format}`}`,
        format === "dictionary" ? "dictionary" : "export",
        format === "dictionary"
          ? "bienestar-diccionario.csv"
          : format === "readable"
            ? "bienestar-respuestas-legibles.csv"
            : "bienestar-respuestas.csv",
      );
    } catch (e) {
      if (e.status === 401) {
        setAuthenticated(false);
        setData(null);
      }
      setError("exportError");
    } finally {
      setExporting(false);
    }
  }
  if (checking && !authenticated)
    return (
      <section className="status-page" aria-busy="true">
        <p role="status">{c.loading}</p>
      </section>
    );
  if (!authenticated)
    return (
      <div className="admin-login glass">
        <span className="admin-emblem">
          <Icon name="shield" size={30} />
        </span>
        <span className="eyebrow">{c.admin}</span>
        <h1>{c.loginTitle}</h1>
        <p>{c.loginIntro}</p>
        <form onSubmit={login}>
          <label htmlFor="admin-password">{c.password}</label>
          <input
            id="admin-password"
            required
            type="password"
            autoComplete="current-password"
            maxLength="256"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
          {error && (
            <p className="error-text" role="alert">
              {c[error]}
            </p>
          )}
          <button type="submit" className="button primary" disabled={busy}>
            {busy ? c.loading : c.login} →
          </button>
        </form>
      </div>
    );
  const count = (kind) => data?.stats.find((s) => s.kind === kind)?.count ?? 0;
  const average = data?.stats.find((s) => s.kind === "quiz")?.average;
  return (
    <div className="admin-page">
      <header className="admin-heading">
        <div>
          <span className="eyebrow">{c.admin}</span>
          <h1>{c.dashboard}</h1>
          <p>{c.dashboardIntro}</p>
        </div>
        <button className="button secondary" onClick={logout} disabled={busy}>
          {c.logout}
        </button>
      </header>
      <div className="admin-stats">
        {[
          [c.surveys, count("survey")],
          [c.quizzes, count("quiz")],
          [c.average, average == null ? "—" : `${Math.round(average)}%`],
        ].map(([label, value]) => (
          <div className="glass" key={label}>
            <span>{label}</span>
            <strong>{checking ? "…" : value}</strong>
          </div>
        ))}
      </div>
      <section className="admin-analysis" aria-label={r.analysis}>
        <header>
          <h2>{r.analysis}</h2>
          <p>{r.submissions}</p>
        </header>
        <div className="analysis-grid">
          <article className="glass">
            <h3>{r.habits}</h3>
            {Object.keys(data?.analysis?.goals || {}).length ? (
              <ol className="analysis-bars">
                {["eyes", "posture", "security", "focus", "sleep"].map(
                  (goal, i) => (
                    <li key={goal}>
                      <span>{c.goals[i]}</span>
                      <strong>{data.analysis.goals[goal] || 0}</strong>
                      <progress
                        aria-label={c.goals[i]}
                        value={data.analysis.goals[goal] || 0}
                        max={Math.max(1, count("survey"))}
                      />
                    </li>
                  ),
                )}
              </ol>
            ) : (
              <p>{r.noData}</p>
            )}
          </article>
          <article className="glass">
            <h3>{r.usefulness}</h3>
            {Object.keys(data?.analysis?.usefulness || {}).length ? (
              <ol className="analysis-bars">
                {[1, 2, 3, 4, 5].map((score) => (
                  <li key={score}>
                    <span>{score} / 5</span>
                    <strong>{data.analysis.usefulness[score] || 0}</strong>
                    <progress
                      aria-label={`${r.usefulness}: ${score} / 5`}
                      value={data.analysis.usefulness[score] || 0}
                      max={Math.max(1, count("survey"))}
                    />
                  </li>
                ))}
              </ol>
            ) : (
              <p>{r.noData}</p>
            )}
          </article>
          <article className="glass">
            <h3>{r.difficult}</h3>
            {data?.analysis?.questions?.length ? (
              <ol className="analysis-bars">
                {data.analysis.questions.slice(0, 5).map((q) => (
                  <li key={q.question_id}>
                    <span>{tr(q.prompt)}</span>
                    <strong>
                      {q.correct} / {q.answered}
                    </strong>
                    <progress
                      aria-label={`${tr(q.prompt)} · ${r.correct}`}
                      value={q.correct}
                      max={q.answered}
                    />
                  </li>
                ))}
              </ol>
            ) : (
              <p>{r.noData}</p>
            )}
            {data?.analysis?.excluded_quizzes > 0 && (
              <p className="small">
                {lang === "es"
                  ? "Intentos de versiones anteriores excluidos de este desglose:"
                  : "Earlier-version attempts excluded from this breakdown:"}{" "}
                {data.analysis.excluded_quizzes}
              </p>
            )}
          </article>
        </div>
      </section>
      <section className="admin-records glass">
        <form
          className="admin-filters"
          onSubmit={(e) => {
            e.preventDefault();
            if (filters.start && filters.end && filters.start > filters.end) {
              setError("dateError");
              return;
            }
            setApplied({ ...filters });
            setPage(1);
            setRefresh((v) => v + 1);
          }}
        >
          <label>
            {c.type}
            <select
              value={filters.kind}
              onChange={(e) =>
                setFilters((f) => ({ ...f, kind: e.target.value }))
              }
            >
              <option value="all">{c.responses}</option>
              <option value="survey">{c.surveys}</option>
              <option value="quiz">{c.quizzes}</option>
            </select>
          </label>
          <label>
            {c.from}
            <input
              type="date"
              value={filters.start}
              onChange={(e) =>
                setFilters((f) => ({ ...f, start: e.target.value }))
              }
            />
          </label>
          <label>
            {c.to}
            <input
              type="date"
              value={filters.end}
              onChange={(e) =>
                setFilters((f) => ({ ...f, end: e.target.value }))
              }
            />
          </label>
          <button
            type="submit"
            className="button secondary"
            disabled={checking}
          >
            {c.apply}
          </button>
        </form>
        <div className="records-toolbar">
          <span>
            {data?.total ?? 0} {c.responses.toLowerCase()}
          </span>
          <button
            className="button primary"
            onClick={() => download()}
            disabled={exporting || checking || !data?.total}
          >
            <Icon name="download" size={18} />
            {exporting ? c.exporting : c.export}
          </button>
        </div>
        <div className="readable-exports">
          <button
            className="button secondary"
            onClick={() => download("readable")}
            disabled={exporting || checking || !data?.total}
          >
            {r.exportReadable}
          </button>
          <button
            className="text-button"
            onClick={() => download("dictionary")}
            disabled={exporting || checking}
          >
            {r.dictionary}
            <Icon name="download" size={16} />
          </button>
        </div>
        {error && (
          <p role="alert" className="error-text">
            {c[error]}
          </p>
        )}
        {checking ? (
          <p role="status">{c.loading}</p>
        ) : !data?.items.length ? (
          <p className="empty-records">{c.empty}</p>
        ) : (
          <div className="response-list">
            {data.items.map((row) => (
              <article className="response-row" key={row.id}>
                <div className="response-summary">
                  <span className={`response-kind ${row.kind}`}>
                    {row.kind === "survey" ? c.survey : "Quiz"}
                  </span>
                  <time dateTime={row.created_at}>
                    {new Date(row.created_at).toLocaleString(
                      lang === "es" ? "es-CO" : "en-GB",
                    )}
                  </time>
                  <strong>
                    {row.kind === "quiz"
                      ? `${row.score} / ${row.total}`
                      : `${row.payload.usefulness} / 5`}
                  </strong>
                  <span className="small muted">
                    {row.language.toUpperCase()}
                  </span>
                </div>
                <details>
                  <summary>{c.detail}</summary>
                  <dl className="response-details">
                    {row.kind === "survey"
                      ? [
                          "screen_hours",
                          "breaks",
                          "sleep",
                          "usefulness",
                          "goal",
                          "comment",
                        ].map((key) => (
                          <div key={key}>
                            <dt>
                              {
                                {
                                  screen_hours: c.hours,
                                  breaks: c.breaks,
                                  sleep: c.sleep,
                                  usefulness: c.useful,
                                  goal: c.goal,
                                  comment: c.comment,
                                }[key]
                              }
                            </dt>
                            <dd>
                              {key === "goal"
                                ? c.goals[
                                    [
                                      "eyes",
                                      "posture",
                                      "security",
                                      "focus",
                                      "sleep",
                                    ].indexOf(row.payload[key])
                                  ]
                                : c[row.payload[key]] ||
                                  (row.payload[key] === ""
                                    ? "—"
                                    : String(row.payload[key] ?? "—"))}
                            </dd>
                          </div>
                        ))
                      : row.payload.answers.map((a) => (
                          <div key={a.question_id}>
                            <dt>
                              {questions.find((q) => q.id === a.question_id)
                                ? tr(
                                    questions.find(
                                      (q) => q.id === a.question_id,
                                    ).prompt,
                                  )
                                : a.question_id}
                            </dt>
                            <dd>
                              {questions
                                .find((q) => q.id === a.question_id)
                                ?.options.find((o) => o.id === a.option_id)
                                ? tr(
                                    questions
                                      .find((q) => q.id === a.question_id)
                                      .options.find((o) => o.id === a.option_id)
                                      .text,
                                  )
                                : a.option_id.toUpperCase()}
                            </dd>
                          </div>
                        ))}
                  </dl>
                  <p className="receipt">
                    {c.receipt}: <code>{row.id}</code>
                  </p>
                  <p className="small muted">
                    {lang === "es" ? "Versión" : "Version"}:{" "}
                    {row.questionnaire_version || "legacy"}
                  </p>
                </details>
              </article>
            ))}
          </div>
        )}
        <div className="admin-pagination">
          <button
            className="button secondary"
            disabled={page <= 1 || checking}
            onClick={() => setPage((p) => p - 1)}
          >
            {c.prev}
          </button>
          <span>
            {c.page} {page} / {Math.max(1, Math.ceil((data?.total || 0) / 20))}
          </span>
          <button
            className="button secondary"
            disabled={checking || page * 20 >= (data?.total || 0)}
            onClick={() => setPage((p) => p + 1)}
          >
            {c.next}
          </button>
        </div>
      </section>
      <AdminComments />
    </div>
  );
}
