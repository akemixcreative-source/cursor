import type { Project } from "@/data/projects";

import { getVideoAssetPoster } from "@/data/videoAssets";
import { ORG_ID } from "@/lib/organizationJsonLd";
import { SITE_BRAND, SITE_URL } from "@/lib/site";

function toAbsoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

/** Google requires ISO 8601 datetimes with a timezone for VideoObject.uploadDate. */
function formatVideoUploadDate(project: Project): string {
  const raw = project.videoUploadDate ?? `${project.year}-01-01`;
  if (/[zZ]$/.test(raw) || /[+-]\d{2}:\d{2}$/.test(raw)) return raw;
  if (raw.includes("T")) return `${raw}Z`;
  return `${raw}T00:00:00Z`;
}

function resolveThumbnailUrl(project: Project): string {
  const posterPath =
    project.ogImageUrl ||
    project.heroPosterUrl ||
    getVideoAssetPoster(project.heroVideoKey);
  return toAbsoluteUrl(posterPath);
}

/**
 * JSON-LD for work pages: CreativeWork with nested VideoObject for rich
 * results. Creator / publisher / producer reference the shared `venera`
 * Organization node emitted from the root layout — studio-attributed, no
 * personal Person nodes.
 */
export function buildCaseStudyJsonLd(project: Project) {
  const pageUrl = `${SITE_URL}/work/${project.slug}`;
  const displayTitle = project.caseStudyTitle ?? project.title;
  const description =
    project.seoDescription ?? project.caseStudyLede ?? project.description;
  const thumbnailUrl = resolveThumbnailUrl(project);
  const uploadDate = formatVideoUploadDate(project);
  const orgRef = { "@id": ORG_ID, "@type": "Organization", name: SITE_BRAND };

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${pageUrl}#work`,
    name: displayTitle,
    description,
    url: pageUrl,
    datePublished: `${project.year}`,
    creator: orgRef,
    author: orgRef,
    publisher: orgRef,
    producer: orgRef,
    video: {
      "@type": "VideoObject",
      name: displayTitle,
      description,
      embedUrl: pageUrl,
      contentUrl: pageUrl,
      thumbnailUrl,
      uploadDate,
      director: orgRef,
      publisher: orgRef,
    },
  };
}
