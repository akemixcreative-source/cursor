import type { VideoAssetKey } from "@/data/videoAssets";

/** Full-bleed homepage hero — draft reel plays first; fallbacks if it fails to load. */
export const HOME_HERO_VIDEO_KEYS = [
  "draft-02",
  "home-hero",
  "home-hero-alt-1",
  "home-hero-alt-2",
] as const satisfies readonly VideoAssetKey[];

export const HOME_HERO_VIDEO_KEY = HOME_HERO_VIDEO_KEYS[0];
