import {
  SITE_BRAND,
  SITE_BRAND_ALTERNATES,
  SITE_DESCRIPTION,
  SITE_SAME_AS,
  SITE_SERVICE,
  SITE_URL,
} from "@/lib/site";

/**
 * Shared knowledge-graph nodes for venera.
 *
 * Emitted from the root layout so every page ships the same Organization +
 * Service signal to Google. No Person / founder nodes — SERP and schema stay
 * studio- and service-focused. Per-page JSON-LD should reference these `@id`
 * values via `{ "@id": ORG_ID }` instead of redefining orgs inline.
 */
export const ORG_ID = `${SITE_URL}/#organization`;
export const SERVICE_ID = `${SITE_URL}/#motion-design-services`;

export function buildOrganizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_BRAND,
    alternateName: [...SITE_BRAND_ALTERNATES],
    url: SITE_URL,
    logo: `${SITE_URL}/images/venera-logo.png`,
    description: SITE_DESCRIPTION,
    slogan: SITE_SERVICE,
    areaServed: ["New York", "United States", "Remote"],
    knowsAbout: [
      "Motion Design",
      "Motion Design services",
      "Video Production",
      "Brand Systems",
      "Launch Films",
      "Founder Videos",
      "Performance Creative",
      "Cinematography",
      "3D Design",
    ],
    sameAs: [...SITE_SAME_AS],
  };
}

export function buildServiceJsonLd() {
  return {
    "@type": "Service",
    "@id": SERVICE_ID,
    name: SITE_SERVICE,
    serviceType: SITE_SERVICE,
    provider: { "@id": ORG_ID },
    areaServed: ["New York", "United States", "Remote"],
    description:
      "Launch films, product motion, brand systems, and performance creative for funded founders and startups.",
    url: SITE_URL,
  };
}

/**
 * Full @graph payload injected in the root layout. Nesting Organization +
 * Service inside `@graph` lets Google merge them into a single entity.
 */
export function buildRootBrandJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [buildOrganizationJsonLd(), buildServiceJsonLd()],
  };
}
