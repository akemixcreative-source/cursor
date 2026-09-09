import {
  SITE_DESCRIPTION,
  SITE_LEGAL_NAME,
  SITE_NAME,
  getInstagramSameAs,
} from "@/lib/seo";
import { getSiteMetadataBase } from "@/lib/metadataBase";

export function SiteJsonLd() {
  const base = getSiteMetadataBase();
  const origin = base.origin;
  const sameAs = getInstagramSameAs();

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: SITE_NAME,
        alternateName: SITE_LEGAL_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en-US",
        publisher: { "@id": `${origin}/#organization` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${origin}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_LEGAL_NAME,
        url: origin,
        description: SITE_DESCRIPTION,
        founder: {
          "@type": "Person",
          name: "Ryan Thomas",
          jobTitle: "Motion designer and creative director",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "New York",
          addressRegion: "NY",
          addressCountry: "US",
        },
        areaServed: "Worldwide",
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
