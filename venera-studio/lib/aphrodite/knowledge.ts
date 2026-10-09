import fs from "node:fs";
import path from "node:path";

import { projects, type Project } from "@/data/projects";
import { STUDIO_BRIEF } from "@/lib/aphrodite/studioBrief";
import {
  SITE_BRAND,
  SITE_DESCRIPTION,
  SITE_SERVICE,
  SITE_TAGLINE,
} from "@/lib/site";
import {
  DISCOVERY_CALL_URL,
  STUDIO_ADDRESS,
  STUDIO_BEHANCE_URL,
  STUDIO_EMAIL,
  STUDIO_INSTAGRAM_URL,
} from "@/lib/studioContact";

/**
 * Strips MDX frontmatter and markdown syntax that only matters visually. The
 * model reads better prose than pipes and asterisks, and the tokens saved go
 * further as actual facts.
 */
function toPlainProse(mdx: string): string {
  return mdx
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^[-*]\s+/gm, "- ")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function readCaseStudyProse(slug: string): string | null {
  const filePath = path.join(process.cwd(), "content", "work", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return toPlainProse(fs.readFileSync(filePath, "utf8"));
}

function describeProject(project: Project): string {
  const lines = [
    `PROJECT: ${project.caseStudyTitle ?? project.title}`,
    `Page: /work/${project.slug}`,
    `Year: ${project.yearLabel ?? project.year}`,
    `${project.collaboratorsMetaLabel ?? "Collaborators"}: ${project.collaborators}`,
  ];

  if (project.clientUrl) lines.push(`Client site: ${project.clientUrl}`);
  if (project.funding) lines.push(`Funding: ${project.funding}`);
  if (project.role) lines.push(`Studio role: ${project.role}`);
  if (project.location) lines.push(`Location: ${project.location}`);
  if (project.tools) lines.push(`Tools: ${project.tools}`);
  if (project.pipeline) lines.push(`Pipeline: ${project.pipeline}`);
  lines.push(`Services: ${project.services.join(", ")}`);
  lines.push(`Summary: ${project.description}`);
  if (project.caseStudyLede) lines.push(`Detail: ${project.caseStudyLede}`);

  const prose = readCaseStudyProse(project.slug);
  if (prose) lines.push(`Case study page copy:\n${prose}`);

  return lines.join("\n");
}

let cached: string | null = null;

/**
 * Everything Aphrodite is allowed to know, as one block of text.
 *
 * The whole corpus is only a few thousand tokens, so it is sent in full on
 * every request. That is cheaper and far more reliable than retrieval at this
 * size, and it means an answer can never miss a fact that is on the site.
 */
export function buildStudioKnowledge(): string {
  if (cached) return cached;

  const studio = [
    `STUDIO: ${SITE_BRAND}`,
    `Offering: ${SITE_SERVICE}`,
    `Tagline: ${SITE_TAGLINE}`,
    `Positioning: ${SITE_DESCRIPTION}`,
    `Based: ${STUDIO_ADDRESS}`,
    `Email: ${STUDIO_EMAIL}`,
    `Discovery call booking: ${DISCOVERY_CALL_URL}`,
    `Instagram: ${STUDIO_INSTAGRAM_URL}`,
    `Behance: ${STUDIO_BEHANCE_URL}`,
    `Site pages: / (home), /about, /contact, and /work/<slug> per project.`,
  ].join("\n");

  cached = [
    studio,
    STUDIO_BRIEF,
    `PROJECTS (${projects.length} total, in the order shown on the homepage)`,
    ...projects.map(describeProject),
  ].join("\n\n---\n\n");

  return cached;
}
