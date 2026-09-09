const FALLBACK_SITE = "http://localhost:3000";

/**
 * Resolves a valid absolute URL for `metadataBase`.
 * Malformed or protocol-less `NEXT_PUBLIC_SITE_URL` values would otherwise
 * throw in `new URL()` and take down every route with a 500.
 */
export function getSiteMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return new URL(FALLBACK_SITE);
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw)
    ? raw
    : `https://${raw}`;

  try {
    return new URL(withProtocol);
  } catch {
    return new URL(FALLBACK_SITE);
  }
}
