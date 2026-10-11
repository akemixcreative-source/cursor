import type { MetadataRoute } from "next";

import { projects } from "@/data/projects";
import { SITE_URL } from "@/lib/site";

const STATIC_PATHS = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.85, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries = STATIC_PATHS.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}${path === "/" ? "" : path}`,
      lastModified,
      changeFrequency,
      priority,
    }),
  );

  const projectEntries = projects.map((project) => ({
    url: `${SITE_URL}/work/${project.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...projectEntries];
}
