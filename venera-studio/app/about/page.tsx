import type { Metadata } from "next";
import Link from "next/link";

import AboutApproach from "@/components/AboutApproach";
import { InnerPage } from "@/components/InnerPage";
import { Nav } from "@/components/Nav";
import { NycLiveClock } from "@/components/NycLiveClock";
import { PageMeta } from "@/components/PageMeta";
import { VeneraLogo } from "@/components/VeneraLogo";
import { ORG_ID, SERVICE_ID } from "@/lib/organizationJsonLd";
import {
  SITE_BRAND,
  SITE_SERVICE,
  SITE_TITLE_BRAND,
  SITE_TITLE_SERVICE,
  SITE_URL,
} from "@/lib/site";
import styles from "./page.module.css";

const ABOUT_DESCRIPTION = `${SITE_BRAND} is a New York motion design studio offering launch films, product motion, brand systems, and performance creative for funded startups. Founders work directly with the studio on every brief.`;

const ABOUT_TITLE = `About ${SITE_TITLE_BRAND} | ${SITE_TITLE_SERVICE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: ABOUT_TITLE },
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    type: "website",
    url: "/about",
    siteName: SITE_BRAND,
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
  },
};

/**
 * About page JSON-LD: studio AboutPage + Motion Design Service.
 * Both reference the Organization declared globally in the root layout.
 */
const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#page`,
      url: `${SITE_URL}/about`,
      name: ABOUT_TITLE,
      description: ABOUT_DESCRIPTION,
      about: { "@id": ORG_ID },
      mainEntity: { "@id": ORG_ID },
      isPartOf: { "@id": ORG_ID },
    },
    {
      "@type": "Service",
      "@id": SERVICE_ID,
      name: SITE_SERVICE,
      serviceType: SITE_SERVICE,
      provider: { "@id": ORG_ID },
      areaServed: ["New York", "United States", "Remote"],
      description:
        "Launch films, product motion, and brand systems for funded founders. Direct studio engagement on every brief.",
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutPageJsonLd),
        }}
      />

      <PageMeta
        mode="always"
        left={
          <Link href="/" className={styles.chromeLogo} aria-label="Home">
            <VeneraLogo variant="nav" priority />
          </Link>
        }
        center={<NycLiveClock />}
        right={<Nav ariaLabel="Primary" />}
      />

      <InnerPage showBack={false} wide>
        <AboutApproach />
      </InnerPage>
    </>
  );
}
