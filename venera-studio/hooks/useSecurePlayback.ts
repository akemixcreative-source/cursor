"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { VideoAssetKey } from "@/data/videoAssets";

type PlaybackPayload = {
  url: string;
  format: "hls" | "mp4";
  signed: boolean;
  expiresAt: number | null;
};

export type PlaybackState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; playback: PlaybackPayload }
  | { status: "error" };

type CacheEntry =
  | { status: "pending"; promise: Promise<PlaybackPayload> }
  | { status: "ready"; playback: PlaybackPayload; snapshot: PlaybackState }
  | { status: "error" };

const IDLE_STATE: PlaybackState = { status: "idle" };
const LOADING_STATE: PlaybackState = { status: "loading" };
const ERROR_STATE: PlaybackState = { status: "error" };

const playbackCache = new Map<string, CacheEntry>();
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshotForKey(videoKey: string): PlaybackState {
  const cached = playbackCache.get(videoKey);
  if (cached?.status === "ready") return cached.snapshot;
  if (cached?.status === "pending") return LOADING_STATE;
  if (cached?.status === "error") return ERROR_STATE;
  return IDLE_STATE;
}

async function fetchPlayback(videoKey: string): Promise<PlaybackPayload> {
  const res = await fetch(
    `/api/video/playback?key=${encodeURIComponent(videoKey)}`,
  );
  if (!res.ok) throw new Error("playback failed");
  return (await res.json()) as PlaybackPayload;
}

function beginPlaybackFetch(videoKey: string): Promise<PlaybackPayload> {
  const existing = playbackCache.get(videoKey);
  if (existing?.status === "pending") return existing.promise;
  if (existing?.status === "ready") return Promise.resolve(existing.playback);

  const promise = fetchPlayback(videoKey)
    .then((playback) => {
      const snapshot: PlaybackState = { status: "ready", playback };
      playbackCache.set(videoKey, { status: "ready", playback, snapshot });
      emitChange();
      return playback;
    })
    .catch((error: unknown) => {
      playbackCache.set(videoKey, { status: "error" });
      emitChange();
      throw error;
    });

  playbackCache.set(videoKey, { status: "pending", promise });
  emitChange();
  return promise;
}

function retryPlaybackFetch(videoKey: string): Promise<PlaybackPayload> {
  playbackCache.delete(videoKey);
  return beginPlaybackFetch(videoKey);
}

/** Start playback URL resolution as early as possible. */
export function prefetchSecurePlayback(videoKey: VideoAssetKey): void {
  const cached = playbackCache.get(videoKey);
  if (cached?.status === "ready" || cached?.status === "pending") return;
  if (cached?.status === "error") playbackCache.delete(videoKey);

  void beginPlaybackFetch(videoKey).catch(() => {
    /* surfaced when a consumer subscribes */
  });
}

export function useSecurePlayback(videoKey: VideoAssetKey | null): PlaybackState {
  const state = useSyncExternalStore(
    subscribe,
    (): PlaybackState =>
      videoKey ? getSnapshotForKey(videoKey) : IDLE_STATE,
    (): PlaybackState => IDLE_STATE,
  );

  useEffect(() => {
    if (!videoKey) return;

    const cached = playbackCache.get(videoKey);
    if (cached?.status === "ready" || cached?.status === "pending") return;

    if (cached?.status === "error") {
      void retryPlaybackFetch(videoKey).catch(() => {
        /* error state surfaced via store */
      });
      return;
    }

    void beginPlaybackFetch(videoKey).catch(() => {
      /* error state surfaced via store */
    });
  }, [videoKey]);

  return state;
}
