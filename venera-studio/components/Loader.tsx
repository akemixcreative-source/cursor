"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useState, type TransitionEvent } from "react";
import { createPortal } from "react-dom";
import { AsciiRampText } from "@/components/AsciiRampText";
import { VeneraLogo } from "@/components/VeneraLogo";
import { prefersLightweightRendering } from "@/lib/renderingCapabilities";
import styles from "./Loader.module.css";

/**
 * Loader
 * Intro overlay on hard loads of `/` only. `alreadyPlayed` skips replays on
 * client-side navigations back to home.
 *
 * Exit uses a CSS class + `transitionend` (not AnimatePresence) because
 * Presence + `{visible ? … : null}` often never calls `onExitComplete` on
 * WebKit — the overlay stayed at opacity 1 and blocked the whole page.
 */

let alreadyPlayed = false;

const COUNT_DURATION_MS = 2400;
const HOLD_MS = 200;
const EXIT_MS = 380;

const LOADER_LINES = ["VENERA STUDIO", "INDEX 2026"] as const;
const LEFT_SCRAMBLE_MS = 2100;
const TOTAL_MS = COUNT_DURATION_MS + HOLD_MS + EXIT_MS;

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type LoaderPhase = "play" | "exit";

function finishLoader() {
  alreadyPlayed = true;
}

export function Loader() {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(() => {
    if (typeof window === "undefined") return true;
    return !alreadyPlayed;
  });
  const [phase, setPhase] = useState<LoaderPhase>("play");
  const [count, setCount] = useState(0);

  const dismiss = useCallback(() => {
    finishLoader();
    setShouldRender(false);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!shouldRender) return;
    if (
      window.matchMedia("(hover: none), (pointer: coarse)").matches ||
      prefersLightweightRendering()
    ) {
      finishLoader();
      setShouldRender(false);
    }
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;

    const start = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_DURATION_MS);
      setCount(Math.round(easeInOut(progress) * 100));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const exitTimer = window.setTimeout(
      () => setPhase("exit"),
      COUNT_DURATION_MS + HOLD_MS,
    );

    const hardStop = window.setTimeout(dismiss, TOTAL_MS + 600);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(exitTimer);
      clearTimeout(hardStop);
    };
  }, [shouldRender, dismiss]);

  const onExitTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      if (phase !== "exit") return;
      if (event.propertyName !== "opacity") return;
      dismiss();
    },
    [phase, dismiss],
  );

  if (!shouldRender || !mounted) return null;

  const overlay = (
    <div
      className={`${styles.overlay} ${phase === "exit" ? styles.exiting : ""}`.trim()}
      aria-hidden
      onTransitionEnd={onExitTransitionEnd}
    >
      <div className={styles.left}>
        <AsciiRampText lines={LOADER_LINES} durationMs={LEFT_SCRAMBLE_MS} />
      </div>

      <motion.div
        className={styles.center}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={styles.wordmarkClip}>
          <VeneraLogo variant="loader" priority />
        </div>
      </motion.div>

      <span className={styles.right}>{count.toString().padStart(3, "0")}</span>
    </div>
  );

  return createPortal(overlay, document.body);
}
