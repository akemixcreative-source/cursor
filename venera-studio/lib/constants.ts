/** Cal.com booking URL — override via NEXT_PUBLIC_CAL_BOOKING_URL */
export const CAL_BOOKING_URL =
  process.env.NEXT_PUBLIC_CAL_BOOKING_URL ??
  "https://cal.com/venera/intro?overlayCalendar=true";

/** Poster frame while hero video loads (WebP/PNG) */
export const HERO_POSTER_SRC = "/images/hero.png";

/** Transparent logo for fixed header over video */
export const HEADER_LOGO_SRC =
  "/images/mockups/Logo/venera_transparent.png";

/**
 * Full-bleed landing hero video (H.264 MP4).
 * File lives under public; spaces in filename are encoded when used in video src.
 */
export const HERO_VIDEO_RELATIVE_PATH = "/images/mockups/Header Video.mp4";

/** Instagram profile URL — set NEXT_PUBLIC_INSTAGRAM_URL */
export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/";
