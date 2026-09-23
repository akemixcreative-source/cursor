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
  SITE_SERVICE,
  SITE_TITLE,
  SITE_TITLE_BRAND,
  SITE_URL,
} from "@/lib/site";

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

const DEFAULT_TITLE = SITE_TITLE;

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_TITLE_BRAND}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_BRAND,
  authors: [{ name: SITE_BRAND }],
  creator: SITE_BRAND,
  publisher: SITE_BRAND,
  keywords: [
    SITE_BRAND,
    "venera studio",
    SITE_SERVICE,
    "motion design",
    "motion design studio",
    "New York motion design",
    "launch films",
    "product motion",
    "brand systems",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_BRAND,
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    creator: "@veneracreative",
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
