"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildAsciiLinesDisplay,
  lockedCountForProgress,
} from "@/lib/asciiScramble";
import styles from "./AsciiRampText.module.css";

type AsciiRampTextProps = {
  lines: readonly string[];
  /** Total time until every non-space glyph is locked. */
  durationMs: number;
  className?: string;
};

/**
 * AsciiRampText — mount-time orchestration:
 * Phase A: frame 0 / locked 0 on SSR + first client paint (deterministic noise).
 * Phase B: rAF loop — frame advances every tick so unresolved cells keep
 *   changing glyphs; lockedCount ramps L→R / T→B via easeInOutCubic against
 *   durationMs until all cells match `lines`, then the loop ends.
 */
export function AsciiRampText({
  lines,
  durationMs,
  className,
}: AsciiRampTextProps) {
  const linesKey = useMemo(() => lines.join("\n"), [lines]);

  const [displayLines, setDisplayLines] = useState(() =>
    buildAsciiLinesDisplay(lines, 0, 0),
  );

  useEffect(() => {
    setDisplayLines(buildAsciiLinesDisplay(lines, 0, 0));
    let frame = 0;
    const start = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      frame += 1;
      const elapsed = now - start;
      const locked = lockedCountForProgress(lines, elapsed, durationMs);
      setDisplayLines(buildAsciiLinesDisplay(lines, frame, locked));
      if (elapsed < durationMs) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [linesKey, durationMs, lines]);

  return (
    <div className={`${styles.stack} ${className ?? ""}`}>
      {displayLines.map((row, i) => (
        <span key={`${linesKey}-${i}`} className={styles.line}>
          {row}
        </span>
      ))}
    </div>
  );
}
