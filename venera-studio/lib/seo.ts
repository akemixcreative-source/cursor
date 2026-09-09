import type { Metadata } from "next";

import { INSTAGRAM_URL } from "@/lib/constants";

/** Primary brand string used in titles and schema `name`. */
export const SITE_NAME = "Venera";

/** Legal / search alternate — helps disambiguate from unrelated "Venera Studio" apps. */
export const SITE_LEGAL_NAME = "Venera Studio";

export const SITE_DESCRIPTION =
  "Venera is Ryan Thomas's motion design studio in New York. Launch films, product storytelling, and performance creative for ambitious founders and brands at venerastudio.com.";

export const SITE_OG_IMAGE = "/images/hero.png";

export const SITE_OG_IMAGE_ALT =
  "Venera — motion design studio in New York by Ryan Thomas";

export function getInstagramSameAs(): string[] {
  const url = INSTAGRAM_URL.trim();
  if (
    !url ||
    url === "https://www.instagram.com/" ||
    url === "https://www.instagram.com"
  ) {
    return [];
  }
  return [url];
}

interface PageMetadataInput {
  title: string;
  description?: string;
  path: string;
}

/** Shared per-route metadata — title is templated in root layout as `%s | Venera`. */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
}: PageMetadataInput): Metadata {
  const resolvedTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url: path,
    },
    twitter: {
      title: resolvedTitle,
      description,
    },
  };
}
