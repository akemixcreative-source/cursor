import type { ReactNode } from "react";
import type { Project } from "@/data/projects";
import styles from "./CaseStudyLayout.module.css";

type CaseStudyLayoutProps = {
  project: Project;
  main: ReactNode;
};

/**
 * Case study shell: fixed left metadata + main column centered in the
 * viewport (desktop). Nav chrome lives in the page.
 */
export function CaseStudyLayout({ project, main }: CaseStudyLayoutProps) {
  const yearDisplay = project.yearLabel ?? String(project.year);

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar} aria-label="Project metadata">
        <div className={styles.metaBlock}>
          <span className={styles.metaLabel}>
            {project.yearMetaLabel ?? "Year"}
          </span>
          <p className={styles.metaBody}>{yearDisplay}</p>
        </div>

        <div className={styles.metaBlock}>
          <span className={styles.metaLabel}>Services</span>
          <div className={styles.tagList}>
            {project.services.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {project.collaborators ? (
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>
              {project.collaboratorsMetaLabel ?? "Collaborators"}
            </span>
            <p className={styles.metaBody}>
              {project.clientUrl ? (
                <a
                  href={project.clientUrl}
                  className={styles.clientLink}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {project.collaborators}
                </a>
              ) : (
                project.collaborators
              )}
            </p>
          </div>
        ) : null}

        {project.funding ? (
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Funding</span>
            <p className={styles.metaBody}>{project.funding}</p>
          </div>
        ) : null}

        {project.role ? (
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Role</span>
            <p className={styles.metaBody}>{project.role}</p>
          </div>
        ) : null}

        {project.location ? (
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Location</span>
            <p className={styles.metaBody}>{project.location}</p>
          </div>
        ) : null}

        {project.tools ? (
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Tools</span>
            <p className={styles.metaBody}>{project.tools}</p>
          </div>
        ) : null}

        {project.pipeline ? (
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Pipeline</span>
            <p className={styles.metaBody}>{project.pipeline}</p>
          </div>
        ) : null}
      </aside>

      <article className={styles.mainColumn}>{main}</article>
    </div>
  );
}
