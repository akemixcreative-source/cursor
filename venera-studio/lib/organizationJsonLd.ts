import {
  SITE_BRAND,
  SITE_BRAND_ALTERNATES,
  SITE_BRAND_LEGAL,
  SITE_DESCRIPTION,
  SITE_FOUNDER,
  SITE_SAME_AS,
  SITE_URL,
} from "@/lib/site";
import {
  STUDIO_ADDRESS_LINES,
  STUDIO_BEHANCE_URL,
  STUDIO_EMAIL,
  STUDIO_LINKEDIN_URL,
  STUDIO_X_URL,
} from "@/lib/studioContact";

/**
 * Shared knowledge-graph nodes for Venera + founder Ryan Thomas.
 *
 * Emitted from the root layout so every page ships Organization, Person, and
 * Service signals. Per-page JSON-LD should reference these `@id` values via
 * `{ "@id": ORG_ID }` / `{ "@id": PERSON_ID }` instead of redefining inline.
 */
export const ORG_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/#ryan-thomas`;
export const SERVICE_ID = `${SITE_URL}/#motion-design-services`;
export const LOGO_ID = `${SITE_URL}/#logo`;

const LOGO_URL = `${SITE_URL}/images/mockups/Logo/venera-logo.png`;
const SITE_SLOGAN = "Motion design for founders and startups";

export function buildPersonJsonLd() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_FOUNDER,
    givenName: "Ryan",
    familyName: "Thomas",
    gender: "Male",
    jobTitle: "Motion Designer and Creative Director",
    description:
      "Ryan Thomas is the founder of Venera, a New York motion design studio focused on launch films, product motion, and brand systems.",
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/images/about/studio-portrait.jpg`,
    worksFor: { "@id": ORG_ID },
    sameAs: [STUDIO_LINKEDIN_URL, STUDIO_BEHANCE_URL, STUDIO_X_URL],
  };
}

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
    slogan: SITE_SLOGAN,
    founder: { "@id": PERSON_ID },
    employee: { "@id": PERSON_ID },
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
      SITE_BRAND,
      SITE_BRAND_LEGAL,
      SITE_FOUNDER,
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
    "@id": `${SITE_URL}/#website`,
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
    name: "Motion Design Studio",
    serviceType: "Motion design",
    provider: { "@id": ORG_ID },
    areaServed: ["New York", "United States", "Remote"],
    description:
      "Launch films, product motion, brand systems, and performance creative for funded founders and startups. Direct studio engagement with Ryan Thomas on every brief.",
    url: SITE_URL,
    brand: SITE_BRAND,
  };
}

/**
 * Full @graph payload injected in the root layout. Nesting Organization +
 * Person + Service inside `@graph` lets Google merge them into one entity.
 */
export function buildRootBrandJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(),
      buildPersonJsonLd(),
      buildLogoJsonLd(),
      buildWebsiteJsonLd(),
      buildServiceJsonLd(),
    ],
  };
}
