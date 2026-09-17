"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { releaseVideoAudio, takeVideoAudio } from "@/lib/videoAudioLock";

import { videoAssetHasAudio, type VideoAssetKey } from "@/data/videoAssets";

import { SecureVideo } from "@/components/SecureVideo";

import styles from "./page.module.css";

type VideoPlayerProps = {
  videoKey: VideoAssetKey;

  poster: string;
};

/**

 * Case-study film: signed HLS when Stream is configured; muted autoplay loop;

 * clicking the film toggles audio without placing controls over the image.

 */

export function VideoPlayer({ videoKey, poster }: VideoPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const prevKeyRef = useRef(videoKey);

  const hasAudio = videoAssetHasAudio(videoKey);

  const [soundOn, setSoundOn] = useState(false);

  const [nearViewport, setNearViewport] = useState(false);

  const stopSelf = useCallback(() => {
    setSoundOn(false);

    const v = videoRef.current;

    if (!v) return;

    v.muted = true;
  }, []);

  const toggleSound = useCallback(() => {
    const v = videoRef.current;

    if (!v) return;

    if (soundOn) {
      releaseVideoAudio(stopSelf);
      setSoundOn(false);
      v.muted = true;
      return;
    }

    takeVideoAudio(stopSelf);
    setSoundOn(true);
    v.muted = false;

    void v.play().catch(() => {
      /* ignore */
    });
  }, [soundOn, stopSelf]);

  useEffect(() => {
    return () => {
      releaseVideoAudio(stopSelf);

      stopSelf();
    };
  }, [stopSelf]);

  useEffect(() => {
    if (prevKeyRef.current === videoKey) return;

    prevKeyRef.current = videoKey;

    releaseVideoAudio(stopSelf);

    stopSelf();
  }, [videoKey, stopSelf]);

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

  useEffect(() => {
    if (nearViewport || !soundOn) return;

    releaseVideoAudio(stopSelf);

    stopSelf();
  }, [nearViewport, soundOn, stopSelf]);

  return (
    <div ref={rootRef} className={styles.videoFrame}>
      <div className={styles.heroInner}>
        <SecureVideo
          videoKey={videoKey}
          videoRef={videoRef}
          className={styles.heroVideo}
          {...(poster ? { poster } : {})}
          autoPlay={nearViewport}
          muted={!hasAudio || !soundOn}
          loop
          playsInline
          controls={false}
          preload={nearViewport ? "metadata" : "none"}
        />

        {hasAudio ? (
          <button
            type="button"
            className={styles.soundToggle}
            aria-label={soundOn ? "Mute film" : "Play film with sound"}
            aria-pressed={soundOn}
            onClick={toggleSound}
          />
        ) : null}
      </div>
    </div>
  );
}
