import fs from "fs";
import path from "path";

import matter from "gray-matter";

import type {
  CreditEntry,
  ProjectCategory,
  ProjectFrontmatter,
  ProjectRecord,
  StoryboardItem,
} from "@/lib/types";

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");

function isProjectCategory(value: unknown): value is ProjectCategory {
  return (
    value === "Brand Film" ||
    value === "Product Motion" ||
    value === "Performance Creative" ||
    value === "Concept" ||
    value === "Personal"
  );
}

function parseCredits(value: unknown): CreditEntry[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const out: CreditEntry[] = [];

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }

    const rec = entry as Record<string, unknown>;
    const name = typeof rec.name === "string" ? rec.name : "";
    const role = typeof rec.role === "string" ? rec.role : "";

    if (name.trim() || role.trim()) {
      out.push({ name: name.trim(), role: role.trim() });
    }
  }

  return out.length > 0 ? out : undefined;
}

function parseStoryboard(value: unknown): StoryboardItem[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const out: StoryboardItem[] = [];

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }

    const rec = entry as Record<string, unknown>;
    const src = typeof rec.src === "string" ? rec.src : "";
    const alt = typeof rec.alt === "string" ? rec.alt : "";

    if (src) {
      out.push({ src, alt });
    }
  }

  return out.length > 0 ? out : undefined;
}

function parseFrontmatter(data: Record<string, unknown>): ProjectFrontmatter {
  const title = typeof data.title === "string" ? data.title : "";
  const client = typeof data.client === "string" ? data.client : "";
  const year = typeof data.year === "number" ? data.year : 0;
  const role = Array.isArray(data.role)
    ? data.role.filter((r): r is string => typeof r === "string")
    : [];
  const heroVideo = typeof data.heroVideo === "string" ? data.heroVideo : "";
  const posterImage =
    typeof data.posterImage === "string" ? data.posterImage : "";
  const category = isProjectCategory(data.category) ? data.category : "Concept";
  const featured = Boolean(data.featured);
  const featuredRank =
    typeof data.featuredRank === "number" ? data.featuredRank : undefined;
  const tileImage =
    typeof data.tileImage === "string" ? data.tileImage : undefined;
  const tileGif =
    typeof data.tileGif === "string" ? data.tileGif : undefined;
  const tileTag = typeof data.tileTag === "string" ? data.tileTag : undefined;
  const tileCode =
    typeof data.tileCode === "string" ? data.tileCode : undefined;
  const introParagraphs = Array.isArray(data.introParagraphs)
    ? data.introParagraphs.filter((p): p is string => typeof p === "string")
    : undefined;
  const detailColumnLeft =
    typeof data.detailColumnLeft === "string"
      ? data.detailColumnLeft
      : undefined;
  const detailColumnRight =
    typeof data.detailColumnRight === "string"
      ? data.detailColumnRight
      : undefined;
  const storyboard = parseStoryboard(data.storyboard);
  const credits = parseCredits(data.credits);
  const storyboardHeading =
    typeof data.storyboardHeading === "string"
      ? data.storyboardHeading
      : undefined;

  return {
    title,
    client,
    year,
    role,
    heroVideo,
    posterImage,
    category,
    featured,
    featuredRank,
    tileImage,
    tileGif,
    tileTag,
    tileCode,
    introParagraphs,
    detailColumnLeft,
    detailColumnRight,
    storyboard,
    credits,
    storyboardHeading,
  };
}

export function getProjectSlugs(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getAllProjects(): ProjectRecord[] {
  const slugs = getProjectSlugs();
  const projects: ProjectRecord[] = [];

  for (const slug of slugs) {
    const project = getProjectBySlug(slug);
    if (project) {
      projects.push(project);
    }
  }

  return projects.sort((a, b) => b.year - a.year);
}

export function getFeaturedProjects(): ProjectRecord[] {
  const featured = getAllProjects().filter((p) => p.featured);

  return featured.sort((a, b) => {
    const ra = a.featuredRank ?? 999;
    const rb = b.featuredRank ?? 999;

    if (ra !== rb) {
      return ra - rb;
    }

    return b.year - a.year;
  });
}

export function getProjectBySlug(slug: string): ProjectRecord | null {
  const fullPath = path.join(PROJECTS_DIR, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const fm = parseFrontmatter(data as Record<string, unknown>);

  return {
    slug,
    body: content,
    ...fm,
  };
}
