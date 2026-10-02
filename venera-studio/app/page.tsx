import type { Metadata } from "next";

import { Loader } from "@/components/Loader";
import { PageMeta } from "@/components/PageMeta";
import { PageMetaTaglineScramble } from "@/components/PageMetaTaglineScramble";
import { Nav } from "@/components/Nav";
import { HeroIntro } from "@/components/HeroIntro";
import { FeaturedWork } from "@/components/FeaturedWork";
import { Footer } from "@/components/Footer";
import { VeneraLogo } from "@/components/VeneraLogo";
import { getVideoAssetFallback } from "@/data/videoAssets";
import { buildHomePageJsonLd } from "@/lib/organizationJsonLd";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";

const HERO_INTRO_MP4 = getVideoAssetFallback("hero-intro-visual");

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const HOME_PAGE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [buildHomePageJsonLd()],
};

/**
 * Homepage composition.
 *
 * Document order:
 *  1. Loader   - intro overlay on hard loads of `/` (desktop + phone).
 *  2. PageMeta - sticky chrome (logo, live NYC + tagline, nav).
 *  3. HeroIntro - brand statement (headline + lead + CTA + square visual).
 *  4. FeaturedWork - FEATURED chip + project grid (two-up on wide viewports).
 *  5. Footer — meta grid, wordmark.
 *
 * HeroIntro square visual uses a local MP4 (preloaded below) — not Stream.
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(HOME_PAGE_JSON_LD),
        }}
      />
      <link
        rel="preload"
        href={HERO_INTRO_MP4}
        as="video"
        type="video/mp4"
        media="(min-width: 960px) and (prefers-reduced-motion: no-preference)"
        fetchPriority="high"
      />

      <Loader />

      <PageMeta
        mode="always"
        left={<VeneraLogo variant="nav" priority />}
        center={<PageMetaTaglineScramble metaMode="always" />}
        right={<Nav ariaLabel="Primary" />}
      />

      <main>
        <HeroIntro />
        <FeaturedWork />
      </main>
      <Footer />
    </>
  );
}
