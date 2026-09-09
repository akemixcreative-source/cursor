import type { MetadataRoute } from "next";

import { getSiteMetadataBase } from "@/lib/metadataBase";

export default function robots(): MetadataRoute.Robots {
  const { origin } = getSiteMetadataBase();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
