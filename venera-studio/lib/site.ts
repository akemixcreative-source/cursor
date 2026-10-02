/** Production site origin used for metadata, JSON-LD, and canonical URLs. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://venerastudio.com";

/**
 * Public brand vocabulary reused across SEO metadata, JSON-LD, footer, and
 * any surface that should show up consistently in search results.
 *
 * Google's SERP + AI Overview lean on these strings. The searchable name is
 * "Venera" / "Venera Studio" (title case). Visible wordmark art can stay
 * lowercase without changing how crawlers read the entity.
 */
export const SITE_BRAND = "Venera";
export const SITE_BRAND_LEGAL = "Venera Studio";
export const SITE_SERVICE = "Motion Design Studio";
export const SITE_TAGLINE = "Motion design for founders and startups";
export const SITE_DESCRIPTION =
  "Venera is a New York motion design studio. Launch films, product motion, and brand systems for funded founders — made directly with the studio.";

/**
 * Spellings and queries Google / AI search already use. Listed as
 * schema.org `alternateName` so they consolidate under Venera.
 */
export const SITE_BRAND_ALTERNATES = [
  "venera",
  "Venera Studio",
  "venera studio",
  "Venera Motion",
  "venerastudio",
  "venerastudio.com",
  "Venera Creative",
] as const;

/** Title-cased brand used for tabs, SERP titles, and social cards. */
export const SITE_TITLE_BRAND = "Venera";
export const SITE_TITLE_SERVICE = "Motion Design Studio";
export const SITE_TITLE = `${SITE_TITLE_BRAND} | ${SITE_TITLE_SERVICE}`;

/** Default Open Graph / Twitter image (generated at /opengraph-image). */
export const SITE_OG_IMAGE_ALT = "Venera — New York motion design studio";

/** Suffix a page title with the brand for consistent SERP titles. */
export function withBrandTitle(page: string): string {
  return `${page} | ${SITE_TITLE_BRAND}`;
}
