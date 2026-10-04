import { useLanguage } from "../context/LanguageContext";
import Icon from "./Icon";
export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="language-toggle">
      <Icon name="globe" size={17} />
      <button
        lang="es"
        aria-label="Español"
        aria-pressed={lang === "es"}
        onClick={() => setLang("es")}
      >
        ES
      </button>
      <span aria-hidden="true">/</span>
      <button
        lang="en"
        aria-label="English"
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}
