"use client";

import { useEffect, useState } from "react";
import styles from "./ScrollCue.module.css";

const BOTTOM_THRESHOLD_PX = 72;

function hasMoreBelow(): boolean {
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= BOTTOM_THRESHOLD_PX) return false;
  return window.scrollY < maxScroll - BOTTOM_THRESHOLD_PX;
}

/**
 * Fixed bottom-left “Scroll ↓” cue when the page can scroll further.
 * Hidden at the document bottom and on non-scrollable pages.
 */
export function ScrollCue() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(hasMoreBelow());

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("venera:scroll-activity", update);

    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    if (document.body) ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("venera:scroll-activity", update);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      className={styles.cue}
      data-visible={visible ? "true" : "false"}
      aria-hidden
    >
      <span className={styles.arrow}>↓</span>
      <span>Scroll</span>
    </div>
  );
}
