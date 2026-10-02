import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Production hosts that should not be indexed as separate sites. */
const ALIAS_HOSTS = new Set([
  "www.venerastudio.com",
  "venera-studio.vercel.app",
]);

const CANONICAL_HOST = "venerastudio.com";

/**
 * Collapse www + the production vercel.app alias onto the apex host so Google
 * does not treat them as duplicate properties (Search Console: “alternate
 * page with proper canonical”, “duplicate without user-selected canonical”).
 * Preview `*.vercel.app` URLs are left alone.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (!ALIAS_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|ingest/|sitemap\\.xml|robots\\.txt|llms\\.txt).*)",
  ],
};
