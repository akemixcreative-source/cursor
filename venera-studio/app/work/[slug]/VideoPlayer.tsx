"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
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

const CONTROLS_HIDE_MS = 2500;
const FADE_IN_MS = 400;
const DEFAULT_ASPECT = 16 / 9;
const KEY_SEEK_SECONDS = 5;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const IconPlay = () => (
  <Icon>
    <path d="M7.5 5.2v13.6a.6.6 0 0 0 .9.5l10.8-6.8a.6.6 0 0 0 0-1L8.4 4.7a.6.6 0 0 0-.9.5Z" />
  </Icon>
);

const IconPause = () => (
  <Icon>
    <path d="M8.5 5v14M15.5 5v14" />
  </Icon>
);

const IconVolume = () => (
  <Icon>
    <path d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4Z" />
    <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10" />
  </Icon>
);

const IconMuted = () => (
  <Icon>
    <path d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4Z" />
    <path d="m16 10 4 4M20 10l-4 4" />
  </Icon>
);

const IconClose = () => (
  <Icon>
    <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
  </Icon>
);

const IconEnterFullscreen = () => (
  <Icon>
    <path d="M9 4.5H4.5V9M15 4.5h4.5V9M9 19.5H4.5V15M15 19.5h4.5V15" />
  </Icon>
);

const IconExitFullscreen = () => (
  <Icon>
    <path d="M9 4.5V9H4.5M15 4.5V9h4.5M9 19.5V15H4.5M15 19.5V15h4.5" />
  </Icon>
);

type FullscreenElement = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  webkitRequestFullScreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitCancelFullScreen?: () => Promise<void> | void;
};

type IOSVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function elementFullscreenSupported(el: Element): boolean {
  const doc = document as FullscreenDocument;
  const node = el as FullscreenElement;
  const enabled = document.fullscreenEnabled || doc.webkitFullscreenEnabled;
  return Boolean(
    enabled &&
      (node.requestFullscreen ||
        node.webkitRequestFullscreen ||
        node.webkitRequestFullScreen),
  );
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

/** Fraction (0–1) of a pointer's x position across an element. */
function pointerFraction(event: { clientX: number }, el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0) return 0;
  return clamp01((event.clientX - rect.left) / rect.width);
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
  const activeRef = useRef(false);

  const progressRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef<HTMLDivElement>(null);
  const bufferedRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const scrubbingRef = useRef(false);
  const scrubFractionRef = useRef(0);
  const overControlsRef = useRef(false);
  const lastPointerTypeRef = useRef<string>("mouse");
  const volumeCloseTimerRef = useRef<number | null>(null);

  const hasAudio = videoAssetHasAudio(videoKey);

  const [nearViewport, setNearViewport] = useState(false);
  const [active, setActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [aspect, setAspect] = useState(DEFAULT_ASPECT);
  const [volume, setVolume] = useState(DEFAULT_VIDEO_VOLUME);
  const [muted, setMuted] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [needsTapForSound, setNeedsTapForSound] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

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

  /* ---------------------------------------------------------------------
     Progress painting — written straight to the DOM (transform: scaleX) so
     the bar moves every frame without re-rendering React.
     --------------------------------------------------------------------- */

  const paintProgress = useCallback((fractionOverride?: number) => {
    const video = videoRef.current;
    if (!video) return;
    const total = Number.isFinite(video.duration) ? video.duration : 0;
    const fraction =
      fractionOverride ?? (total > 0 ? clamp01(video.currentTime / total) : 0);
    const shownTime = fractionOverride != null ? fraction * total : video.currentTime;

    if (playedRef.current) {
      playedRef.current.style.transform = `scaleX(${fraction})`;
    }
    if (thumbRef.current) {
      thumbRef.current.style.transform = `translateX(${(fraction - 1) * 100}%)`;
    }
    if (bufferedRef.current && total > 0) {
      let end = 0;
      const ranges = video.buffered;
      for (let i = 0; i < ranges.length; i += 1) {
        if (ranges.start(i) <= video.currentTime + 0.5) {
          end = Math.max(end, ranges.end(i));
        }
      }
      bufferedRef.current.style.transform = `scaleX(${clamp01(end / total)})`;
    }
    if (timeRef.current) {
      const text = `${formatTime(shownTime)} / ${formatTime(total)}`;
      if (timeRef.current.textContent !== text) timeRef.current.textContent = text;
    }
    if (progressRef.current) {
      progressRef.current.setAttribute("aria-valuenow", String(Math.round(shownTime)));
      progressRef.current.setAttribute(
        "aria-valuetext",
        `${formatTime(shownTime)} of ${formatTime(total)}`,
      );
    }
  }, []);

  useEffect(() => {
    if (!active || !playing) return;
    let frame = 0;
    const tick = () => {
      if (!scrubbingRef.current) paintProgress();
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, playing, paintProgress]);

  /* ---------------------------------------------------------------------
     Controls + cursor visibility
     --------------------------------------------------------------------- */

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHideChrome = useCallback(() => {
    clearHideTimer();
    if (!activeRef.current) return;
    hideTimerRef.current = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video || video.paused) return;
      if (overControlsRef.current || scrubbingRef.current) return;
      setChromeVisible(false);
      setVolumeOpen(false);
    }, CONTROLS_HIDE_MS);
  }, [clearHideTimer]);

  const revealChrome = useCallback(() => {
    setChromeVisible(true);
    scheduleHideChrome();
  }, [scheduleHideChrome]);

  useEffect(() => {
    if (!active) return;
    if (playing) scheduleHideChrome();
    else clearHideTimer();
  }, [active, playing, clearHideTimer, scheduleHideChrome]);

  /* ---------------------------------------------------------------------
     Audio + session
     --------------------------------------------------------------------- */

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
    const video = videoRef.current as IOSVideoElement | null;
    gainRef.current?.silence();
    if (video) {
      video.pause();
      video.muted = true;
      video.loop = true;
      if (video.webkitDisplayingFullscreen) video.webkitExitFullscreen?.();
    }
    setPlaying(false);
    setActive(false);
    setNeedsTapForSound(false);
    setChromeVisible(true);
    setVolumeOpen(false);
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
    const video = videoRef.current as IOSVideoElement | null;
    setIsFullscreen(
      Boolean(
        (root && getFullscreenElement() === root) ||
          video?.webkitDisplayingFullscreen,
      ),
    );
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const root = rootRef.current;
    const video = videoRef.current as IOSVideoElement | null;
    if (!root || !video || !active) return;
    revealChrome();
    try {
      if (getFullscreenElement() === root) {
        await exitFullscreenEl();
      } else if (elementFullscreenSupported(root)) {
        await requestFullscreenEl(root);
      } else if (video.webkitEnterFullscreen) {
        // iPhone Safari has no element fullscreen; only the native video one.
        video.webkitEnterFullscreen();
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
  }, [hasAudio, muted, stopSelf, volume]);

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

  /* ---------------------------------------------------------------------
     Scrubbing — the bar follows the pointer immediately; the seek happens
     once, on release.
     --------------------------------------------------------------------- */

  const onProgressPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar || event.button > 0) return;
    event.preventDefault();
    bar.setPointerCapture(event.pointerId);
    scrubbingRef.current = true;
    setScrubbing(true);
    clearHideTimer();
    setChromeVisible(true);
    scrubFractionRef.current = pointerFraction(event, bar);
    paintProgress(scrubFractionRef.current);
  };

  const onProgressPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar || !scrubbingRef.current) return;
    scrubFractionRef.current = pointerFraction(event, bar);
    paintProgress(scrubFractionRef.current);
  };

  const endScrub = (commit: boolean) => {
    if (!scrubbingRef.current) return;
    scrubbingRef.current = false;
    setScrubbing(false);
    const video = videoRef.current;
    if (commit && video && Number.isFinite(video.duration)) {
      video.currentTime = scrubFractionRef.current * video.duration;
    }
    paintProgress();
    scheduleHideChrome();
  };

  const onProgressKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    let next: number | null = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      next = video.currentTime - KEY_SEEK_SECONDS;
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      next = video.currentTime + KEY_SEEK_SECONDS;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = video.duration;
    }
    if (next == null) return;
    event.preventDefault();
    video.currentTime = Math.min(video.duration, Math.max(0, next));
    paintProgress();
    revealChrome();
  };

  const volumeTrackRef = useRef<HTMLDivElement>(null);
  const volumeDraggingRef = useRef(false);

  const onVolumePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = volumeTrackRef.current;
    if (!track || event.button > 0) return;
    event.preventDefault();
    track.setPointerCapture(event.pointerId);
    volumeDraggingRef.current = true;
    onVolumeInput(pointerFraction(event, track));
  };

  const onVolumePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const track = volumeTrackRef.current;
    if (!track || !volumeDraggingRef.current) return;
    onVolumeInput(pointerFraction(event, track));
  };

  const onVolumePointerUp = () => {
    volumeDraggingRef.current = false;
  };

  const onVolumeKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const current = muted ? 0 : volume;
    let next: number | null = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = current - 0.05;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") next = current + 0.05;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 1;
    if (next == null) return;
    event.preventDefault();
    onVolumeInput(next);
  };

  const openVolume = () => {
    if (volumeCloseTimerRef.current != null) {
      window.clearTimeout(volumeCloseTimerRef.current);
      volumeCloseTimerRef.current = null;
    }
    setVolumeOpen(true);
  };

  const closeVolumeSoon = () => {
    if (volumeCloseTimerRef.current != null) {
      window.clearTimeout(volumeCloseTimerRef.current);
    }
    volumeCloseTimerRef.current = window.setTimeout(() => {
      if (!volumeDraggingRef.current) setVolumeOpen(false);
    }, 400);
  };

  /* ---------------------------------------------------------------------
     Effects
     --------------------------------------------------------------------- */

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
    const video = videoRef.current as IOSVideoElement | null;
    if (!video) return;

    const onMeta = () => {
      setDuration(video.duration || 0);
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setAspect(video.videoWidth / video.videoHeight);
      }
      paintProgress();
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      paintProgress();
    };
    const onSeeked = () => {
      if (!scrubbingRef.current) paintProgress();
    };
    const onProgress = () => {
      if (video.paused && !scrubbingRef.current) paintProgress();
    };
    const onEnded = () => {
      if (activeRef.current) {
        setPlaying(false);
        setChromeVisible(true);
      }
    };
    const onNativeFullscreen = () => syncFullscreenState();

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMeta();

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("durationchange", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("progress", onProgress);
    video.addEventListener("ended", onEnded);
    video.addEventListener("webkitbeginfullscreen", onNativeFullscreen);
    video.addEventListener("webkitendfullscreen", onNativeFullscreen);
    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("webkitbeginfullscreen", onNativeFullscreen);
      video.removeEventListener("webkitendfullscreen", onNativeFullscreen);
    };
  }, [paintProgress, syncFullscreenState]);

  // Repaint once the control bar mounts so it opens at the right position.
  useEffect(() => {
    if (active) paintProgress();
  }, [active, paintProgress]);

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
      if (volumeCloseTimerRef.current != null) {
        window.clearTimeout(volumeCloseTimerRef.current);
      }
    };
  }, [clearHideTimer, stopSelf]);

  // Leave viewport while active → close (stops audio). Stay open in fullscreen.
  useEffect(() => {
    if (!active || nearViewport || isFullscreen) return;
    closePlayer();
  }, [active, closePlayer, isFullscreen, nearViewport]);

  // Keep isFullscreen in sync with the Fullscreen API (Esc, browser UI, etc.).
  useEffect(() => {
    const onChange = () => {
      syncFullscreenState();
      if (activeRef.current) revealChrome();
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [revealChrome, syncFullscreenState]);

  // Keyboard: Space / M / F / Esc when this player is active.
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

  const onFramePointerMove = (event: ReactPointerEvent) => {
    lastPointerTypeRef.current = event.pointerType;
    if (!active || event.pointerType === "touch") return;
    const target = event.target as Element | null;
    overControlsRef.current = Boolean(target?.closest("[data-player-controls]"));
    if (overControlsRef.current) {
      clearHideTimer();
      setChromeVisible(true);
    } else {
      revealChrome();
    }
  };

  const onFramePointerLeave = () => {
    overControlsRef.current = false;
    if (active) scheduleHideChrome();
  };

  const onFramePointerDown = (event: ReactPointerEvent) => {
    lastPointerTypeRef.current = event.pointerType;
  };

  const onVideoClick = () => {
    // On touch, the first tap on hidden controls only brings them back.
    if (
      active &&
      playing &&
      !chromeVisible &&
      lastPointerTypeRef.current === "touch"
    ) {
      revealChrome();
      return;
    }
    void togglePlayPause();
  };

  const previewAutoplay = !active && nearViewport;
  const shownVolume = muted ? 0 : volume;
  const frameStyle = { "--video-aspect": String(aspect) } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={styles.frame}
      style={frameStyle}
      data-player-active={active ? "true" : "false"}
      data-fullscreen={isFullscreen ? "true" : "false"}
      data-chrome={!active || !playing || chromeVisible ? "visible" : "hidden"}
      onPointerMove={onFramePointerMove}
      onPointerLeave={onFramePointerLeave}
      onPointerDown={onFramePointerDown}
    >
      <div className={styles.stage}>
        <SecureVideo
          videoKey={videoKey}
          videoRef={videoRef}
          className={styles.video}
          {...(poster ? { poster } : {})}
          autoPlay={previewAutoplay}
          pauseWhenNotAutoPlaying={false}
          muted={!active || !hasAudio || needsTapForSound}
          loop={!active}
          playsInline
          controls={false}
          preload={nearViewport || active ? "metadata" : "none"}
          onClick={(event) => {
            event.preventDefault();
            onVideoClick();
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

        {active ? (
          <>
            <div
              className={styles.centerPlay}
              data-show={!playing && !needsTapForSound ? "true" : "false"}
              aria-hidden
            >
              <IconPlay />
            </div>

            <button
              type="button"
              className={`${styles.controlBtn} ${styles.closeBtn}`}
              aria-label="Close player"
              onClick={closePlayer}
              data-player-controls
            >
              <IconClose />
            </button>

            <div className={styles.shade} aria-hidden />

            <div
              className={styles.chrome}
              data-player-controls
              onPointerDown={revealChrome}
            >
              <div
                ref={progressRef}
                className={styles.progress}
                data-scrubbing={scrubbing ? "true" : "false"}
                role="slider"
                tabIndex={0}
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={0}
                onPointerDown={onProgressPointerDown}
                onPointerMove={onProgressPointerMove}
                onPointerUp={() => endScrub(true)}
                onPointerCancel={() => endScrub(false)}
                onLostPointerCapture={() => endScrub(true)}
                onKeyDown={onProgressKeyDown}
              >
                <div className={styles.rail}>
                  <div ref={bufferedRef} className={styles.buffered} />
                  <div ref={playedRef} className={styles.played} />
                </div>
                <div ref={thumbRef} className={styles.thumbTrack}>
                  <span className={styles.thumb} />
                </div>
              </div>

              <div className={styles.controlsRow}>
                <div className={styles.group}>
                  <button
                    type="button"
                    className={styles.controlBtn}
                    aria-label={playing ? "Pause" : "Play"}
                    onClick={() => {
                      void togglePlayPause();
                    }}
                  >
                    {playing ? <IconPause /> : <IconPlay />}
                  </button>
                  <span ref={timeRef} className={styles.time}>
                    0:00 / {formatTime(duration)}
                  </span>
                </div>

                <div className={styles.group}>
                  {hasAudio ? (
                    <div
                      className={styles.volumeGroup}
                      data-open={volumeOpen ? "true" : "false"}
                      onPointerOver={(event) => {
                        if (event.pointerType !== "touch") openVolume();
                      }}
                      onPointerOut={(event) => {
                        if (event.pointerType === "touch") return;
                        const next = event.relatedTarget as Node | null;
                        if (!next || !event.currentTarget.contains(next)) {
                          closeVolumeSoon();
                        }
                      }}
                      onFocus={openVolume}
                      onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) {
                          closeVolumeSoon();
                        }
                      }}
                    >
                      <div
                        ref={volumeTrackRef}
                        className={styles.volumeTrack}
                        role="slider"
                        tabIndex={0}
                        aria-label="Volume"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(shownVolume * 100)}
                        onPointerDown={onVolumePointerDown}
                        onPointerMove={onVolumePointerMove}
                        onPointerUp={onVolumePointerUp}
                        onPointerCancel={onVolumePointerUp}
                        onKeyDown={onVolumeKeyDown}
                      >
                        <div className={styles.volumeRail}>
                          <div
                            className={styles.volumeFill}
                            style={{ transform: `scaleX(${shownVolume})` }}
                          />
                        </div>
                        <span
                          className={styles.volumeThumb}
                          style={{ left: `${shownVolume * 100}%` }}
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.controlBtn}
                        aria-label={muted ? "Unmute" : "Mute"}
                        aria-pressed={muted}
                        onPointerDown={(event) => {
                          if (event.pointerType === "touch") openVolume();
                        }}
                        onClick={toggleMute}
                      >
                        {muted || volume === 0 ? <IconMuted /> : <IconVolume />}
                      </button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className={styles.controlBtn}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    aria-pressed={isFullscreen}
                    onClick={() => {
                      void toggleFullscreen();
                    }}
                  >
                    {isFullscreen ? <IconExitFullscreen /> : <IconEnterFullscreen />}
                  </button>
                </div>
              </div>
            </div>

            {needsTapForSound ? (
              <button
                type="button"
                className={styles.tapForSound}
                onClick={() => {
                  void enableSoundFallback();
                }}
              >
                <IconVolume />
                <span>Tap for sound</span>
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
