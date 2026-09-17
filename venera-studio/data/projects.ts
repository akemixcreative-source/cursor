import type { VideoAssetKey } from "@/data/videoAssets";
import { getVideoAssetPoster } from "@/data/videoAssets";

/**
 * Featured project data. Drives `<FeaturedWork>` on the homepage and the
 * case-study route at /work/[slug]. Videos resolve through Cloudflare Stream
 * keys in `data/videoAssets.ts` (signed HLS in production).
 */

/** Homepage collage placement (12-column grid). */
export type FeaturedSlot = "collageLg" | "collageSm" | "collageFull";

/** Extra film on a case study page (hero uses `heroVideoKey`). */
export type CaseStudyVideo = {
  key: VideoAssetKey;
  poster?: string;
};

export type Project = {
  slug: string;
  /** Homepage / index card title. Use `caseStudyTitle` for a shorter work-page H1 when needed. */
  title: string;
  year: number;
  /** Sidebar year line (e.g. a range). Defaults to numeric `year`. */
  yearLabel?: string;
  /** Sidebar label for the year row (`Years` for ranges). Defaults to `Year`. */
  yearMetaLabel?: "Year" | "Years";
  services: readonly string[];
  collaborators: string;
  /** Sidebar label for the collaborators row (e.g. Client for self-initiated work). */
  collaboratorsMetaLabel?: "Collaborators" | "Client";
  /** Client site, linked from the sidebar. Set only for real, shipped clients. */
  clientUrl?: string;
  /** Motion role shown in the case study sidebar. */
  role?: string;
  /** Funding line shown in the case study sidebar when useful. */
  funding?: string;
  /** Location shown in the case study sidebar. */
  location?: string;
  /** Primary craft stack shown in the case study sidebar. */
  tools?: string;
  /** Craft and AI pipeline signal shown in the case study sidebar. */
  pipeline?: string;
  /** Two to four sentences of main narrative. */
  description: string;
  /** Stream asset key for the case-study hero film. */
  heroVideoKey: VideoAssetKey;
  heroPosterUrl: string;
  /** Stream asset key for the homepage featured tile (defaults to hero). */
  mediaVideoKey?: VideoAssetKey;
  /** Films after the hero on the work page. */
  additionalVideos?: readonly CaseStudyVideo[];
  /** Mono kicker above the work-page H1 (e.g. self-initiated). */
  caseStudyKicker?: string;
  /** Homepage featured tag row; defaults to `services`. */
  homepageServices?: readonly string[];
  /** Homepage featured mono line above the card title. */
  homepageKicker?: string;
  /** Mono meta line under the case study title (batch, year, craft mix). */
  caseStudySubtitle?: string;
  /** Work page H1 + nav chrome title when different from `title` (e.g. shorter case study head). */
  caseStudyTitle?: string;
  /** Work-page opening paragraph only; homepage cards keep `description`. */
  caseStudyLede?: string;
  /** Homepage featured still / poster path (not served as direct video). */
  mediaPosterUrl: string;
  aspectRatio: number;
  size?: "regular" | "full";
  featuredSlot?: FeaturedSlot;
  mediaZoom?: number;
  mediaObjectFit?: "cover" | "contain";
  mediaBadges?: readonly { src: string; alt: string }[];
  /** Custom `<title>` for SEO (defaults to case study title + brand). */
  seoTitle?: string;
  /** Custom meta description for SEO. */
  seoDescription?: string;
  /** Open Graph title (defaults to `seoTitle`). */
  ogTitle?: string;
  /** Open Graph description (defaults to `seoDescription`). */
  ogDescription?: string;
  /** OG / social image path under /public (1200×630 recommended). */
  ogImageUrl?: string;
  /** ISO date for VideoObject `uploadDate` in JSON-LD. */
  videoUploadDate?: string;
};

const projectCatalog: readonly Project[] = [
  {
    slug: "capsa-ai-series-a-announcement-film",
    title: "Capsa AI",
    caseStudyTitle: "Capsa AI",
    year: 2026,
    services: ["ANNOUNCEMENT", "3D", "PRODUCT MOTION"],
    homepageServices: ["ANNOUNCEMENT", "3D", "PRODUCT MOTION"],
    collaborators: "Capsa AI",
    clientUrl: "https://capsa.ai/",
    funding:
      "$18M Series A · TX Ventures & Pivot Investment Partners, with Bek Ventures",
    role: "Director, full production from concept through final delivery",
    location: "New York City",
    tools: "After Effects, Blender, DaVinci Resolve, Figma",
    description:
      "The Series A announcement for Capsa AI's $18M round, co-led by TX Ventures and Pivot Investment Partners. Founder-led capture, nineteen product motion scenes, and a custom 3D centerpiece built for launch day.",
    homepageKicker: "2026 · TX VENTURES & PIVOT INVESTMENT PARTNERS",
    caseStudyLede:
      "We conceived, produced, and delivered Capsa AI's $18M Series A announcement from end to end on a launch-week timeline.",
    seoTitle:
      "Capsa AI $18M Series A Announcement | Venera · Motion Design Services",
    seoDescription:
      "The Series A announcement film for Capsa AI's $18M round, co-led by TX Ventures and Pivot Investment Partners. Venera directed the founder capture, 19 product motion scenes, and custom 3D centerpiece. Coverage: Finextra, PYMNTS, FinTech Futures, Tech.eu.",
    ogTitle: "Capsa AI | $18M Series A Announcement",
    ogDescription:
      "Founder capture, 19 product motion scenes, and a custom 3D centerpiece, directed end to end by venera.",
    ogImageUrl: "/images/posters/capsa-announcement.jpg",
    videoUploadDate: "2026-06-09",
    heroVideoKey: "capsa-announcement",
    heroPosterUrl: "/images/posters/capsa-announcement.jpg",
    additionalVideos: [
      {
        key: "capsa-behind-the-scenes",
        poster: "/images/posters/capsa-behind-the-scenes.jpg",
      },
      {
        key: "capsa-product-film",
        poster: "/images/posters/capsa-product-film.jpg",
      },
    ],
    mediaPosterUrl: "/images/posters/capsa-announcement.jpg",
    aspectRatio: 21 / 9,
    featuredSlot: "collageFull",
  },
  {
    slug: "meta-rayban-oakley",
    title: "Meta Rayban × Oakley",
    year: 2025,
    services: ["EXPERIMENTAL", "BRAND FILM", "PRODUCT MOTION"],
    homepageServices: ["EXPERIMENTAL", "BRAND FILM"],
    collaboratorsMetaLabel: "Client",
    collaborators: "Self-initiated concept piece",
    role: "Concept, 3D, motion direction, compositing",
    tools: "Blender, After Effects, Octane",
    pipeline: "Fully hand-crafted · No generative AI",
    description:
      "A self-initiated concept film for the Meta × Ray-Ban × Oakley eyewear collaboration. The 3D and subtle motion were built in Blender and composited by hand, with no generative AI in the pipeline.",
    homepageKicker: "IN PROGRESS · SELF-INITIATED · HAND-MADE",
    caseStudyKicker: "IN PROGRESS · SELF-INITIATED · CRAFT STUDY · HAND-MADE",
    caseStudyLede:
      "A self-initiated concept film for the Meta × Ray-Ban × Oakley eyewear collaboration, built to test how far hand-crafted 3D and subtle motion could push a product story without using a single frame of generative AI.",
    heroVideoKey: "meta-rayban-hero",
    heroPosterUrl: "/images/posters/meta-rayban-hero.jpg",
    mediaPosterUrl: "/images/posters/meta-rayban-hero.jpg",
    aspectRatio: 21 / 9,
    featuredSlot: "collageFull",
  },
  {
    slug: "google-gemini",
    title: "Gemini",
    year: 2025,
    services: ["EXPERIMENTAL", "BRAND FILM", "PRODUCT MOTION"],
    homepageServices: ["EXPERIMENTAL", "BRAND FILM"],
    collaboratorsMetaLabel: "Client",
    collaborators: "Self-initiated concept piece",
    role: "Concept, motion direction, 3D, animation",
    tools: "Blender, After Effects, Octane",
    pipeline:
      "Blender-first craft · Octane look-dev · After Effects finish · Self-directed",
    description:
      "A self-initiated concept film exploring what a Gemini launch could look like. Built in Blender, it is a craft study in 3D, restraint, and cinematic product storytelling.",
    homepageKicker: "SELF-INITIATED · CRAFT STUDY",
    caseStudyKicker: "SELF-INITIATED · CRAFT STUDY",
    caseStudyLede:
      "A self-initiated concept film exploring what a Gemini launch could look like, built as a personal study in 3D motion, product storytelling, and cinematic pacing.",
    heroVideoKey: "gemini-hero",
    heroPosterUrl: "/images/posters/gemini-hero.jpg",
    mediaPosterUrl: "/images/posters/gemini-hero.jpg",
    aspectRatio: 21 / 9,
    featuredSlot: "collageFull",
  },
  {
    slug: "appstack",
    title: "Appstack",
    year: 2025,
    yearLabel: "2024 to 2025",
    services: ["PERFORMANCE", "PRODUCT MOTION", "BRAND FILM"],
    homepageKicker: "2025 TO 2026 · ENTREPRENEURS FIRST",
    collaborators: "Appstack",
    clientUrl: "https://www.appstack.tech/",
    funding: "Seed round · Blockchain Founders Capital (BFC) & industry angels",
    role: "Full-time motion partner, creative strategist",
    location: "Paris, France",
    tools: "After Effects, Figma, Premiere, Cinema/On-location production",
    description:
      "A paid-social system, website hero, fundraise film, and on-location production for Appstack, a privacy-first mobile attribution company backed by Entrepreneur First and Blockchain Founders Capital.",
    caseStudyLede:
      "The project that kick-started the studio. A one-off freelance gig became months embedded with the team in Paris, creating paid social at volume, a homepage hero, a seed-round film, and creative strategy alongside the founders.",
    heroVideoKey: "appstack-hero",
    heroPosterUrl: "/images/posters/appstack-hero.jpg",
    additionalVideos: [
      {
        key: "appstack-website-hero",
        poster: "/images/posters/appstack-website-hero.jpg",
      },
      {
        key: "appstack-fundraise",
        poster: "/images/posters/appstack-fundraise.jpg",
      },
    ],
    mediaPosterUrl: "/images/posters/appstack-hero.jpg",
    aspectRatio: 21 / 9,
    featuredSlot: "collageFull",
    /** Full-bleed in the cinematic frame (default cover); slight zoom if the file has encoded mattes. */
    mediaZoom: 1.06,
    mediaBadges: [
      { src: "/images/mockups/EF%20logo.avif", alt: "Entrepreneurs First" },
    ],
  },
  {
    slug: "nexus",
    title: "Nexus",
    caseStudyTitle: "Nexus",
    year: 2026,
    yearLabel: "2025 to 2026",
    yearMetaLabel: "Years",
    services: ["PRODUCT MOTION", "LAUNCH FILM", "BRAND FILM"],
    homepageServices: ["PRODUCT MOTION", "LAUNCH FILM"],
    collaboratorsMetaLabel: "Client",
    collaborators: "Nexus (Y Combinator F25)",
    clientUrl: "https://agent.nexus/",
    funding: "$4.7M seed, led by General Catalyst",
    role: "Motion partner for launch film, product motion, and brand systems",
    tools: "After Effects, Figma, Blender",
    description:
      "Motion partner for Nexus across their 2025 seed launch ($4.7M led by General Catalyst) and 2026 Cue launch. We built an in-app motion language and launch films for the YC-backed creator tool, then scaled the system across two years.",
    homepageKicker: "2025 TO 2026 · GENERAL CATALYST",
    caseStudyKicker: "ONGOING · 2025 TO 2026",
    caseStudyLede:
      "Motion partner for Nexus across two launches, from their 2025 seed launch ($4.7M led by General Catalyst) through their 2026 Cue launch. The work covers an in-app motion language, hero films, and a launch system built to scale with the company.",
    heroVideoKey: "nexus-seed",
    heroPosterUrl: "/images/posters/nexus-seed.jpg",
    additionalVideos: [
      { key: "nexus-cue", poster: "/images/posters/nexus-cue.jpg" },
    ],
    mediaPosterUrl: "/images/posters/nexus-seed.jpg",
    aspectRatio: 21 / 9,
    featuredSlot: "collageFull",
    mediaZoom: 1.12,
    mediaBadges: [
      { src: "/images/mockups/Y%20Comb%20logo.png", alt: "Y Combinator" },
    ],
  },
  {
    slug: "typography",
    title: "Typography in Motion",
    year: 2026,
    services: ["EXPERIMENTAL", "MOTION DESIGN"],
    collaboratorsMetaLabel: "Client",
    collaborators: "Self-initiated concept piece",
    role: "Concept, motion direction, editorial animation",
    tools: "After Effects",
    pipeline:
      "Editorial After Effects · Hand-timed match cuts · No generative AI",
    homepageKicker: "SELF-INITIATED · CRAFT STUDY",
    caseStudyKicker: "SELF-INITIATED · CRAFT STUDY",
    description:
      "A self-initiated study in fluid match cuts and typographic rhythm. One idea, escalating commitment: scale, weight, and silence doing the work instead of scene changes. Built as a portfolio flex and a discipline check on type habits.",
    heroVideoKey: "typography-hero",
    heroPosterUrl: "/images/posters/typography-hero.jpg",
    mediaPosterUrl: "/images/posters/typography-hero.jpg",
    aspectRatio: 21 / 9,
    featuredSlot: "collageFull",
  },
];

const FEATURED_PROJECT_ORDER = [
  "appstack",
  "google-gemini",
  "nexus",
  "capsa-ai-series-a-announcement-film",
  "meta-rayban-oakley",
  "typography",
] as const;

export const projects: readonly Project[] = FEATURED_PROJECT_ORDER.map(
  (slug) => {
    const project = projectCatalog.find((p) => p.slug === slug);
    if (!project) {
      throw new Error(`Missing featured project: ${slug}`);
    }
    return project;
  },
);

/** Self-initiated craft studies surfaced with shared sidebar + cross-links. */
export const CRAFT_STUDY_SLUGS = [
  "meta-rayban-oakley",
  "google-gemini",
  "typography",
] as const;

export type CraftStudySlug = (typeof CRAFT_STUDY_SLUGS)[number];

export function isCraftStudySlug(slug: string): slug is CraftStudySlug {
  return (CRAFT_STUDY_SLUGS as readonly string[]).includes(slug);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** Hero plus any additional films for the work page. */
export function getCaseStudyVideos(
  project: Project,
): readonly CaseStudyVideo[] {
  return [
    {
      key: project.heroVideoKey,
      poster:
        project.heroPosterUrl || getVideoAssetPoster(project.heroVideoKey),
    },
    ...(project.additionalVideos ?? []).map((video) => ({
      ...video,
      poster: video.poster || getVideoAssetPoster(video.key),
    })),
  ];
}

export function getFeaturedVideoKey(project: Project): VideoAssetKey {
  return project.mediaVideoKey ?? project.heroVideoKey;
}

export function getWorkPeersExcept(slug: string): Project[] {
  return projects.filter((p) => p.slug !== slug);
}

/** Fisher-Yates shuffle (mutates a copy). */
export function shuffleProjects<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
