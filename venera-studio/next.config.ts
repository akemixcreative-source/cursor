import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Allow HMR / dev assets when opening the site from your LAN IP on a phone. */
  allowedDevOrigins: ["192.168.1.167"],

  /**
   * The Aphrodite route reads case study MDX at request time to build its
   * knowledge base. File tracing cannot see that path, so include it explicitly
   * or the deployed function ships without the content.
   */
  outputFileTracingIncludes: {
    "/api/aphrodite": ["./content/work/**/*.mdx"],
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
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
