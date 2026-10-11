"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { SecureVideo } from "@/components/SecureVideo";
import { HOME_HERO_VIDEO_KEY } from "@/lib/homeHeroVideo";
import styles from "./FooterClipStrip.module.css";

const CLIP_MIN_S = 5;
const CLIP_MAX_S = 7;
const TILE_COUNT = 5;

function randomClipDurationSec() {
  return CLIP_MIN_S + Math.random() * (CLIP_MAX_S - CLIP_MIN_S);
}

type Segment = { start: number; len: number };

type ClipCellProps = {
  clipDurationSec: number;
};

function ClipCell({ clipDurationSec }: ClipCellProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const segment = useRef<Segment>({ start: 0, len: clipDurationSec });
  const [ready, setReady] = useState(false);

  const armSegment = useCallback(() => {
    const v = ref.current;
    if (!v || !v.duration || !Number.isFinite(v.duration)) return;

    const len = Math.min(
      clipDurationSec,
      Math.max(0.5, v.duration - 0.12),
    );
    const maxStart = Math.max(0, v.duration - len - 0.06);
    const start = maxStart > 0 ? Math.random() * maxStart : 0;
    segment.current = { start, len };
    v.currentTime = start;
    setReady(true);
    void v.play().catch(() => {
      /* autoplay policy */
    });
  }, [clipDurationSec]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    if (v.readyState >= HTMLMediaElement.HAVE_METADATA) {
      armSegment();
    }

    const onMeta = () => {
      armSegment();
    };

    const onTimeUpdate = () => {
      const { start, len } = segment.current;
      if (v.currentTime >= start + len - 0.04) {
        v.currentTime = start;
      }
    };

    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [armSegment]);

  return (
    <div className={styles.cell}>
      <SecureVideo
        videoKey={HOME_HERO_VIDEO_KEY}
        videoRef={ref}
        className={`${styles.video} ${ready ? styles.videoReady : ""}`.trim()}
        autoPlay
        muted
        playsInline
        preload="metadata"
        onLoadedData={armSegment}
        aria-hidden
      />
    </div>
  );
}

/**
 * Row of square “GIF-style” loops under the wordmark: each cell plays a
 * random 5–7s slice of the main hero video on repeat.
 */
export function FooterClipStrip() {
  const baseId = useId();
  const [durations, setDurations] = useState<number[] | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    setDurations(
      Array.from({ length: TILE_COUNT }, () => randomClipDurationSec()),
    );
  }, []);

  if (durations === null) {
    return (
      <div className={styles.strip} aria-hidden>
        {Array.from({ length: TILE_COUNT }, (_, i) => (
          <div key={`${baseId}-sk-${i}`} className={styles.cell} />
        ))}
      </div>
    );
  }

  if (reduceMotion) {
    return (
      <div className={styles.strip} aria-hidden>
        {durations.map((_, i) => (
          <div key={`${baseId}-rm-${i}`} className={styles.cell}>
            <SecureVideo
              videoKey={HOME_HERO_VIDEO_KEY}
              className={`${styles.video} ${styles.videoReady}`.trim()}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.strip} aria-hidden>
      {durations.map((clipDurationSec, i) => (
        <ClipCell key={`${baseId}-c-${i}`} clipDurationSec={clipDurationSec} />
      ))}
    </div>
  );
}
