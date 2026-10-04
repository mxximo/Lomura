import { useEffect, useState } from "react";

/**
 * Animated counter: eases from 0 to `target` on mount/change.
 * Instant under prefers-reduced-motion. Always lands exactly on target.
 */
export default function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      duration <= 0
    ) {
      setValue(target);
      return;
    }
    let frame = 0;
    const started = performance.now();
    function tick(now) {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}
