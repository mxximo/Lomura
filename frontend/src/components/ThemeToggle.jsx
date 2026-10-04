import { useEffect } from "react";
import useSavedPreference from "../hooks/useSavedPreference";
import { useLanguage } from "../context/LanguageContext";
import { completion } from "../i18n/completion";

export default function ThemeToggle() {
  const { lang } = useLanguage();
  const [theme, setTheme] = useSavedPreference("dw-theme", "light", (v) =>
    ["dark", "light"].includes(v),
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={completion[lang][theme === "light" ? "dark" : "light"]}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
    </button>
  );
}
