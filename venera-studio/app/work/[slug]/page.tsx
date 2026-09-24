import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyLayout } from "@/components/CaseStudyLayout";
import { NycLiveClock } from "@/components/NycLiveClock";
import { PageMeta } from "@/components/PageMeta";
import { VeneraLogo } from "@/components/VeneraLogo";
import { getProject, projects } from "@/data/projects";
import { buildCaseStudyJsonLd } from "@/lib/caseStudyJsonLd";
import { SITE_BRAND, SITE_TITLE_BRAND, SITE_URL } from "@/lib/site";
import styles from "./page.module.css";
import { WorkCaseStudyMain } from "./WorkCaseStudyMain";

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Work" };
  const displayTitle = project.caseStudyTitle ?? project.title;
  const metaDescription = project.caseStudyLede ?? project.description;
  const title = project.seoTitle ?? `${displayTitle} | ${SITE_TITLE_BRAND}`;
  const description = project.seoDescription ?? metaDescription;
  const ogTitle = project.ogTitle ?? title;
  const ogDescription = project.ogDescription ?? description;
  const ogImages = project.ogImageUrl
    ? [{ url: project.ogImageUrl, width: 1200, height: 630, alt: displayTitle }]
    : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "article",
      url: `/work/${slug}`,
      siteName: SITE_BRAND,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: project.ogImageUrl ? [project.ogImageUrl] : undefined,
    },
  };
}

export default async function WorkCaseStudyPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const displayTitle = project.caseStudyTitle ?? project.title;

  const caseStudyJsonLd = buildCaseStudyJsonLd(project);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(caseStudyJsonLd),
        }}
      />

      <PageMeta
        mode="always"
        ariaLabel="Case study"
        left={
          <Link href="/" className={styles.chromeLogo} aria-label="Home">
            <VeneraLogo variant="nav" />
          </Link>
        }
        center={
          <div className={styles.chromeMetaCenter}>
            <NycLiveClock />
            <span className={styles.chromeTitle} title={displayTitle}>
              {displayTitle}
            </span>
          </div>
        }
        right={
          <Link href="/#work" className={styles.chromeLink}>
            Index
          </Link>
        }
      />

      <main>
        <CaseStudyLayout
          project={project}
          main={<WorkCaseStudyMain project={project} />}
        />
      </main>
    </>
  );
}
