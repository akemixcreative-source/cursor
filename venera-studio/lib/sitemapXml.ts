import { projects } from "@/data/projects";
import { SITE_URL } from "@/lib/site";

const ORIGIN = SITE_URL.replace(/\/$/, "");

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loc(path: string): string {
  if (path === "/") return ORIGIN;
  return `${ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Sitemap XML Google Search Console can fetch (no metadata wrapper). */
export function buildSitemapXml(lastmod = new Date().toISOString().slice(0, 10)): string {
  const urls = [
    { loc: loc("/"), changefreq: "weekly", priority: "1.0" },
    { loc: loc("/about"), changefreq: "monthly", priority: "0.8" },
    { loc: loc("/contact"), changefreq: "monthly", priority: "0.7" },
    ...projects.map((project, index) => ({
      loc: loc(`/work/${project.slug}`),
      changefreq: "monthly",
      priority: index === 0 ? "0.9" : "0.75",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}

export const SITEMAP_RESPONSE_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600, must-revalidate",
} as const;
