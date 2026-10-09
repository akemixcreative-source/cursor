"use client";

import { useEffect, useRef, type RefObject } from "react";

import { prefersLightweightRendering } from "@/lib/renderingCapabilities";

import styles from "./AmbientVideoGlow.module.css";

/**
 * Sampling grid for the mirrored frame. Upscaling a bitmap this small is what
 * produces the blur, so raising these values sharpens the glow rather than
 * improving it.
 */
const SAMPLE_WIDTH = 12;
const SAMPLE_HEIGHT = 7;

/** Ambient light does not need frame parity with the film. */
const TICK_MS = 100;

/** Below this width the film is full-bleed and has no margin to spill into. */
const SIDE_ROOM_QUERY = "(min-width: 1024px)";

type AmbientVideoGlowProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** False while the film is out of view or has not started playing. */
  active: boolean;
};

/**
 * Colour spill behind a film, mirrored from the frame currently on screen.
 *
 * The frame is drawn into a canvas a dozen pixels wide and stretched back out
 * by CSS, so the browser's own upscaling supplies the blur. That keeps this to
 * one small `drawImage` per tick with no second video decode and no
 * large-surface `filter: blur()`.
 *
 * Only drawing from the video is required, never reading pixels back, so this
 * survives the switch to cross-origin Stream playback: such a canvas is tainted
 * for reads but still renders.
 */
export function AmbientVideoGlow({ videoRef, active }: AmbientVideoGlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    if (!window.matchMedia(SIDE_ROOM_QUERY).matches) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    let rafId = 0;
    let lastDraw = 0;

    /**
     * Films are laid out at their own aspect ratio, so the whole frame is on
     * screen and can be mirrored as-is. A cropped presentation (`object-fit`
     * or a CSS zoom) would need a matching source rect here.
     */
    const drawFrame = () => {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return false;
      context.drawImage(video, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
      canvas.dataset.lit = "true";
      return true;
    };

    // Reduced motion, saveData, and software renderers get the ambience as a
    // still: one draw, then no ongoing work.
    if (prefersLightweightRendering()) {
      if (!active) return;
      if (drawFrame()) return;

      const drawOnce = () => {
        if (drawFrame()) video.removeEventListener("timeupdate", drawOnce);
      };
      video.addEventListener("timeupdate", drawOnce);
      return () => video.removeEventListener("timeupdate", drawOnce);
    }

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (now - lastDraw < TICK_MS) return;
      lastDraw = now;
      drawFrame();
    };

    const shouldRun = () =>
      active && !video.paused && document.visibilityState === "visible";

    const sync = () => {
      if (shouldRun()) {
        if (!rafId) rafId = requestAnimationFrame(tick);
        return;
      }
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    sync();
    video.addEventListener("play", sync);
    video.addEventListener("playing", sync);
    video.addEventListener("pause", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("play", sync);
      video.removeEventListener("playing", sync);
      video.removeEventListener("pause", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.glow}
      width={SAMPLE_WIDTH}
      height={SAMPLE_HEIGHT}
      aria-hidden
    />
  );
}
