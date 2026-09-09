import type { Metadata } from "next";

import { Hero } from "@/components/Hero/Hero";
import { HeroIntro } from "@/components/Hero/HeroIntro";
import { HomeCta } from "@/components/HomeCta/HomeCta";
import { ProjectGrid } from "@/components/ProjectGrid/ProjectGrid";
import { Reveal } from "@/components/Reveal/Reveal";
import { Services } from "@/components/Services/Services";

import { getFeaturedProjects } from "@/lib/projects";
import { SITE_NAME } from "@/lib/seo";

import styles from "@/app/page.module.css";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <>
      <h1 className="visuallyHidden">{SITE_NAME}</h1>
      <Hero />
      <HeroIntro />
      <Services />
      <section className={styles.featured}>
        <div className={styles.shell}>
          <Reveal>
            <p className={styles.sectionLabel}>Selected Projects</p>
          </Reveal>
          {featured.length > 0 ? (
            <ProjectGrid projects={featured} />
          ) : (
            <Reveal>
              <p className={styles.empty}>
                Mark projects as featured in MDX frontmatter to show them here.
              </p>
            </Reveal>
          )}
        </div>
      </section>
      <Reveal delay={0.05}>
        <HomeCta />
      </Reveal>
    </>
  );
}
