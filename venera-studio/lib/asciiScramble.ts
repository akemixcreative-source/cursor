/**
 * Shared ASCII scramble utilities for Loader (time-based ramp) and
 * ScrambleLabel (hover). Uses a deterministic pick so any SSR frame that
 * mirrors the same formula hydrates without mismatch; post-mount hover
 * uses the same picks driven by a monotonic frame counter.
 */

export const ASCII_SCRAMBLE_POOL =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789Ø][(/=<>*%$#@!?";

export type EasingFn = (t: number) => number;

/** Cubic ease in-out on [0,1]. */
export function easeInOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Quintic ease in-out — slower start/end for hover scrambles. */
export function easeInOutQuint(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

export function deterministicPick(
  flatIndex: number,
  frame: number,
  salt = 0,
): string {
  const n = ASCII_SCRAMBLE_POOL.length;
  const h =
    (flatIndex * 1315423911 + frame * 2654435761 + salt * 17374189493) >>> 0;
  return ASCII_SCRAMBLE_POOL[h % n]!;
}

type Cell = { line: number; col: number; ch: string };

function collectNonSpaceCells(lines: readonly string[]): Cell[] {
  const out: Cell[] = [];
  for (let li = 0; li < lines.length; li++) {
    const row = lines[li] ?? "";
    for (let col = 0; col < row.length; col++) {
      const ch = row[col]!;
      if (ch !== " ") out.push({ line: li, col, ch });
    }
  }
  return out;
}

/**
 * lockedCount: how many non-space cells (in reading order L→R, T→B) are
 * pinned to their final glyph. Remaining cells show deterministicPick.
 */
export function buildAsciiLinesDisplay(
  lines: readonly string[],
  frame: number,
  lockedCount: number,
): string[] {
  const order = collectNonSpaceCells(lines);
  const slot = new Map<string, string>();
  for (let i = 0; i < order.length; i++) {
    const { line, col, ch } = order[i]!;
    const key = `${line}:${col}`;
    if (i < lockedCount) {
      slot.set(key, ch);
    } else {
      slot.set(
        key,
        deterministicPick(i, frame, line * 7919 + col * 193),
      );
    }
  }
  const out: string[] = [];
  for (let li = 0; li < lines.length; li++) {
    const row = lines[li] ?? "";
    let s = "";
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]!;
      if (ch === " ") s += " ";
      else s += slot.get(`${li}:${c}`) ?? ch;
    }
    out.push(s);
  }
  return out;
}

/** Lock order count from elapsed time and duration (0 → all locked). */
export function lockedCountForProgress(
  lines: readonly string[],
  elapsedMs: number,
  durationMs: number,
  easeFn: EasingFn = easeInOutCubic,
): number {
  const orderLen = collectNonSpaceCells(lines).length;
  if (orderLen === 0) return 0;
  if (durationMs <= 0 || elapsedMs >= durationMs) return orderLen;
  const t = easeFn(elapsedMs / durationMs);
  return Math.min(orderLen - 1, Math.floor(t * orderLen));
}
