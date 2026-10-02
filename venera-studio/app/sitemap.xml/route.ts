import { buildSitemapXml, SITEMAP_RESPONSE_HEADERS } from "@/lib/sitemapXml";

export const dynamic = "force-static";

/** Plain XML sitemap — no Next metadata wrapper (Google Search Console fetch). */
export function GET() {
  return new Response(buildSitemapXml(), {
    status: 200,
    headers: SITEMAP_RESPONSE_HEADERS,
  });
}
