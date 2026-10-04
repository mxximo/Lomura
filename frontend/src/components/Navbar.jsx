import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import Icon from "./Icon";
import ThemeToggle from "./ThemeToggle";
import { completion } from "../i18n/completion";
import { comments } from "../i18n/comments";
export default function Navbar() {
  const { t, lang } = useLanguage();
  const { pathname, hash } = useLocation();
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);
  const header = useRef(null);
  useEffect(() => {
    if (!open) return;
    function closeWithEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    function closeOutside(event) {
      if (!header.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("keydown", closeWithEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeWithEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      <header className="navbar editorial-nav" ref={header}>
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/media/lumora.svg" width="34" height="34" alt="" />
          {t.brand}
          <span className="brand-dot">.</span>
        </NavLink>
        <nav
          id="primary-nav"
          className={open ? "nav-links open" : "nav-links"}
          aria-label={t.menu}
        >
          <NavLink to="/" end className={() => pathname === "/" && !hash ? "active" : ""} aria-current={pathname === "/" && !hash ? "page" : false} onClick={() => setOpen(false)}>
            <span className="nav-step" aria-hidden="true">01</span>
            {t.home}
          </NavLink>
          <NavLink to="/#modules" className={() => pathname === "/" && hash === "#modules" ? "active" : ""} aria-current={pathname === "/" && hash === "#modules" ? "page" : false} onClick={() => setOpen(false)}>
            <span className="nav-step" aria-hidden="true">02</span>
            {t.modules}
          </NavLink>
          <NavLink to="/quiz" onClick={() => setOpen(false)}>
            <span className="nav-step" aria-hidden="true">03</span>
            {t.quiz}
          </NavLink>
          <NavLink to="/videos" onClick={() => setOpen(false)}>
            <span className="nav-step" aria-hidden="true">04</span>
            {completion[lang].videos}
          </NavLink>
          <NavLink to="/survey" onClick={() => setOpen(false)}>
            <span className="nav-step" aria-hidden="true">05</span>
            {completion[lang].survey}
          </NavLink>
          <NavLink to="/#comments" className={() => pathname === "/" && hash === "#comments" ? "active" : ""} aria-current={pathname === "/" && hash === "#comments" ? "page" : false} onClick={() => setOpen(false)}>
            <span className="nav-step" aria-hidden="true">06</span>
            {comments[lang].voices}
          </NavLink>
          <NavLink to="/credits" onClick={() => setOpen(false)}>
            <span className="nav-step" aria-hidden="true">07</span>
            {t.credits}
          </NavLink>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <LanguageToggle />
          <button
            ref={menuButton}
            className="menu-button"
            aria-label={open ? t.close : t.menu}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </header>
    </>
  );
}
