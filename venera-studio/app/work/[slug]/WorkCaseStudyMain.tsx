"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { KickerText } from "@/components/KickerText";
import {
  getCaseStudyVideos,
  getWorkPeersExcept,
  isCraftStudySlug,
  shuffleProjects,
  type Project,
} from "@/data/projects";
import { VideoPlayer } from "./VideoPlayer";
import styles from "./page.module.css";

const easeEditorial: [number, number, number, number] = [0.22, 1, 0.36, 1];

const videoItem = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeEditorial },
  },
};

function CraftStudiesMore({ currentSlug }: { currentSlug: string }) {
  const [peers, setPeers] = useState<Project[]>([]);

  useEffect(() => {
    if (!isCraftStudySlug(currentSlug)) {
      setPeers([]);
      return;
    }
    setPeers(shuffleProjects(getWorkPeersExcept(currentSlug)));
  }, [currentSlug]);

  if (!isCraftStudySlug(currentSlug) || !peers.length) return null;

  return (
    <section
      className={styles.craftMore}
      aria-labelledby="craft-more-heading"
    >
      <h2 id="craft-more-heading" className={styles.craftMoreLabel}>
        More craft studies
      </h2>
      <ul className={styles.craftMoreList}>
        {peers.map((p) => (
          <li key={p.slug}>
            <Link href={`/work/${p.slug}`} className={styles.craftMoreLink}>
              {p.caseStudyTitle ?? p.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WorkCaseStudyMain({ project }: { project: Project }) {
  const reduce = useReducedMotion();
  const videos = getCaseStudyVideos(project);

  const instant = reduce
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 12 };

  const headlineTitle = project.caseStudyTitle ?? project.title;
  const ledeCopy = project.caseStudyLede ?? project.description;

  return (
    <>
      <motion.section
        id="work-header"
        className={styles.header}
        initial={instant}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 0.6, delay: 0.1, ease: easeEditorial }
        }
      >
        {project.caseStudyKicker ? (
          <p className={styles.headerKicker}>
            <KickerText
              text={project.caseStudyKicker}
              separatorClassName={styles.kickerSep}
            />
          </p>
        ) : null}
        <h1 className={styles.title}>
          <span className={styles.titleText}>{headlineTitle}</span>
          {project.mediaBadges?.length ? (
            <span className={styles.titleBadges}>
              {project.mediaBadges.map((badge) => (
                <img
                  key={badge.src}
                  className={styles.titleBadgeImg}
                  src={badge.src}
                  alt={badge.alt}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </span>
          ) : null}
        </h1>
        {project.caseStudySubtitle ? (
          <p className={styles.subtitle}>{project.caseStudySubtitle}</p>
        ) : null}
        <p className={styles.lede}>{ledeCopy}</p>
      </motion.section>

      <section id="work-videos" className={styles.videoStack} aria-label="Project films">
        {videos.map((video) => (
          <motion.div
            key={video.key}
            className={styles.videoItem}
            initial={reduce ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={videoItem}
          >
            <VideoPlayer videoKey={video.key} poster={video.poster ?? ""} />
          </motion.div>
        ))}
      </section>

      <CraftStudiesMore currentSlug={project.slug} />
    </>
  );
}
