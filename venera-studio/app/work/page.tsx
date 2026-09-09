import type { Metadata } from "next";

import { ProjectGrid } from "@/components/ProjectGrid/ProjectGrid";
import { Reveal } from "@/components/Reveal/Reveal";
import { SectionHeading } from "@/components/SectionHeading/SectionHeading";

import { getAllProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

import styles from "@/app/work/workPage.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description:
    "Selected launch films, product motion, and performance creative case studies from Venera—Ryan Thomas's motion design studio in New York.",
  path: "/work",
});

export default function WorkIndexPage() {
  const projects = getAllProjects();

  return (
    <Reveal>
      <section className={styles.section}>
        <h1 className="visuallyHidden">Projects</h1>
        <div className={styles.shell}>
          <SectionHeading
            eyebrow="Projects"
            title="Selected case studies and launch films"
            description="Each tile opens a full case page with the hero film, narrative beats, and a responsive storyboard grid. Add a new MDX file under /content/projects to ship another story."
          />
          <ProjectGrid projects={projects} />
        </div>
      </section>
    </Reveal>
  );
}
