"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { VideoLightbox } from "@/components/VideoLightbox";
import { SecureVideo } from "@/components/SecureVideo";
import type { VideoAssetKey } from "@/data/videoAssets";

import styles from "./page.module.css";

type VideoPlayerProps = {
  videoKey: VideoAssetKey;
  poster: string;
};

/**
 * Case-study film: muted autoplay loop in page. Clicking opens a darkened
 * lightbox where the film plays larger (with sound when the asset has audio).
 */
export function VideoPlayer({ videoKey, poster }: VideoPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "100px 0px", threshold: 0.01 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={styles.videoFrame}>
      <div className={styles.heroInner}>
        <SecureVideo
          videoKey={videoKey}
          videoRef={videoRef}
          className={styles.heroVideo}
          {...(poster ? { poster } : {})}
          autoPlay={nearViewport && !open}
          muted
          loop
          playsInline
          controls={false}
          preload={nearViewport ? "metadata" : "none"}
        />
        <button
          type="button"
          className={styles.soundToggle}
          aria-label="Open film"
          onClick={() => setOpen(true)}
        />
      </div>
      {open ? (
        <VideoLightbox
          videoKey={videoKey}
          poster={poster}
          onClose={close}
        />
      ) : null}
    </div>
  );
}
