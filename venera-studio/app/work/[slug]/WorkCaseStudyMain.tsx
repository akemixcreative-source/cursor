"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";

import { KickerText } from "@/components/KickerText";
import {
  getCaseStudyVideos,
  getWorkPeersExcept,
  isCraftStudySlug,
  shuffleProjects,
  type Project,
  type Styleframe,
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

function StyleframeStack({ frames }: { frames: readonly Styleframe[] }) {
  const [open, setOpen] = useState<Styleframe | null>(null);
  const titleId = "styleframes-heading";

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section className={styles.styleframes} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.styleframesLabel}>
        Styleframes
      </h2>
      <ol className={styles.styleframeList}>
        {frames.map((frame, index) => (
          <li key={frame.src} className={styles.styleframeBeat}>
            <div className={styles.styleframeCopy}>
              <p className={styles.styleframeBeatLabel}>{frame.label}</p>
              <h3 className={styles.styleframeBeatTitle}>{frame.title}</h3>
            </div>
            <button
              type="button"
              className={styles.styleframeButton}
              onClick={() => setOpen(frame)}
            >
              <img
                className={styles.styleframeImg}
                src={frame.src}
                alt={frame.alt}
                width={frame.width}
                height={frame.height}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </button>
          </li>
        ))}
      </ol>
      {open
        ? createPortal(
            <div
              className={styles.styleframeScrim}
              role="presentation"
              onClick={() => setOpen(null)}
            >
              <figure
                className={styles.styleframeWindow}
                role="dialog"
                aria-modal="true"
                aria-label={open.alt}
                onClick={(event) => event.stopPropagation()}
              >
                <img
                  className={styles.styleframeDialogImg}
                  src={open.src}
                  alt={open.alt}
                  width={open.width}
                  height={open.height}
                />
              </figure>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}

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

      {project.styleframes?.length ? (
        <StyleframeStack frames={project.styleframes} />
      ) : null}

      <CraftStudiesMore currentSlug={project.slug} />
    </>
  );
}
