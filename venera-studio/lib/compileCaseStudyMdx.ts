import fs from "node:fs";
import path from "node:path";

import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";

import { getCaseStudyMdxComponents } from "@/components/case-study/mdxComponents";
import { getProject } from "@/data/projects";

export type WorkMdxFrontmatter = Record<string, unknown>;

/**
 * Loads `content/work/{slug}.mdx` and compiles MDX for RSC. Returns `null` if
 * the slug is unknown or the file is missing.
 */
export async function compileCaseStudyBody(
  slug: string,
): Promise<ReactElement | null> {
  if (!getProject(slug)) return null;

  const filePath = path.join(
    process.cwd(),
    "content",
    "work",
    `${slug}.mdx`,
  );
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf8");

  const { content } = await compileMDX<WorkMdxFrontmatter>({
    source,
    options: { parseFrontmatter: true },
    components: getCaseStudyMdxComponents(),
  });

  return content;
}
