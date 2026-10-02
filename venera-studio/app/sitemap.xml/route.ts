import { projects } from "@/data/projects";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Plain XML sitemap — no Next metadata wrapper (Google Search Console fetch). */
export function GET() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${SITE_URL}/about`, changefreq: "monthly", priority: "0.8" },
    { loc: `${SITE_URL}/contact`, changefreq: "monthly", priority: "0.7" },
    ...projects.map((project, index) => ({
      loc: `${SITE_URL}/work/${project.slug}`,
      changefreq: "monthly",
      priority: index === 0 ? "0.9" : "0.75",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
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

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
      "X-Robots-Tag": "noarchive",
    },
  });
}
