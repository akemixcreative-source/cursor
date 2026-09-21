/**
 * Logical video keys → local fallback paths (dev / pre-Stream only).
 * Cloudflare Stream UIDs live in `STREAM_VIDEO_MAP` env JSON on the server.
 */
export const VIDEO_ASSETS = {
  "capsa-announcement": {
    fallback: "/videos/capsa-ai-series-a-announcement-film-web.mp4",
    poster: "/images/posters/capsa-announcement.jpg",
  },
  "capsa-behind-the-scenes": {
    fallback: "/videos/capsa-behind-the-scenes-web.mp4",
    poster: "/images/posters/capsa-behind-the-scenes.jpg",
  },
  "capsa-product-film": {
    fallback: "/videos/capsa-product-film-web.mp4",
    poster: "/images/posters/capsa-product-film.jpg",
  },
  "meta-rayban-hero": {
    fallback: "/images/mockups/Header-Video-web.mp4",
    poster: "/images/posters/meta-rayban-hero.jpg",
  },
  "gemini-hero": {
    fallback: "/images/mockups/Gemini(2)-web.mp4",
    poster: "/images/posters/gemini-hero.jpg",
  },
  "appstack-hero": {
    fallback: "/images/mockups/Appstack-X-web.mp4",
    poster: "/images/posters/appstack-hero.jpg",
  },
  "appstack-fundraise": {
    fallback: "/images/mockups/Fund%20Raising%20Video.mp4",
    poster: "/images/posters/appstack-fundraise.jpg",
  },
  "appstack-website-hero": {
    fallback: "/images/mockups/Appstack%20website%20hero%205.MP4",
    poster: "/images/posters/appstack-website-hero.jpg",
  },
  "nexus-seed": {
    fallback: "/images/mockups/Nexus-1-web.mp4",
    poster: "/images/posters/nexus-seed.jpg",
  },
  "nexus-cue": {
    fallback: "/images/mockups/CUE-V2-web.mp4",
    poster: "/images/posters/nexus-cue.jpg",
  },
  "typography-hero": {
    fallback: "/videos/comp-1-1-web.mp4",
    poster: "/images/posters/typography-hero.jpg",
  },
  "hero-intro-visual": {
    /** Homepage HeroIntro only — served as local MP4, not Cloudflare Stream. */
    fallback: "/images/hero-intro/hero-visual.mp4",
    poster: "/images/posters/hero-intro-visual.jpg",
  },
  "home-hero": {
    fallback: "/videos/home-hero.mp4",
    poster: "/images/posters/home-hero.jpg",
  },
  "draft-02": {
    fallback: "/images/mockups/draft_02-web.mp4",
    poster: "/images/posters/draft-02.jpg",
  },
  "home-hero-alt-1": {
    fallback: "/images/mockups/Header Video v2.mp4",
    poster: "/images/posters/home-hero-alt-1.jpg",
  },
  "home-hero-alt-2": {
    fallback: "/images/mockups/Header-Video-web.mp4",
    poster: "/images/posters/home-hero-alt-2.jpg",
  },
} as const;

export type VideoAssetKey = keyof typeof VIDEO_ASSETS;

/** Films whose shipped fallback MP4 includes an audio stream. */
const VIDEO_ASSETS_WITH_AUDIO = new Set<VideoAssetKey>([
  "capsa-announcement",
  "capsa-behind-the-scenes",
  "capsa-product-film",
  "meta-rayban-hero",
  "gemini-hero",
  "appstack-hero",
  "appstack-fundraise",
  "appstack-website-hero",
  "nexus-seed",
  "nexus-cue",
]);

export function isVideoAssetKey(value: string): value is VideoAssetKey {
  return value in VIDEO_ASSETS;
}

export function videoAssetHasAudio(key: VideoAssetKey): boolean {
  return VIDEO_ASSETS_WITH_AUDIO.has(key);
}

export function getVideoAssetFallback(key: VideoAssetKey): string {
  return VIDEO_ASSETS[key].fallback;
}

export function getVideoAssetPoster(key: VideoAssetKey): string {
  return VIDEO_ASSETS[key].poster;
}
