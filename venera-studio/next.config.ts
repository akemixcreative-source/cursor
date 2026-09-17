import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Allow HMR / dev assets when opening the site from your LAN IP on a phone. */
  allowedDevOrigins: ["192.168.1.167"],

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
