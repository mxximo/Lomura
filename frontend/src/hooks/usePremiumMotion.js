import { useEffect } from "react";

/**
 * Premium motion system:
 * - staggered scroll reveal (IntersectionObserver, once per element)
 * - stable reading surfaces without pointer-driven movement
 * - respects prefers-reduced-motion, cleans up on route change
 */
export default function usePremiumMotion(routeKey) {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    // 1. Scroll reveal — every meaningful block gets a staggered entrance.
    const selectors = [
      "#main .hero-copy > *",
      "#main .hero-art",
      "#main .page-heading > *",
      "#main .section-heading > *",
      "#main .journey-meta",
      "#main .next-step",
      "#main .module-card",
      "#main .home-bottom > *",
      "#main .fact-carousel",
      "#main .quiz-banner",
      "#main .credit-group",
      "#main .insight-card",
    ];
    const items = [...document.querySelectorAll(selectors.join(","))];
    // Group stagger: siblings share a sequence so cards cascade.
    const groups = new Map();
    items.forEach((item) => {
      const parent = item.parentElement;
      if (!parent) return;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(item);
    });
    groups.forEach((siblings) => {
      siblings.forEach((item, order) => {
        item.dataset.reveal = "";
        item.style.setProperty("--reveal-order", String(Math.min(order, 7)));
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.revealed = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      items.forEach((item) => {
        delete item.dataset.reveal;
        delete item.dataset.revealed;
        item.style.removeProperty("--reveal-order");
      });
    };
  }, [routeKey]);
}
