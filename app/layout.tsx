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
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider/SmoothScrollProvider";
import { getSiteMetadataBase } from "@/lib/metadataBase";

import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteMetadataBase(),
  title: {
    default: "Venera Studio · Motion design for ambitious teams",
    template: "%s · Venera Studio",
  },
  description:
    "Premium motion design from New York—launch films, product storytelling, and performance creative for founders and brand teams.",
  openGraph: {
    type: "website",
    locale: "en_US",
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
        <SmoothScrollProvider>
          <Header />
          <MainFade>{children}</MainFade>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
