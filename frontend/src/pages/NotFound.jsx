import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
export default function NotFound() {
  const { t } = useLanguage();
  return (
    <section className="status-page glass">
      <span className="eyebrow">404</span>
      <h1>{t.notFound}</h1>
      <p>{t.notFoundText}</p>
      <Link className="button primary" to="/">
        {t.back}
      </Link>
    </section>
  );
}
