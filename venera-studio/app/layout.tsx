import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

/** Case study “work” blocks — pair widely used for brutalist / tech portfolio mono + geometric display. */
const studyDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-study-display",
  weight: ["500", "600", "700"],
});

const studyMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-study-mono",
  weight: ["400", "700"],
});

import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import { MainFade } from "@/components/MainFade/MainFade";
import { SiteJsonLd } from "@/components/SiteJsonLd/SiteJsonLd";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider/SmoothScrollProvider";
import { getSiteMetadataBase } from "@/lib/metadataBase";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_OG_IMAGE_ALT,
} from "@/lib/seo";

import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteMetadataBase(),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [
      {
        url: SITE_OG_IMAGE,
        alt: SITE_OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${studyDisplay.variable} ${studyMono.variable}`}
    >
      <body>
        <SiteJsonLd />
        <SmoothScrollProvider>
          <Header />
          <MainFade>{children}</MainFade>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
