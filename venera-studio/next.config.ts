import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Allow HMR / dev assets from localhost and LAN preview hosts. */
  allowedDevOrigins: ["127.0.0.1", "localhost", "::1", "192.168.1.167"],

  images: {
    formats: ["image/avif", "image/webp"],
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
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
