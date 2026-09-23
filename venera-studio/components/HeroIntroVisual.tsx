"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  getVideoAssetFallback,
  getVideoAssetMobileFallback,
  getVideoAssetPoster,
} from "@/data/videoAssets";
import { prefersLightweightRendering } from "@/lib/renderingCapabilities";
import styles from "./HeroIntro.module.css";

/** Homepage hero square — local MP4 for a fast first frame (not Stream). */
const HERO_INTRO_SRC = getVideoAssetFallback("hero-intro-visual");
const HERO_INTRO_MOBILE_SRC = getVideoAssetMobileFallback("hero-intro-visual");
const HERO_INTRO_POSTER = getVideoAssetPoster("hero-intro-visual");
const PLAY_RETRY_MS = 1500;
const MAX_PLAY_RETRIES = 3;

/**
 * HeroIntro square visual. Uses a direct MP4 so the browser can buffer during
 * the loader (via `<link rel="preload">` on `/`) without a playback API round-trip.
 *
 * Desktop preloads the display-sized cut. Phones pick a 720p encode. Reduced
 * motion, Save-Data, and 2G stay on the poster still.
 */
export function HeroIntroVisual() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [allowMotion, setAllowMotion] = useState(true);

  useEffect(() => {
    if (prefersLightweightRendering()) {
      setAllowMotion(false);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !allowMotion) return;

    const markPlaying = () => setIsPlaying(true);
    let attempts = 0;

    const ensurePlaying = () => {
      if (!video.paused || video.ended || attempts >= MAX_PLAY_RETRIES) return;
      attempts += 1;
      kickPlayback(video);
    };

    video.addEventListener("playing", markPlaying);
    video.addEventListener("loadeddata", ensurePlaying);
    video.addEventListener("canplay", ensurePlaying);
    video.addEventListener("stalled", ensurePlaying);
    video.addEventListener("waiting", ensurePlaying);

    ensurePlaying();
    const playInterval = window.setInterval(ensurePlaying, PLAY_RETRY_MS);

    return () => {
      video.removeEventListener("playing", markPlaying);
      video.removeEventListener("loadeddata", ensurePlaying);
      video.removeEventListener("canplay", ensurePlaying);
      video.removeEventListener("stalled", ensurePlaying);
      video.removeEventListener("waiting", ensurePlaying);
      clearInterval(playInterval);
    };
  }, [allowMotion]);

  return (
    <div className={styles.figureClip}>
      <Image
        src={HERO_INTRO_POSTER}
        alt=""
        fill
        sizes="(min-width: 960px) 45vw, 100vw"
        className={styles.heroPoster}
        priority
        aria-hidden
      />
      {allowMotion ? (
        <video
          ref={videoRef}
          poster={HERO_INTRO_POSTER}
          className={styles.heroVisual}
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate"
          tabIndex={-1}
          data-playing={isPlaying ? "true" : undefined}
          aria-hidden
        >
          <source
            src={HERO_INTRO_MOBILE_SRC}
            media="(max-width: 959px)"
            type="video/mp4"
          />
          <source
            src={HERO_INTRO_SRC}
            media="(min-width: 960px)"
            type="video/mp4"
          />
        </video>
      ) : null}
    </div>
  );
}

function kickPlayback(video: HTMLVideoElement): void {
  void video.play().catch(() => {
    /* autoplay policies */
  });
}
