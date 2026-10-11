"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { getVideoAssetFallback, getVideoAssetPoster } from "@/data/videoAssets";
import { prefersLightweightRendering } from "@/lib/renderingCapabilities";
import styles from "./HeroIntro.module.css";

/** Homepage hero square — always local MP4 for fast first frame (not Stream). */
const HERO_INTRO_SRC = getVideoAssetFallback("hero-intro-visual");
const HERO_INTRO_POSTER = getVideoAssetPoster("hero-intro-visual");
const PLAY_RETRY_MS = 1500;
const MAX_PLAY_RETRIES = 3;

/**
 * HeroIntro square visual. Uses a direct MP4 so the browser can buffer during
 * the loader (via `<link rel="preload">` on `/`) without a playback API round-trip.
 *
 * The poster remains visible until the browser confirms active playback. If
 * autoplay is blocked, reduced motion is requested, or rendering is software
 * based, the visual stays a clean still instead of exposing native controls.
 */
export function HeroIntroVisual() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersLightweightRendering()) {
      video.pause();
      return;
    }

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
  }, []);

  return (
    <div className={styles.figureClip}>
      <Image
        src={HERO_INTRO_POSTER}
        alt=""
        fill
        sizes="(min-width: 960px) 45vw, 100vw"
        className={styles.heroPoster}
        aria-hidden
      />
      <video
        ref={videoRef}
        src={HERO_INTRO_SRC}
        poster={HERO_INTRO_POSTER}
        className={styles.heroVisual}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate"
        tabIndex={-1}
        data-playing={isPlaying ? "true" : undefined}
        aria-hidden
      />
    </div>
  );
}

function kickPlayback(video: HTMLVideoElement): void {
  void video.play().catch(() => {
    /* autoplay policies */
  });
}
