import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { useLanguage } from "./context/LanguageContext";
import { useContent, ResourceBoundary } from "./context/ContentContext";
import { PracticeDock } from "./components/PracticeTimer";
import Navbar from "./components/Navbar";
import ScrollProgress from "./components/ScrollProgress";
import BackToTop from "./components/BackToTop";
import StickerToast from "./components/StickerToast";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
const Lesson = lazy(() => import("./pages/Lesson"));
const FinalQuiz = lazy(() => import("./pages/FinalQuiz"));
const Credits = lazy(() => import("./pages/Credits"));
const Videos = lazy(() => import("./pages/Videos"));
const Survey = lazy(() => import("./pages/Survey"));
const Admin = lazy(() => import("./pages/Admin"));
import { completion } from "./i18n/completion";
import usePremiumMotion from "./hooks/usePremiumMotion";
function RouteEffects({ pathname }) {
  const { pathname: requestedPath, hash } = useLocation();
  const { t, tr, lang } = useLanguage();
  const { modules } = useContent();
  useEffect(() => {
    if (requestedPath !== pathname) return;
    if (hash && document.getElementById(hash.slice(1))) {
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: "instant" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("main")?.focus({ preventScroll: true });
    }
  }, [pathname, requestedPath, hash]);
  useEffect(() => {
    const lesson = modules
      .flatMap((m) => m.lessons)
      .find((l) => pathname === `/learn/${l.slug}`);
    const extra = {
      "/videos": completion[lang].videos,
      "/survey": completion[lang].survey,
      "/admin": completion[lang].admin,
    };
    document.title = `${lesson ? tr(lesson.intro) : extra[pathname] || (pathname === "/quiz" ? t.quiz : pathname === "/credits" ? t.credits : t.home)} · ${t.brand}`;
  }, [pathname, t, tr, lang, modules]);
  return null;
}
export default function App() {
  const { t, lang } = useLanguage();
  const { pathname } = useLocation();
  // Crossfade between routes with the View Transitions API when available;
  // hash jumps and reduced-motion users keep the instant swap. The motion
  // hook follows the displayed route so entrances target mounted content.
  const [displayPath, setDisplayPath] = useState(pathname);
  const committedPath = useRef(pathname);
  useEffect(() => {
    if (pathname === committedPath.current) return;
    let cancelled = false;
    let transition;
    function commit() {
      if (cancelled) return;
      committedPath.current = pathname;
      setDisplayPath(pathname);
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reduced && typeof document.startViewTransition === "function") {
      try {
        transition = document.startViewTransition(() => flushSync(commit));
        transition.ready.catch(() => {});
        transition.finished.catch(() => {
          if (!cancelled) commit();
        });
      } catch {
        commit();
      }
    } else commit();
    return () => {
      cancelled = true;
      transition?.skipTransition();
    };
  }, [pathname]);
  usePremiumMotion(displayPath);
  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Navbar />
      <RouteEffects pathname={displayPath} />
      <main id="main" tabIndex="-1" className="main-container">
        <div
          className="route-stage"
          key={displayPath.startsWith("/learn/") ? "lessons" : displayPath}
        >
          <Suspense
            fallback={
              <section className="route-loading" aria-busy="true">
                <p role="status">{t.loading}</p>
              </section>
            }
          >
            <Routes location={displayPath}>
              <Route path="/" element={<Home />} />
              <Route path="/learn/:slug" element={<Lesson />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/admin" element={<Admin />} />
              <Route
                path="/quiz"
                element={
                  <ResourceBoundary resource="quiz">
                    <FinalQuiz />
                  </ResourceBoundary>
                }
              />
              <Route
                path="/credits"
                element={
                  <ResourceBoundary resource="credits">
                    <Credits />
                  </ResourceBoundary>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <PracticeDock />
      <StickerToast />
      <footer className="footer">
        <div>
          <Link to="/" className="brand">
            <img src="/media/lumora.svg" width="26" height="26" alt="" />
            {t.brand}.
          </Link>
          <p>{t.footer}</p>
        </div>
        <div>
          <p>{t.footerNote}</p>
          <Link to="/credits">{t.credits} ↗</Link>
          <Link to="/survey">{completion[lang].survey} ↗</Link>
          <Link to="/admin">{completion[lang].admin} ↗</Link>
        </div>
      </footer>
    </>
  );
}
