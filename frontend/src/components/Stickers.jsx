import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../context/ContentContext";
import { useProgress } from "../context/ProgressContext";
import Icon from "./Icon";

export function moduleEarned(module, completed) {
  return module.lessons.every((lesson) => completed.includes(lesson.id));
}

export default function Stickers() {
  const { t, tr } = useLanguage();
  const { modules } = useContent();
  const { completed } = useProgress();
  return (
    <section className="sticker-shelf glass" aria-label={t.stickersTitle}>
      <div className="sticker-heading">
        <h2>{t.stickersTitle}</h2>
        <p>{t.stickersHint}</p>
      </div>
      <ul>
        {modules.map((module, index) => {
          const earned = moduleEarned(module, completed);
          const target =
            module.lessons.find((lesson) => !completed.includes(lesson.id)) ||
            module.lessons[0];
          return (
            <li key={module.id}>
              <Link
                to={`/learn/${target.slug}`}
                className={`sticker ${module.color} ${earned ? "earned" : "locked"}`}
                aria-label={`${tr(module.title)} — ${earned ? t.statusDone : t.stickerLocked}`}
              >
                <span className="sticker-ring" aria-hidden="true">
                  <Icon name={earned ? module.icon : "lock"} size={26} />
                </span>
                <span>{t.topicFocus[index]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
