"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { SecureVideo } from "@/components/SecureVideo";
import { videoAssetHasAudio, type VideoAssetKey } from "@/data/videoAssets";
import { VideoGainController } from "@/lib/videoGainController";
import { releaseVideoAudio, takeVideoAudio } from "@/lib/videoAudioLock";
import {
  DEFAULT_VIDEO_VOLUME,
  readVideoVolumePrefs,
  writeVideoVolumePrefs,
} from "@/lib/videoVolumePrefs";

import styles from "./VideoPlayer.module.css";

type VideoPlayerProps = {
  videoKey: VideoAssetKey;
  poster: string;
};

const CONTROLS_HIDE_MS = 2000;
const FADE_IN_MS = 400;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function IconPlay({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none">
      <path d="M8 5.5v13l11-6.5L8 5.5Z" fill="currentColor" />
    </svg>
  );
}

function IconPause({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none">
      <path d="M7 5h3.5v14H7V5Zm6.5 0H17v14h-3.5V5Z" fill="currentColor" />
    </svg>
  );
}

function IconVolume({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M4 9.5v5h3.2L12 19V5L7.2 9.5H4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 9.2a3.6 3.6 0 0 1 0 5.6M17.6 7a6.2 6.2 0 0 1 0 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMuted({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M4 9.5v5h3.2L12 19V5L7.2 9.5H4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.5 20.5 14.5M20.5 9.5 16 14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconEnterFullscreen({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconExitFullscreen({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type FullscreenElement = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  webkitRequestFullScreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitCancelFullScreen?: () => Promise<void> | void;
};

function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function requestFullscreenEl(el: Element): Promise<void> {
  const node = el as FullscreenElement;
  if (node.requestFullscreen) {
    await node.requestFullscreen();
    return;
  }
  if (node.webkitRequestFullscreen) {
    await node.webkitRequestFullscreen();
    return;
  }
  if (node.webkitRequestFullScreen) {
    await node.webkitRequestFullScreen();
  }
}

async function exitFullscreenEl(): Promise<void> {
  const doc = document as FullscreenDocument;
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  if (doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
    return;
  }
  if (doc.webkitCancelFullScreen) {
    await doc.webkitCancelFullScreen();
  }
}

/**
 * Case-study film player: muted looping preview until opened, then a
 * controlled session with play/pause, mute, volume, scrub, fullscreen,
 * and close. Volume routes through Web Audio so the 35% default works on iOS.
 */
export function VideoPlayer({ videoKey, poster }: VideoPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const gainRef = useRef<VideoGainController | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const prevKeyRef = useRef(videoKey);

  const hasAudio = videoAssetHasAudio(videoKey);

  const [nearViewport, setNearViewport] = useState(false);
  const [active, setActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(DEFAULT_VIDEO_VOLUME);
  const [muted, setMuted] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [needsTapForSound, setNeedsTapForSound] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    const prefs = readVideoVolumePrefs();
    setVolume(prefs.volume);
    setMuted(prefs.muted);
    setPrefsReady(true);
  }, []);

  useEffect(() => {
    if (!prefsReady) return;
    writeVideoVolumePrefs({ volume, muted });
  }, [volume, muted, prefsReady]);

  useEffect(() => {
    gainRef.current = new VideoGainController();
    return () => {
      gainRef.current?.dispose();
      gainRef.current = null;
    };
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHideChrome = useCallback(() => {
    clearHideTimer();
    if (!active) return;
    hideTimerRef.current = window.setTimeout(() => {
      setChromeVisible(false);
    }, CONTROLS_HIDE_MS);
  }, [active, clearHideTimer]);

  const revealChrome = useCallback(() => {
    setChromeVisible(true);
    scheduleHideChrome();
  }, [scheduleHideChrome]);

  const applyOutput = useCallback(
    (nextVolume: number, nextMuted: boolean, fadeMs = 0) => {
      const gain = gainRef.current;
      if (!gain) return;
      void gain.resume();
      gain.setOutput(nextVolume, nextMuted || !hasAudio, fadeMs);
    },
    [hasAudio],
  );

  const stopSession = useCallback(() => {
    const video = videoRef.current;
    gainRef.current?.silence();
    if (video) {
      video.pause();
      video.muted = true;
      video.loop = true;
    }
    setPlaying(false);
    setActive(false);
    setNeedsTapForSound(false);
    setChromeVisible(true);
    clearHideTimer();
    if (getFullscreenElement()) {
      void exitFullscreenEl().catch(() => {
        /* ignore */
      });
    }
    setIsFullscreen(false);
  }, [clearHideTimer]);

  const stopSelf = useCallback(() => {
    stopSession();
  }, [stopSession]);

  const syncFullscreenState = useCallback(() => {
    const root = rootRef.current;
    setIsFullscreen(Boolean(root && getFullscreenElement() === root));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const root = rootRef.current;
    if (!root || !active) return;
    revealChrome();
    try {
      if (getFullscreenElement() === root) {
        await exitFullscreenEl();
      } else {
        await requestFullscreenEl(root);
      }
    } catch {
      /* Fullscreen can be blocked by the browser; leave state alone. */
    }
    syncFullscreenState();
  }, [active, revealChrome, syncFullscreenState]);

  const openPlayer = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    takeVideoAudio(stopSelf);
    setActive(true);
    setChromeVisible(true);
    scheduleHideChrome();

    video.loop = false;
    video.playsInline = true;

    // crossOrigin is set on the element; wire gain before unmuting.
    const gain = gainRef.current;
    const backend = gain?.connect(video) ?? "unavailable";

    if (hasAudio) {
      if (backend === "webaudio") {
        setNeedsTapForSound(false);
        video.muted = false;
        video.volume = 1;
        await gain?.resume();
        gain?.setOutput(0, false, 0);
        gain?.setOutput(volume, muted, FADE_IN_MS);
      } else {
        // iOS / CORS fallback: stay muted until explicit tap-for-sound.
        const isiOS =
          typeof navigator !== "undefined" &&
          /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isiOS || backend === "unavailable") {
          video.muted = true;
          setNeedsTapForSound(true);
        } else {
          setNeedsTapForSound(false);
          video.muted = muted;
          video.volume = muted ? 0 : volume;
        }
      }
    } else {
      video.muted = true;
      setNeedsTapForSound(false);
    }

    try {
      await video.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [hasAudio, muted, scheduleHideChrome, stopSelf, volume]);

  const closePlayer = useCallback(() => {
    releaseVideoAudio(stopSelf);
    stopSession();
  }, [stopSelf, stopSession]);

  const togglePlayPause = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    revealChrome();

    if (!active) {
      await openPlayer();
      return;
    }

    if (video.paused) {
      takeVideoAudio(stopSelf);
      if (hasAudio && !needsTapForSound) {
        applyOutput(volume, muted, FADE_IN_MS);
      }
      try {
        await video.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
      return;
    }

    video.pause();
    setPlaying(false);
  }, [
    active,
    applyOutput,
    hasAudio,
    muted,
    needsTapForSound,
    openPlayer,
    revealChrome,
    stopSelf,
    volume,
  ]);

  const toggleMute = useCallback(() => {
    if (!hasAudio) return;
    revealChrome();
    setMuted((prev) => {
      const next = !prev;
      applyOutput(volume, next, 80);
      return next;
    });
  }, [applyOutput, hasAudio, revealChrome, volume]);

  const onVolumeInput = useCallback(
    (value: number) => {
      revealChrome();
      const next = Math.min(1, Math.max(0, value));
      const nextMuted = next === 0;
      if (next > 0) setVolume(next);
      setMuted(nextMuted);
      applyOutput(next > 0 ? next : volume, nextMuted, 0);
    },
    [applyOutput, revealChrome, volume],
  );

  const enableSoundFallback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    setNeedsTapForSound(false);
    setMuted(false);
    video.muted = false;
    video.volume = volume;
    applyOutput(volume, false, FADE_IN_MS);
    try {
      await video.play();
      setPlaying(true);
    } catch {
      /* ignore */
    }
    revealChrome();
  }, [applyOutput, revealChrome, volume]);

  const onScrub = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(value)) return;
      revealChrome();
      video.currentTime = value;
      setCurrentTime(value);
    },
    [revealChrome],
  );

  // Viewport observer for muted preview autoplay.
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

  // Preview: muted loop when near and not in an active session.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || active) return;
    video.muted = true;
    video.loop = true;
    if (nearViewport) {
      void video.play().catch(() => {
        /* autoplay policies */
      });
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [active, nearViewport]);

  // Media element events.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => setCurrentTime(video.currentTime || 0);
    const onMeta = () => setDuration(video.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      if (active) {
        setPlaying(false);
        revealChrome();
      }
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("durationchange", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [active, revealChrome]);

  // Key swap — kill any active audio session.
  useEffect(() => {
    if (prevKeyRef.current === videoKey) return;
    prevKeyRef.current = videoKey;
    releaseVideoAudio(stopSelf);
    stopSession();
  }, [stopSelf, stopSession, videoKey]);

  useEffect(() => {
    return () => {
      releaseVideoAudio(stopSelf);
      clearHideTimer();
    };
  }, [clearHideTimer, stopSelf]);

  // Leave viewport while active → close (stops audio). Stay open in fullscreen.
  useEffect(() => {
    if (!active || nearViewport || isFullscreen) return;
    closePlayer();
  }, [active, closePlayer, isFullscreen, nearViewport]);

  // Keep isFullscreen in sync with the Fullscreen API (Esc, browser UI, etc.).
  useEffect(() => {
    const onChange = () => syncFullscreenState();
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [syncFullscreenState]);

  // Keyboard: Space / M / Esc when this player is active (or focused).
  // Esc exits fullscreen first, then closes the player.
  useEffect(() => {
    if (!active) return;

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        void togglePlayPause();
        return;
      }
      if (event.key === "m" || event.key === "M") {
        event.preventDefault();
        toggleMute();
        return;
      }
      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        void toggleFullscreen();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        // One Esc exits fullscreen; a later Esc closes. If the browser already
        // left fullscreen on this keypress, sync state and do not close yet.
        const fsEl = getFullscreenElement();
        if (fsEl === rootRef.current) {
          void exitFullscreenEl()
            .catch(() => {
              /* ignore */
            })
            .finally(() => syncFullscreenState());
          return;
        }
        if (isFullscreen) {
          syncFullscreenState();
          return;
        }
        closePlayer();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    active,
    closePlayer,
    isFullscreen,
    syncFullscreenState,
    toggleFullscreen,
    toggleMute,
    togglePlayPause,
  ]);

  const onPointerMove = (event: ReactPointerEvent) => {
    if (!active) return;
    if (event.pointerType === "touch") return;
    revealChrome();
  };

  const previewAutoplay = !active && nearViewport;

  return (
    <div
      ref={rootRef}
      className={styles.frame}
      data-player-active={active ? "true" : "false"}
      data-fullscreen={isFullscreen ? "true" : "false"}
      onPointerMove={onPointerMove}
    >
      <div className={styles.inner}>
        <SecureVideo
          videoKey={videoKey}
          videoRef={videoRef}
          className={styles.video}
          {...(poster ? { poster } : {})}
          autoPlay={previewAutoplay}
          muted={!active || !hasAudio || needsTapForSound}
          loop={!active}
          playsInline
          controls={false}
          preload={nearViewport || active ? "metadata" : "none"}
          onClick={(event) => {
            event.preventDefault();
            void togglePlayPause();
          }}
        />

        {!active ? (
          <button
            type="button"
            className={styles.hitLayer}
            aria-label="Open film player"
            onClick={() => {
              void openPlayer();
            }}
          />
        ) : null}

        {active && needsTapForSound ? (
          <button
            type="button"
            className={styles.tapForSound}
            onClick={() => {
              void enableSoundFallback();
            }}
          >
            Tap for sound
          </button>
        ) : null}

        {active ? (
          <div
            className={`${styles.chrome}${chromeVisible ? ` ${styles.chromeVisible}` : ""}`}
            onPointerDown={revealChrome}
          >
            <div className={styles.progressRow}>
              <input
                className={styles.progress}
                type="range"
                min={0}
                max={duration || 0}
                step={0.05}
                value={Math.min(currentTime, duration || 0)}
                aria-label="Seek"
                onChange={(event) => onScrub(Number(event.target.value))}
              />
            </div>

            <div className={styles.controlsRow}>
              <button
                type="button"
                className={styles.controlBtn}
                aria-label={playing ? "Pause" : "Play"}
                onClick={() => {
                  void togglePlayPause();
                }}
              >
                {playing ? (
                  <IconPause className={styles.icon} />
                ) : (
                  <IconPlay className={styles.icon} />
                )}
              </button>

              {hasAudio ? (
                <div className={styles.volumeGroup}>
                  <button
                    type="button"
                    className={styles.controlBtn}
                    aria-label={muted ? "Unmute" : "Mute"}
                    aria-pressed={muted}
                    onClick={toggleMute}
                  >
                    {muted || volume === 0 ? (
                      <IconMuted className={styles.icon} />
                    ) : (
                      <IconVolume className={styles.icon} />
                    )}
                  </button>
                  <input
                    className={styles.volume}
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={muted ? 0 : volume}
                    aria-label="Volume"
                    onChange={(event) =>
                      onVolumeInput(Number(event.target.value))
                    }
                  />
                </div>
              ) : (
                <span className={styles.spacer} />
              )}

              <span className={styles.time} aria-hidden>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <button
                type="button"
                className={styles.controlBtn}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                aria-pressed={isFullscreen}
                onClick={() => {
                  void toggleFullscreen();
                }}
              >
                {isFullscreen ? (
                  <IconExitFullscreen className={styles.icon} />
                ) : (
                  <IconEnterFullscreen className={styles.icon} />
                )}
              </button>

              <button
                type="button"
                className={styles.controlBtn}
                aria-label="Close player"
                onClick={closePlayer}
              >
                <IconClose className={styles.icon} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
