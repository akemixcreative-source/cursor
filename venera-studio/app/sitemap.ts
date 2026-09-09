import type { MetadataRoute } from "next";

import { getSiteMetadataBase } from "@/lib/metadataBase";
import { getProjectSlugs } from "@/lib/projects";

const STATIC_PATHS = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/work", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/inquiry", priority: 0.85, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/imprint", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const { origin } = getSiteMetadataBase();
  const lastModified = new Date();

  const staticEntries = STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${origin}${path || "/"}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  const projectEntries = getProjectSlugs().map((slug) => ({
    url: `${origin}/work/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...projectEntries];
}
