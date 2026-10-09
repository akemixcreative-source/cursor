import type { Metadata } from "next";
import Link from "next/link";

import AboutApproach from "@/components/AboutApproach";
import { InnerPage } from "@/components/InnerPage";
import { Nav } from "@/components/Nav";
import { NycLiveClock } from "@/components/NycLiveClock";
import { PageMeta } from "@/components/PageMeta";
import { VeneraLogo } from "@/components/VeneraLogo";
import { ORG_ID, PERSON_ID } from "@/lib/organizationJsonLd";
import {
  SITE_BRAND,
  SITE_FOUNDER,
  SITE_TITLE_BRAND,
  SITE_TITLE_SERVICE,
  SITE_URL,
} from "@/lib/site";
import styles from "./page.module.css";

const ABOUT_DESCRIPTION = `${SITE_BRAND} is Ryan Thomas's New York motion design studio offering launch films, product motion, brand systems, and performance creative for funded startups. Founders work directly with Ryan on every brief.`;

const ABOUT_TITLE = `About ${SITE_FOUNDER} | ${SITE_TITLE_BRAND} ${SITE_TITLE_SERVICE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: ABOUT_TITLE },
  description: ABOUT_DESCRIPTION,
  authors: [{ name: SITE_FOUNDER, url: `${SITE_URL}/about` }],
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
 * About page JSON-LD: AboutPage tied to both the studio and Ryan Thomas.
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
      about: [{ "@id": ORG_ID }, { "@id": PERSON_ID }],
      mainEntity: { "@id": PERSON_ID },
      isPartOf: { "@id": `${SITE_URL}/#website` },
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
