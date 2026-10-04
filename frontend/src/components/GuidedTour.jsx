import { useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import Icon from "./Icon";

export default function GuidedTour() {
  const { t } = useLanguage();

  const activeTour = useRef(null);
  useEffect(() => () => activeTour.current?.destroy(), []);
  function start() {
    activeTour.current?.destroy();
    const tour = driver({
      showProgress: true,
      popoverClass: "dw-driver",
      nextBtnText: t.tourNext,
      prevBtnText: t.tourBack,
      doneBtnText: t.tourDone,
      steps: [
        {
          element: "#daily-intention .intention-card",
          popover: { title: t.tourS1t, description: t.tourS1x },
        },
        {
          element: "#modules .journey-rail",
          popover: { title: t.tourS2t, description: t.tourS2x },
        },
        {
          element: ".quiz-banner",
          popover: { title: t.tourS3t, description: t.tourS3x },
        },
      ],
    });
    activeTour.current = tour;
    tour.drive();
  }

  return (
    <button type="button" className="tour-button" onClick={start}>
      <Icon name="compass" size={17} />
      {t.tourStart}
    </button>
  );
}
