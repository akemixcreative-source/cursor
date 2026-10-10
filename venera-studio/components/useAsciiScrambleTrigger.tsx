"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildAsciiLinesDisplay,
  easeInOutCubic,
  lockedCountForProgress,
  type EasingFn,
} from "@/lib/asciiScramble";

const DEFAULT_SCRAMBLE_MS = 420;

/**
 * Returns [display, handlers, scramble] for mounting on an element.
 * Handlers run ASCII scramble on hover or focus; snap to final on leave/blur.
 * Call `scramble()` from a parent (e.g. when hovering the video cluster) to
 * replay the effect without pointer events on this node.
 */
export function useAsciiScrambleTrigger(
  text: string,
  scrambleMs = DEFAULT_SCRAMBLE_MS,
  easeFn: EasingFn = easeInOutCubic,
): readonly [
  string,
  {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  },
  () => void,
] {
  const target = text.toUpperCase();
  const [display, setDisplay] = useState(target);
  const rafRef = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const run = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lines = [target];
    stop();
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      frame += 1;
      const elapsed = now - start;
      const locked = lockedCountForProgress(
        lines,
        elapsed,
        scrambleMs,
        easeFn,
      );
      const row = buildAsciiLinesDisplay(lines, frame, locked)[0] ?? target;
      setDisplay(row);
      if (elapsed < scrambleMs) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(target);
        rafRef.current = 0;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [easeFn, scrambleMs, stop, target]);

  useEffect(() => {
    setDisplay(target);
  }, [target]);

  useEffect(() => () => stop(), [stop]);

  const leave = useCallback(() => {
    stop();
    setDisplay(target);
  }, [stop, target]);

  const handlers = {
    onPointerEnter: () => run(),
    onPointerLeave: leave,
    onFocus: () => run(),
    onBlur: leave,
  } as const;

  return [display, handlers, run] as const;
}
