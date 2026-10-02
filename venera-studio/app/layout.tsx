import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/styles/globals.css";
import { BodyScrollRestore } from "@/components/BodyScrollRestore";
import { ScrollManager } from "@/components/ScrollManager";
import { GrainOverlay } from "@/components/GrainOverlay";
import { CursorProvider } from "@/components/Cursor";
import { ScrollLineIndicator } from "@/components/ScrollLineIndicator";
import { ScrollCue } from "@/components/ScrollCue";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";
import { PostHogPageView } from "@/components/PostHogPageView";
import { buildRootBrandJsonLd } from "@/lib/organizationJsonLd";
import {
  SITE_BRAND,
  SITE_DESCRIPTION,
  SITE_OG_IMAGE_ALT,
  SITE_TITLE,
  SITE_TITLE_BRAND,
  SITE_URL,
} from "@/lib/site";
import { STUDIO_X_HANDLE } from "@/lib/studioContact";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE_BRAND}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_BRAND,
  authors: [{ name: SITE_BRAND, url: SITE_URL }],
  creator: SITE_BRAND,
  publisher: SITE_BRAND,
  category: "Motion Design",
  keywords: [
    "Venera",
    "Venera Studio",
    "Venera motion",
    "Venera motion design",
    "venerastudio",
    "New York motion design studio",
    "launch films",
    "product motion",
    "brand systems",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_BRAND,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_OG_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: STUDIO_X_HANDLE,
    site: STUDIO_X_HANDLE,
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};

const ROOT_BRAND_JSON_LD = buildRootBrandJsonLd();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ROOT_BRAND_JSON_LD),
          }}
        />
        <BodyScrollRestore />
        <CursorProvider>
          <ScrollManager>{children}</ScrollManager>
          <ScrollLineIndicator />
          <ScrollCue />
          <GrainOverlay />
        </CursorProvider>
        <SpeedInsights />
        <Analytics />
        <MicrosoftClarity />
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
      </body>
    </html>
  );
}
