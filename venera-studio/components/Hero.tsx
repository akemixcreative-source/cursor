"use client";

import { useCallback, useEffect, useState } from "react";

import { SecureVideo } from "@/components/SecureVideo";
import { prefetchSecurePlayback } from "@/hooks/useSecurePlayback";
import { HOME_HERO_VIDEO_KEY, HOME_HERO_VIDEO_KEYS } from "@/lib/homeHeroVideo";
import { getVideoAssetPoster } from "@/data/videoAssets";

import styles from "./Hero.module.css";

/**
 * Hero
 * Full-width intro reel for the homepage. Renders a looping muted video
 * sized to a 16:9 frame behind a subtle dark veil.
 *
 * The `<video>` stays `opacity: 0` until playback actually starts so a
 * paused/stalled first frame never reads as a “stuck” hero.
 *
 * The scroll cue is not wrapped in ScrollReveal so it stays visible above the fold.
 */

type HeroMediaStatus = "loading" | "ready" | "error";

export function Hero() {
  const [mediaStatus, setMediaStatus] = useState<HeroMediaStatus>("loading");
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    prefetchSecurePlayback(HOME_HERO_VIDEO_KEY);
  }, []);

  const onPlaying = useCallback(() => {
    setMediaStatus((prev) => (prev === "error" ? prev : "ready"));
  }, []);

  const onVideoError = useCallback(() => {
    setSourceIndex((current) => {
      const next = current + 1;
      if (next < HOME_HERO_VIDEO_KEYS.length) {
        setMediaStatus("loading");
        return next;
      }
      setMediaStatus("error");
      return current;
    });
  }, []);

  const activeKey =
    HOME_HERO_VIDEO_KEYS[sourceIndex] ?? HOME_HERO_VIDEO_KEYS[0];
  const showFallback = mediaStatus !== "ready";

  return (
    <section
      className={styles.hero}
      aria-label="venera Motion Design services intro"
      data-fallback={showFallback ? "true" : undefined}
    >
      <div className={styles.media} aria-hidden>
        {showFallback ? <div className={styles.videoFallback} /> : null}

        <SecureVideo
          videoKey={activeKey}
          className={styles.video}
          poster={getVideoAssetPoster(activeKey)}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          data-ready={mediaStatus === "ready" ? "true" : undefined}
          onPlaying={onPlaying}
          onError={onVideoError}
        />
      </div>

      <div className={styles.veil} aria-hidden />

      <div className={styles.cue}>
        <span className={styles.cueArrow}>↓</span>
        <span>Scroll</span>
      </div>
    </section>
  );
}
