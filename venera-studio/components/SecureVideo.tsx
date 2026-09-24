"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type Ref,
  type SyntheticEvent,
} from "react";

import type { VideoAssetKey } from "@/data/videoAssets";
import {
  useSecurePlayback,
  type PlaybackState,
} from "@/hooks/useSecurePlayback";
import { prefersLightweightRendering } from "@/lib/renderingCapabilities";

const PLAY_RETRY_MS = 1500;

type SecureVideoProps = Omit<
  ComponentPropsWithoutRef<"video">,
  "src" | "children"
> & {
  videoKey: VideoAssetKey;
  videoRef?: Ref<HTMLVideoElement>;
};

function kickPlayback(video: HTMLVideoElement): void {
  if (video.ended) return;
  void video.play().catch(() => {
    /* autoplay policies — caller may retry */
  });
}

type ReadyPlayback = Extract<PlaybackState, { status: "ready" }>["playback"];

function attachNativeSource(video: HTMLVideoElement, url: string): () => void {
  video.src = url;
  if (video.autoplay) kickPlayback(video);
  return () => {
    video.removeAttribute("src");
    video.load();
  };
}

function attachPlayback(
  video: HTMLVideoElement,
  playback: ReadyPlayback,
  onError: (() => void) | undefined,
): () => void {
  const { url, format } = playback;

  if (format !== "hls") {
    return attachNativeSource(video, url);
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    return attachNativeSource(video, url);
  }

  let cancelled = false;
  let detach = () => {};

  void import("hls.js").then(({ default: Hls }) => {
    if (cancelled) return;
    if (!Hls.isSupported()) {
      detach = attachNativeSource(video, url);
      return;
    }

    const constrained =
      window.matchMedia("(max-width: 720px)").matches ||
      prefersLightweightRendering();

    const hls = new Hls({
      enableWorker: true,
      capLevelToPlayerSize: true,
      maxBufferLength: constrained ? 6 : 12,
      maxMaxBufferLength: constrained ? 12 : 24,
      startLevel: constrained ? 0 : -1,
    });

    if (cancelled) {
      hls.destroy();
      return;
    }

    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (video.autoplay) kickPlayback(video);
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) onError?.();
    });
    detach = () => {
      hls.destroy();
      video.removeAttribute("src");
      video.load();
    };
  });

  return () => {
    cancelled = true;
    detach();
  };
}

/**
 * Fetches a short-lived signed HLS URL from `/api/video/playback` and attaches
 * it to a native `<video>`. Falls back to local MP4 in dev when Stream is unset.
 */
export function SecureVideo({
  videoKey,
  videoRef,
  className,
  onLoadedData,
  onCanPlay,
  onPlaying,
  onError,
  autoPlay = false,
  ...rest
}: SecureVideoProps) {
  const internalRef = useRef<HTMLVideoElement | null>(null);
  const detachRef = useRef<(() => void) | null>(null);
  const playbackState = useSecurePlayback(videoKey);
  const handlersRef = useRef({ onLoadedData, onCanPlay, onPlaying, onError });
  handlersRef.current = { onLoadedData, onCanPlay, onPlaying, onError };

  const bindPlayback = useCallback(
    (video: HTMLVideoElement | null) => {
      detachRef.current?.();
      detachRef.current = null;

      if (!video || playbackState.status !== "ready") return;

      let readyNotified = false;
      const notifyReady = () => {
        if (readyNotified) return;
        readyNotified = true;
        const evt = {
          target: video,
        } as unknown as SyntheticEvent<HTMLVideoElement>;
        handlersRef.current.onLoadedData?.(evt);
        handlersRef.current.onCanPlay?.(evt);
        handlersRef.current.onPlaying?.(evt);
      };

      const ensurePlaying = () => {
        if (!video.autoplay) return;
        if (video.ended) return;
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        if (!video.paused) return;
        kickPlayback(video);
      };

      const onMediaReady = () => {
        if (video.autoplay) kickPlayback(video);
      };

      const onVisibility = () => {
        if (document.visibilityState === "visible") ensurePlaying();
      };

      video.addEventListener("loadeddata", onMediaReady);
      video.addEventListener("canplay", onMediaReady);
      video.addEventListener("playing", notifyReady);
      video.addEventListener("stalled", ensurePlaying);
      video.addEventListener("waiting", ensurePlaying);
      document.addEventListener("visibilitychange", onVisibility);

      const onFatalError = () => {
        handlersRef.current.onError?.({
          target: video,
        } as unknown as SyntheticEvent<HTMLVideoElement>);
      };

      const detachPlayback = attachPlayback(
        video,
        playbackState.playback,
        onFatalError,
      );
      detachRef.current = () => {
        video.removeEventListener("loadeddata", onMediaReady);
        video.removeEventListener("canplay", onMediaReady);
        video.removeEventListener("playing", notifyReady);
        video.removeEventListener("stalled", ensurePlaying);
        video.removeEventListener("waiting", ensurePlaying);
        document.removeEventListener("visibilitychange", onVisibility);
        detachPlayback();
      };
    },
    [playbackState],
  );

  const setRef = useCallback(
    (node: HTMLVideoElement | null) => {
      internalRef.current = node;
      if (typeof videoRef === "function") videoRef(node);
      else if (videoRef) videoRef.current = node;
      bindPlayback(node);
    },
    [videoRef, bindPlayback],
  );

  useLayoutEffect(() => {
    bindPlayback(internalRef.current);
    return () => {
      detachRef.current?.();
      detachRef.current = null;
    };
  }, [bindPlayback]);

  useEffect(() => {
    const video = internalRef.current;
    if (!video || playbackState.status !== "ready") return;

    if (!autoPlay) {
      video.pause();
      return;
    }

    kickPlayback(video);
    let attempts = 0;
    const playInterval = window.setInterval(() => {
      if (!video.paused || video.ended || attempts >= 10) {
        clearInterval(playInterval);
        return;
      }
      attempts += 1;
      kickPlayback(video);
    }, PLAY_RETRY_MS);

    return () => clearInterval(playInterval);
  }, [autoPlay, playbackState]);

  return (
    <video
      ref={setRef}
      className={className}
      controlsList="nodownload noplaybackrate"
      disablePictureInPicture
      onLoadedData={onLoadedData}
      onCanPlay={onCanPlay}
      onPlaying={onPlaying}
      onError={onError}
      autoPlay={autoPlay}
      {...rest}
    />
  );
}
