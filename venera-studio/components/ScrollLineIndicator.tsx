"use client";

import { useEffect, useState } from "react";
import styles from "./ScrollLineIndicator.module.css";

const SCROLL_ACTIVITY = "venera:scroll-activity";
const HIDE_DELAY_MS = 720;

/**
 * Right-edge scroll cue: a short vertical line, centered in the viewport.
 * Shown only while the user is scrolling; fades out shortly after scroll stops.
 */
export function ScrollLineIndicator() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const markScrolling = () => {
      setActive(true);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setActive(false), HIDE_DELAY_MS);
    };

    const onScrollActivity = () => markScrolling();

    window.addEventListener(SCROLL_ACTIVITY, onScrollActivity);
    window.addEventListener("scroll", markScrolling, { passive: true });
    window.addEventListener("wheel", markScrolling, { passive: true });
    window.addEventListener("touchmove", markScrolling, { passive: true });
    const onKeyDown = (e: KeyboardEvent) => {
      const keys = [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
        " ",
      ];
      if (keys.includes(e.key)) markScrolling();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      window.removeEventListener(SCROLL_ACTIVITY, onScrollActivity);
      window.removeEventListener("scroll", markScrolling);
      window.removeEventListener("wheel", markScrolling);
      window.removeEventListener("touchmove", markScrolling);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      className={styles.root}
      data-active={active ? "true" : undefined}
      aria-hidden
    >
      <span className={styles.line} />
    </div>
  );
}
