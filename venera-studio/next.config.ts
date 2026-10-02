import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Allow HMR / dev assets from localhost and LAN preview hosts. */
  allowedDevOrigins: ["127.0.0.1", "localhost", "::1", "192.168.1.167"],

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 100],
  },

  experimental: {
    optimizePackageImports: ["gsap"],
  },

  /** PostHog reverse proxy — reduces ad-blocker interference. */
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },

  /**
   * Canonical path shape for Google: no trailing slash on content routes,
   * `/work` is the homepage featured index (no empty 404).
   * `skipTrailingSlashRedirect` stays on so `/ingest/` is not rewritten.
   */
  async redirects() {
    return [
      { source: "/about/", destination: "/about", permanent: true },
      { source: "/contact/", destination: "/contact", permanent: true },
      { source: "/work", destination: "/", permanent: true },
      { source: "/work/", destination: "/", permanent: true },
      {
        source: "/work/:slug/",
        destination: "/work/:slug",
        permanent: true,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
