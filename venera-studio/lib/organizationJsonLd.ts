import {
  SITE_BRAND,
  SITE_BRAND_ALTERNATES,
  SITE_BRAND_LEGAL,
  SITE_DESCRIPTION,
  SITE_SERVICE,
  SITE_TAGLINE,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";
import {
  STUDIO_ADDRESS_LINES,
  STUDIO_BEHANCE_URL,
  STUDIO_EMAIL,
  STUDIO_INSTAGRAM_URL,
  STUDIO_X_URL,
} from "@/lib/studioContact";

/**
 * Shared knowledge-graph nodes for Venera.
 *
 * Emitted from the root layout so every page ships the same Organization +
 * WebSite + Service signal. Per-page JSON-LD should reference these `@id`
 * values via `{ "@id": ORG_ID }` instead of redefining orgs inline.
 */
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const SERVICE_ID = `${SITE_URL}/#motion-design-services`;
export const LOGO_ID = `${SITE_URL}/#logo`;

const LOGO_URL = `${SITE_URL}/images/mockups/Logo/venera-logo.png`;

export const SITE_SAME_AS = [
  STUDIO_INSTAGRAM_URL,
  STUDIO_BEHANCE_URL,
  STUDIO_X_URL,
] as const;

export function buildOrganizationJsonLd() {
  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: SITE_BRAND,
    legalName: SITE_BRAND_LEGAL,
    alternateName: [...SITE_BRAND_ALTERNATES],
    url: SITE_URL,
    logo: { "@id": LOGO_ID },
    image: LOGO_URL,
    email: STUDIO_EMAIL,
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
    brand: {
      "@type": "Brand",
      name: SITE_BRAND,
      alternateName: [...SITE_BRAND_ALTERNATES],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: STUDIO_ADDRESS_LINES[0],
      addressLocality: "Albany",
      addressRegion: "NY",
      postalCode: "12207",
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "City", name: "New York" },
      { "@type": "Country", name: "United States" },
    ],
    knowsAbout: [
      "Venera",
      "Venera Studio",
      "Motion Design",
      "Motion Design Studio",
      "Launch Films",
      "Product Motion",
      "Brand Systems",
      "Performance Creative",
      "3D Design",
    ],
    sameAs: [...SITE_SAME_AS],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: STUDIO_EMAIL,
      url: `${SITE_URL}/contact`,
      availableLanguage: ["English"],
    },
  };
}

export function buildLogoJsonLd() {
  return {
    "@type": "ImageObject",
    "@id": LOGO_ID,
    url: LOGO_URL,
    contentUrl: LOGO_URL,
    caption: SITE_BRAND,
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE_BRAND,
    alternateName: [...SITE_BRAND_ALTERNATES],
    description: SITE_DESCRIPTION,
    inLanguage: "en-US",
    publisher: { "@id": ORG_ID },
    about: { "@id": ORG_ID },
  };
}

export function buildServiceJsonLd() {
  return {
    "@type": "Service",
    "@id": SERVICE_ID,
    name: SITE_SERVICE,
    serviceType: "Motion design",
    provider: { "@id": ORG_ID },
    areaServed: ["New York", "United States", "Remote"],
    description:
      "Launch films, product motion, brand systems, and performance creative for funded founders and startups. Direct studio engagement on every brief.",
    url: SITE_URL,
    brand: SITE_BRAND,
  };
}

export function buildHomePageJsonLd() {
  return {
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    primaryImageOfPage: { "@id": LOGO_ID },
    inLanguage: "en-US",
  };
}

/**
 * Full @graph payload injected in the root layout so Google can merge
 * Venera, Venera Studio, and venerastudio.com into one entity.
 */
export function buildRootBrandJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(),
      buildLogoJsonLd(),
      buildWebsiteJsonLd(),
      buildServiceJsonLd(),
    ],
  };
}
