import type { MetadataRoute } from "next";

import { SITE_BRAND, SITE_DESCRIPTION, SITE_TITLE_SERVICE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_BRAND} | ${SITE_TITLE_SERVICE}`,
    short_name: SITE_BRAND,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "en",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
