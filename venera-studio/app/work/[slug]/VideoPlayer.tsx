"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { SecureVideo } from "@/components/SecureVideo";
import { videoAssetHasAudio, type VideoAssetKey } from "@/data/videoAssets";
import { releaseVideoAudio, takeVideoAudio } from "@/lib/videoAudioLock";

import styles from "./page.module.css";

const OPEN_EVENT = "venera:case-video-open";

type VideoPlayerProps = {
  videoKey: VideoAssetKey;
  poster: string;
};

function isOpenEvent(event: Event): event is CustomEvent<string> {
  return event instanceof CustomEvent && typeof event.detail === "string";
}

/**
 * Case-study film. Muted autoplay in the page.
 * Hover darkens the frame and shows Expand. Opening lifts the film
 * over a blurred page and plays its audio when the file has a track.
 */
export function VideoPlayer({ videoKey, poster }: VideoPlayerProps) {
  const instanceId = useId();
  const slotRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const hasAudio = videoAssetHasAudio(videoKey);

  const mute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
  }, []);

  const close = useCallback(() => {
    releaseVideoAudio(mute);
    mute();
    setExpanded(false);
  }, [mute]);

  const open = useCallback(() => {
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: instanceId }));
    setExpanded(true);
    const video = videoRef.current;
    if (!video) return;
    if (hasAudio) {
      takeVideoAudio(mute);
      video.muted = false;
    }
    void video.play().catch(() => {
      /* autoplay policies */
    });
  }, [hasAudio, instanceId, mute]);

  useLayoutEffect(() => {
    const el = document.createElement("div");
    setHost(el);
    return () => {
      el.remove();
    };
  }, []);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!host || !slot) return;

    if (expanded) {
      const height = slot.getBoundingClientRect().height;
      slot.style.blockSize = `${height}px`;
      host.className = `${styles.stage} ${styles.stageOpen}`;
      document.body.appendChild(host);
      return;
    }

    slot.style.blockSize = "";
    host.className = styles.stage;
    if (host.parentElement !== slot) slot.appendChild(host);
  }, [expanded, host]);

  useEffect(() => {
    const root = slotRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "100px 0px", threshold: 0.01 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onOther = (event: Event) => {
      if (!isOpenEvent(event) || event.detail === instanceId) return;
      close();
    };
    window.addEventListener(OPEN_EVENT, onOther);
    return () => window.removeEventListener(OPEN_EVENT, onOther);
  }, [close, instanceId]);

  useEffect(() => {
    if (!expanded) return;
    controlRef.current?.focus({ preventScroll: true });

    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const stopScroll = (event: Event) => {
      event.preventDefault();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("wheel", stopScroll, { passive: false, capture: true });
    window.addEventListener("touchmove", stopScroll, { passive: false, capture: true });
    window.addEventListener("keydown", onKey);

    return () => {
      html.style.overflow = previousOverflow;
      window.removeEventListener("wheel", stopScroll, { capture: true });
      window.removeEventListener("touchmove", stopScroll, { capture: true });
      window.removeEventListener("keydown", onKey);
    };
  }, [close, expanded]);

  useEffect(() => {
    return () => {
      releaseVideoAudio(mute);
    };
  }, [mute]);

  const active = nearViewport || expanded;

  return (
    <div ref={slotRef} className={styles.slot}>
      {host
        ? createPortal(
            <div
              className={styles.frame}
              role={expanded ? "dialog" : undefined}
              aria-modal={expanded ? true : undefined}
              aria-label={expanded ? "Expanded project video" : undefined}
              onClick={() => {
                if (!expanded) open();
              }}
            >
              <SecureVideo
                videoKey={videoKey}
                videoRef={videoRef}
                className={styles.heroVideo}
                {...(poster ? { poster } : {})}
                autoPlay={active}
                muted={!expanded || !hasAudio}
                loop
                playsInline
                controls={false}
                preload={active ? "auto" : "none"}
              />
              <span className={styles.dim} aria-hidden="true" />
              <button
                ref={controlRef}
                type="button"
                className={styles.expandControl}
                aria-expanded={expanded}
                onClick={(event) => {
                  event.stopPropagation();
                  if (expanded) close();
                  else open();
                }}
              >
                {expanded ? "Close" : "Expand"}
              </button>
            </div>,
            host,
          )
        : null}
      {expanded
        ? createPortal(
            <button
              type="button"
              className={styles.backdrop}
              aria-label="Close expanded video"
              onClick={close}
            />,
            document.body,
          )
        : null}
    </div>
  );
}
