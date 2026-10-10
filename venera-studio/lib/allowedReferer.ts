/**
 * Hosts allowed to call the site's own API routes. Shared by every route that
 * should only answer requests coming from this site, so the allowlist has one
 * definition rather than one per endpoint.
 */
export function isAllowedSiteReferer(referer: string | null): boolean {
  if (!referer) return process.env.NODE_ENV !== "production";
  try {
    const { hostname } = new URL(referer);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (
      hostname === "venerastudio.com" ||
      hostname.endsWith(".venerastudio.com")
    ) {
      return true;
    }
    if (hostname.endsWith(".vercel.app")) return true;
    return false;
  } catch {
    return false;
  }
}
