import { createContext, useContext, useEffect, useState } from "react";
import { useLanguage } from "./LanguageContext";
import { loadContent, loadResource } from "../services/api";
const Context = createContext(null);
export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { t } = useLanguage();
  useEffect(() => {
    let active = true;
    loadContent()
      .then((data) => {
        if (active) setContent(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  if (error)
    return (
      <main className="status-page glass" role="alert">
        <h1>{t.loadError}</h1>
        <p>{t.errorHint}</p>
        <button
          className="button primary"
          onClick={() => {
            setError(false);
            setAttempt((n) => n + 1);
          }}
        >
          {t.retry}
        </button>
      </main>
    );
  if (!content)
    return (
      <main className="status-page" aria-busy="true">
        <h1>{t.loading}</h1>
        <div className="skeleton glass" />
        <div className="skeleton glass" />
      </main>
    );
  return <Context.Provider value={content}>{children}</Context.Provider>;
}
export const useContent = () => useContext(Context);

export function ResourceBoundary({ resource, children }) {
  const content = useContent();
  const { t } = useLanguage();
  const [state, setState] = useState({ data: null, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    loadResource(resource).then(
      (data) => active && setState({ data, error: false }),
      () => active && setState({ data: null, error: true }),
    );
    return () => {
      active = false;
    };
  }, [resource, attempt]);
  if (state.error)
    return (
      <section className="status-page glass" role="alert">
        <h1>{t.loadError}</h1>
        <p>{t.errorHint}</p>
        <button
          className="button primary"
          onClick={() => {
            setState({ data: null, error: false });
            setAttempt((n) => n + 1);
          }}
        >
          {t.retry}
        </button>
      </section>
    );
  if (!state.data)
    return (
      <section className="status-page" aria-busy="true">
        <p role="status">{t.loading}</p>
        <div className="skeleton glass" />
      </section>
    );
  return (
    <Context.Provider
      value={{
        ...content,
        [resource === "quiz" ? "questions" : resource]: state.data,
      }}
    >
      {children}
    </Context.Provider>
  );
}
