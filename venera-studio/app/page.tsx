import { Loader } from "@/components/Loader";
import { PageMeta } from "@/components/PageMeta";
import { PageMetaTaglineScramble } from "@/components/PageMetaTaglineScramble";
import { Nav } from "@/components/Nav";
import { HeroIntro } from "@/components/HeroIntro";
import { FeaturedWork } from "@/components/FeaturedWork";
import { Footer } from "@/components/Footer";
import { VeneraLogo } from "@/components/VeneraLogo";
import { getVideoAssetFallback } from "@/data/videoAssets";

const HERO_INTRO_MP4 = getVideoAssetFallback("hero-intro-visual");

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
      <link
        rel="preload"
        href={HERO_INTRO_MP4}
        as="video"
        type="video/mp4"
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
