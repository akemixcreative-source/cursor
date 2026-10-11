/** Production site origin used for metadata, JSON-LD, and canonical URLs. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://venerastudio.com";

/**
 * Public brand vocabulary reused across SEO metadata, JSON-LD, footer, and
 * any surface that should show up consistently in search results.
 *
 * Brand stays primary for “Venera” queries; founder name is paired so AI
 * overviews and knowledge panels attribute the studio to Ryan Thomas.
 */
export const SITE_BRAND = "Venera";
export const SITE_BRAND_LEGAL = "Venera Studio";
export const SITE_SERVICE = "Motion Design Services";
export const SITE_FOUNDER = "Ryan Thomas";
export const SITE_TAGLINE = "Motion design services for founders and startups";
export const SITE_DESCRIPTION =
  "Venera is Ryan Thomas's New York motion design studio. Launch films, product motion, and brand systems for funded founders — made directly with Ryan at venerastudio.com.";

/**
 * Historical / marketing spellings Google may already index. Listed as
 * schema.org `alternateName` so the knowledge graph can consolidate them
 * under the canonical Venera brand.
 */
export const SITE_BRAND_ALTERNATES = [
  "venera",
  "Venera Studio",
  "venera studio",
  "Venera Motion",
  "venerastudio",
  "venerastudio.com",
  "Venera Creative",
  "Ryan Thomas Venera",
] as const;

/** External brand + founder profiles that reinforce identity in JSON-LD `sameAs`. */
export const SITE_SAME_AS = [
  "https://www.instagram.com/venera_motion/",
  "https://www.behance.net/ryanjiju",
  "https://x.com/veneracreative",
  "https://www.linkedin.com/in/ryanjiju/",
] as const;

/**
 * Title-cased brand and service used for browser tab labels, SERP titles, and
 * social card titles.
 */
export const SITE_TITLE_BRAND = "Venera";
export const SITE_TITLE_SERVICE = "Motion Design Services";
export const SITE_TITLE = `${SITE_TITLE_BRAND} | ${SITE_TITLE_SERVICE}`;

/** Suffix a page title with the brand for consistent SERP titles. */
export function withBrandTitle(page: string): string {
  return `${page} | ${SITE_TITLE_BRAND}`;
}
