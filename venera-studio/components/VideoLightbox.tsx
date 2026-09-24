"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

import { SecureVideo } from "@/components/SecureVideo";
import { videoAssetHasAudio, type VideoAssetKey } from "@/data/videoAssets";

import styles from "./VideoLightbox.module.css";

type VideoLightboxProps = {
  videoKey: VideoAssetKey;
  poster?: string;
  onClose: () => void;
};

export function VideoLightbox({
  videoKey,
  poster,
  onClose,
}: VideoLightboxProps) {
  const titleId = useId();
  const hasAudio = videoAssetHasAudio(videoKey);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.window}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className={styles.visuallyHidden}>
          Film
        </h2>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close film"
        >
          ×
        </button>
        <SecureVideo
          videoKey={videoKey}
          className={styles.video}
          {...(poster ? { poster } : {})}
          autoPlay
          muted={!hasAudio}
          loop
          playsInline
          controls
          preload="auto"
        />
      </div>
    </div>,
    document.body,
  );
}
