"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import { VideoLightbox } from "@/components/VideoLightbox";
import { SecureVideo } from "@/components/SecureVideo";
import {
  retrySecurePlayback,
  useSecurePlayback,
} from "@/hooks/useSecurePlayback";
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
  const [mediaError, setMediaError] = useState(false);
  const playback = useSecurePlayback(videoKey);
  const filmFailed = playback.status === "error" || mediaError;

  const close = useCallback(() => setOpen(false), []);

  const retryFilm = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      setMediaError(false);
      retrySecurePlayback(videoKey);
    },
    [videoKey],
  );

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
          onError={() => setMediaError(true)}
        />
        {filmFailed ? (
          <div className={styles.filmError} role="status">
            <p className={styles.filmErrorCopy}>Film unavailable</p>
            <button
              type="button"
              className={styles.filmErrorRetry}
              onClick={retryFilm}
            >
              Retry
            </button>
          </div>
        ) : null}
        <button
          type="button"
          className={styles.soundToggle}
          aria-label="Open film"
          onClick={() => setOpen(true)}
          hidden={filmFailed}
        >
          <span className={styles.expandHint} aria-hidden>
            Expand
          </span>
        </button>
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
