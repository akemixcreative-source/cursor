/** Default open volume — never blast. */
export const DEFAULT_VIDEO_VOLUME = 0.35;

const STORAGE_KEY = "venera.videoPlayer.prefs.v1";

export type VideoVolumePrefs = {
  volume: number;
  muted: boolean;
};

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_VIDEO_VOLUME;
  return Math.min(1, Math.max(0, value));
}

/** Read last volume/mute choice. Failures are ignored (private mode, SSR). */
export function readVideoVolumePrefs(): VideoVolumePrefs {
  try {
    if (typeof window === "undefined") {
      return { volume: DEFAULT_VIDEO_VOLUME, muted: false };
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { volume: DEFAULT_VIDEO_VOLUME, muted: false };
    const parsed = JSON.parse(raw) as Partial<VideoVolumePrefs>;
    return {
      volume: clampVolume(
        typeof parsed.volume === "number" ? parsed.volume : DEFAULT_VIDEO_VOLUME,
      ),
      muted: Boolean(parsed.muted),
    };
  } catch {
    return { volume: DEFAULT_VIDEO_VOLUME, muted: false };
  }
}

/** Persist volume/mute. Failures are ignored. */
export function writeVideoVolumePrefs(prefs: VideoVolumePrefs): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        volume: clampVolume(prefs.volume),
        muted: Boolean(prefs.muted),
      }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}
