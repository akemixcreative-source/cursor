import styles from "@/components/ProjectGrid/ProjectGrid.module.css";

import { ProjectTile } from "@/components/ProjectTile/ProjectTile";
import { Reveal } from "@/components/Reveal/Reveal";

import type { ProjectCategory, ProjectRecord } from "@/lib/types";

interface ProjectGridProps {
  projects: ProjectRecord[];
}

function defaultTileTag(category: ProjectCategory, year: number): string {
  if (category === "Personal") {
    return `(Personal) ${year}`;
  }

  return `${year}`;
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <ul className={styles.grid}>
      {projects.map((project, index) => (
        <li key={project.slug} className={styles.item}>
          <Reveal delay={index * 0.07}>
            <ProjectTile
              slug={project.slug}
              title={project.title}
              category={project.category}
              tileImage={project.tileImage}
              tileGif={project.tileGif}
              tileTag={project.tileTag ?? defaultTileTag(project.category, project.year)}
              tileCode={project.tileCode}
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
