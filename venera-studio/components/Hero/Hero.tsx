"use client";

import { useState } from "react";

import styles from "@/components/Hero/Hero.module.css";

import {
  HERO_POSTER_SRC,
  HERO_VIDEO_RELATIVE_PATH,
} from "@/lib/constants";

/** Encode path segments so filenames with spaces load correctly */
function publicVideoSrc(relativePath: string): string {
  const parts = relativePath.split("/").filter(Boolean);
  const encoded = parts.map((p) => encodeURIComponent(p)).join("/");
  return `/${encoded}`;
}

export function Hero() {
  const [videoFailed, setVideoFailed] = useState(false);

  const videoSrc = publicVideoSrc(HERO_VIDEO_RELATIVE_PATH);

  return (
    <section className={styles.section}>
      <div className={styles.mediaBlock}>
        <div className={styles.videoLayer} aria-hidden="true">
          {!videoFailed ? (
            <video
              className={styles.video}
              src={videoSrc}
              poster={HERO_POSTER_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="Venera studio hero reel"
              onError={() => {
                setVideoFailed(true);
              }}
            />
          ) : (
            <div className={styles.placeholder} />
          )}
          <div className={styles.scrim} />
          <div className={styles.grainOverlay} />
        </div>
      </div>
    </section>
  );
}
