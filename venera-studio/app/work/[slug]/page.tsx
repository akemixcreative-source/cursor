import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

import { CaseStudyDetailColumns } from "@/components/CaseStudyDetailColumns/CaseStudyDetailColumns";
import { CaseStudyIntro } from "@/components/CaseStudyIntro/CaseStudyIntro";
import { CaseStudyVideo } from "@/components/CaseStudyVideo/CaseStudyVideo";
import { mdxComponents } from "@/components/MdxProse/mdxComponents";
import { StoryboardGrid } from "@/components/StoryboardGrid/StoryboardGrid";
import { Reveal } from "@/components/Reveal/Reveal";

import {
  getProjectBySlug,
  getProjectSlugs,
} from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

import styles from "@/app/work/[slug]/CaseStudy.module.css";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  return pageMetadata({
    title: project.title,
    description: `${project.title} — ${project.client} (${project.year}). Motion design case study from Venera, Ryan Thomas in New York.`,
    path: `/work/${slug}`,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const intro =
    project.introParagraphs && project.introParagraphs.length > 0
      ? project.introParagraphs
      : [
          `${project.title} — case study for ${project.client}.`,
          "Additional process notes and frames live below the hero film.",
        ];

  const storyboard = project.storyboard ?? [];
  const detailLeft = project.detailColumnLeft ?? "";
  const detailRight = project.detailColumnRight ?? "";
  const showMdx = project.body.trim().length > 0;

  return (
    <Reveal>
      <article className={styles.article}>
      <CaseStudyIntro
        title={project.title}
        client={project.client}
        year={project.year}
        introParagraphs={intro}
        credits={project.credits}
        roles={project.role}
      />

      <CaseStudyVideo
        title={project.title}
        heroVideo={project.heroVideo}
        posterImage={project.posterImage}
      />

      <CaseStudyDetailColumns left={detailLeft} right={detailRight} />

      <StoryboardGrid
        items={storyboard}
        heading={project.storyboardHeading}
      />

      {showMdx ? (
        <div className={styles.prose}>
          <MDXRemote source={project.body} components={mdxComponents} />
        </div>
      ) : null}
      </article>
    </Reveal>
  );
}
