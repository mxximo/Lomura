import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { ContentProvider } from "./context/ContentContext";
import { ProgressProvider } from "./context/ProgressContext";
import App from "./App";
import "./styles/fonts.css";
import "./styles/variables.css";
import "./styles/glass.css";
import "./styles/surfaces.css";
import "./styles/motion.css";
import "./styles/experience.css";
import "./styles/premium.css";
import "./styles/calm.css";
import "./styles/completion.css";
import "./styles/mobile.css";
import "./styles/quiz-experience.css";
import "./styles/refinement.css";
import "./styles/lumora.css";
import "./styles/editorial.css";
function Fatal() {
  const { t } = useLanguage();
  return (
    <main className="status-page glass">
      <h1>{t.fatal}</h1>
      <button
        className="button primary"
        onClick={() => window.location.reload()}
      >
        {t.reload}
      </button>
    </main>
  );
}
class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? <Fatal /> : this.props.children;
  }
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      <ErrorBoundary>
        <ContentProvider>
          <ProgressProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ProgressProvider>
        </ContentProvider>
      </ErrorBoundary>
    </LanguageProvider>
  </React.StrictMode>,
);
