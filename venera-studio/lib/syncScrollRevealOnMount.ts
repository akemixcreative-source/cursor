import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Mobile WebKit frequently finishes layout **after** the first ScrollTrigger pass,
 * so `onEnter` can be skipped while the element already intersects the viewport.
 * Probe a few RAFs + timeouts, refresh triggers, then run `tryReveal()` when plausible.
 *
 * Consumers must guard duplicates (typically a `revealedRef`).
 */
export function scheduleScrollRevealIntegrityProbe(
  getEl: () => HTMLElement | null,
  tryReveal: () => void,
): () => void {
  let cancelled = false;

  const run = () => {
    if (cancelled) return;
    const el = getEl();
    if (!el) return;
    ScrollTrigger.refresh();
    tryReveal();
  };

  queueMicrotask(run);

  let rafCount = 0;
  let rafId = 0;
  const rafLoop = () => {
    if (cancelled) return;
    run();
    rafCount += 1;
    if (rafCount < 4) rafId = requestAnimationFrame(rafLoop);
  };
  rafId = requestAnimationFrame(rafLoop);

  const timerIds = [24, 80, 200, 500].map((ms) =>
    window.setTimeout(run, ms),
  );

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
    timerIds.forEach((id) => clearTimeout(id));
  };
}

/** Rough visibility check tuned for first-screen & slightly above-the-fold layouts. */
export function isRoughlyIntersectingViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh =
    typeof window.visualViewport?.height === "number"
      ? window.visualViewport.height
      : window.innerHeight;
  return rect.bottom > 2 && rect.top < vh * 0.99;
}
