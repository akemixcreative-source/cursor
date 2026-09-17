"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "./PageMeta.module.css";

/** Bar block size (px); keep in sync with `.bar { block-size }` in PageMeta.module.css */
export const PAGE_META_BAR_PX = 80;

const HOME_HERO_SELECTOR = '[aria-label="venera Motion Design services intro"]';

/** Scroll position where the below-hero bar should reveal (after the hero reel). */
export function getBelowHeroScrollThreshold(): number {
  if (typeof document === "undefined") return 0;

  const hero = document.querySelector<HTMLElement>(HOME_HERO_SELECTOR);
  if (hero) {
    return Math.max(0, hero.offsetTop + hero.offsetHeight - PAGE_META_BAR_PX);
  }

  return Math.max(0, window.innerHeight - PAGE_META_BAR_PX);
}

export type PageMetaMode = "always" | "below-hero" | "overlay";

type PageMetaProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  /** Identifies the bar to screen readers. Defaults to "Page metadata". */
  ariaLabel?: string;
  /**
   * - "always" (default): pinned at the top of the viewport from frame zero.
   * - "below-hero": hidden on the hero reel; fades in once scrolled past it.
   * - "overlay": fixed over a full-viewport hero; visible from frame zero.
   */
  mode?: PageMetaMode;
};

/**
 * Catalog-style sticky meta strip. Renders three mono-caps slots; any slot
 * can be omitted. Used as the top chrome on case study pages (replaces Nav)
 * and as an optional ribbon on regular pages.
 */
export function PageMeta({
  left,
  center,
  right,
  ariaLabel = "Page metadata",
  mode = "always",
}: PageMetaProps) {
  // Visibility: in "always" mode we hard-code true. In "below-hero" mode we
  // start hidden (server + client first paint) and flip to visible once the
  // page is scrolled past one viewport height minus the bar.
  const [visible, setVisible] = useState(
    mode === "always" || mode === "overlay",
  );

  useEffect(() => {
    if (mode === "always" || mode === "overlay") {
      setVisible(true);
      return;
    }

    // Reveal once the hero reel has scrolled past the top of the viewport.
    const computeThreshold = () => getBelowHeroScrollThreshold();
    let threshold = computeThreshold();

    const update = () => setVisible(window.scrollY > threshold);
    const onResize = () => {
      threshold = computeThreshold();
      update();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("venera:scroll-activity", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("venera:scroll-activity", update);
    };
  }, [mode]);

  return (
    <header
      className={styles.bar}
      data-visible={visible}
      data-mode={mode}
      role="banner"
      aria-label={ariaLabel}
    >
      <div className={`${styles.slot} ${styles.slotStart}`}>{left}</div>
      <div className={`${styles.slot} ${styles.slotCenter}`}>{center}</div>
      <div className={`${styles.slot} ${styles.slotEnd}`}>{right}</div>
    </header>
  );
}
