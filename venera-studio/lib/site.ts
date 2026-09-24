/** Production site origin used for metadata, JSON-LD, and canonical URLs. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://venerastudio.com";

/**
 * Public brand vocabulary reused across SEO metadata, JSON-LD, footer, and
 * any surface that should show up consistently in search results.
 *
 * Google's SERP + AI Overview lean heavily on these strings. Keep them
 * studio/service-focused (no personal names) so results read as a motion
 * design studio, not an individual portfolio.
 */
export const SITE_BRAND = "venera";
export const SITE_BRAND_LEGAL = "venera";
export const SITE_SERVICE = "Motion Design services";
export const SITE_TAGLINE = "Motion Design services for founders and startups";
export const SITE_DESCRIPTION =
  "venera is a New York motion design studio delivering launch films, product motion, and brand systems for funded founders.";

/**
 * Historical / marketing spellings Google may already index. Listed as
 * schema.org `alternateName` so the knowledge graph can consolidate them
 * under the canonical `venera` brand.
 */
export const SITE_BRAND_ALTERNATES = [
  "Venera",
  "Venera Studio",
  "venerastudio",
] as const;

/** External brand profiles that reinforce the studio identity in JSON-LD `sameAs`. */
export const SITE_SAME_AS = [
  "https://www.instagram.com/veneracreative/",
  "https://www.behance.net/ryanjiju",
  "https://x.com/veneracreative",
] as const;

/**
 * Title-cased brand and service used for browser tab labels, SERP titles, and
 * social card titles, where the lowercase wordmark reads as a typo. Visible
 * page copy keeps the `SITE_BRAND` styling.
 */
export const SITE_TITLE_BRAND = "Venera";
export const SITE_TITLE_SERVICE = "Motion Design Services";
export const SITE_TITLE = `${SITE_TITLE_BRAND} | ${SITE_TITLE_SERVICE}`;

/** Suffix a page title with the brand for consistent SERP titles. */
export function withBrandTitle(page: string): string {
  return `${page} | ${SITE_TITLE_BRAND}`;
}
