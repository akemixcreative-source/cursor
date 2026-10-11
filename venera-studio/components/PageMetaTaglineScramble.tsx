"use client";

import { useEffect, useRef } from "react";
import { NycLiveClock } from "@/components/NycLiveClock";
import { getBelowHeroScrollThreshold, type PageMetaMode } from "@/components/PageMeta";
import { useAsciiScrambleTrigger } from "@/components/useAsciiScrambleTrigger";
import { easeInOutQuint } from "@/lib/asciiScramble";
import styles from "./PageMetaTaglineScramble.module.css";

const TAGLINE_MS = 1200;

const DEFAULT_LABEL = "Motion Designer / Creative Director //";

/**
 * Page meta center line with the same ASCII resolve used on nav links.
 * - `metaMode="always"`: scrambles once after mount.
 * - `metaMode="below-hero"`: scrambles the first time scroll passes the hero
 *   (threshold matches {@link PageMeta} below-hero mode).
 * Pointer enter / focus replays the scramble; leave snaps to the final line.
 */
export function PageMetaTaglineScramble({
  label = DEFAULT_LABEL,
  metaMode = "always",
}: {
  label?: string;
  /** Pass the same mode as the parent `<PageMeta mode={…} />` for correct timing. */
  metaMode?: PageMetaMode;
}) {
  const [display, handlers, scramble] = useAsciiScrambleTrigger(
    label,
    TAGLINE_MS,
    easeInOutQuint,
  );

  const belowHeroPlayed = useRef(false);

  useEffect(() => {
    if (metaMode !== "always" && metaMode !== "overlay") return;
    const id = window.setTimeout(() => {
      scramble();
    }, 60);
    return () => window.clearTimeout(id);
  }, [metaMode, scramble]);

  useEffect(() => {
    if (metaMode !== "below-hero") return;

    const threshold = () => getBelowHeroScrollThreshold();

    const tryPlay = () => {
      if (belowHeroPlayed.current) return;
      if (window.scrollY <= threshold()) return;
      belowHeroPlayed.current = true;
      scramble();
    };

    tryPlay();
    window.addEventListener("scroll", tryPlay, { passive: true });
    window.addEventListener("resize", tryPlay, { passive: true });
    return () => {
      window.removeEventListener("scroll", tryPlay);
      window.removeEventListener("resize", tryPlay);
    };
  }, [metaMode, scramble]);

  return (
    <div className={styles.wrap}>
      <NycLiveClock />
      <span className={styles.tagline} tabIndex={0} {...handlers}>
        {display}
      </span>
    </div>
  );
}
