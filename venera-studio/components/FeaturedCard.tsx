"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useCursor } from "@/components/Cursor";
import { useAsciiScrambleTrigger } from "@/components/useAsciiScrambleTrigger";
import { KickerText } from "@/components/KickerText";
import type { Project } from "@/data/projects";
import { getFeaturedVideoKey } from "@/data/projects";
import { getVideoAssetPoster } from "@/data/videoAssets";
import { easeInOutQuint } from "@/lib/asciiScramble";
import { SecureVideo } from "@/components/SecureVideo";
import { VideoLightbox } from "@/components/VideoLightbox";
import styles from "./FeaturedCard.module.css";

const FEATURED_TAG_SCRAMBLE_MS = 1200;
const TAG_STAGGER_MS = 55;
/** Mount featured MP4s only near the viewport — avoid stacking large loops. */
const VIDEO_LOAD_ROOT_MARGIN = "40px 0px";
/** Pause decoding when scrolled away so multiple 20–100MB loops don’t stack. */
const VIDEO_PLAY_ROOT_MARGIN = "0px 0px";

function FeaturedTagPill({
  label,
  clusterGen,
  staggerMs,
}: {
  label: string;
  clusterGen: number;
  staggerMs: number;
}) {
  const [display, handlers, scramble] = useAsciiScrambleTrigger(
    label,
    FEATURED_TAG_SCRAMBLE_MS,
    easeInOutQuint,
  );

  useEffect(() => {
    if (clusterGen === 0) return;
    const id = window.setTimeout(() => {
      scramble();
    }, staggerMs);
    return () => clearTimeout(id);
  }, [clusterGen, staggerMs, scramble]);

  return (
    <span className={styles.tag} {...handlers}>
      {display}
    </span>
  );
}

/**
 * FeaturedCard
 * Wraps a single Project in a Link to /work/[slug]. Media auto-renders as
 * a looping muted video when the file extension matches a known video
 * format, otherwise as a poster image. Over the video frame only, the
 * custom cursor morphs into the cream "↳ VIEW" pill; copy and services keep
 * the default pointer. Ownership is scoped by `project.slug` so moving
 * between video tiles cannot clear the pill from the card you are already on.
 * On card hover the media shifts to grayscale (no zoom).
 */
export function FeaturedCard({
  project,
  showYear = true,
}: {
  project: Project;
  /** Homepage collage omits the year row (Smiling Wolf tag strip). */
  showYear?: boolean;
}) {
  const cursor = useCursor();
  const videoKey = getFeaturedVideoKey(project);
  const poster =
    project.mediaPosterUrl ||
    project.heroPosterUrl ||
    getVideoAssetPoster(videoKey);
  const isCinematic = project.aspectRatio >= 1.9;
  const zoom = project.mediaZoom ?? 1;
  const viewSourceId = project.slug;
  const tagRow = project.homepageServices ?? project.services;
  const mediaClassName = [
    styles.media,
    project.mediaObjectFit === "contain" ? styles.mediaContain : null,
  ]
    .filter(Boolean)
    .join(" ");

  /** Increment when pointer enters the media + meta cluster (re-triggers tag scramble). */
  const [clusterGen, setClusterGen] = useState(0);
  const [videoActive, setVideoActive] = useState(false);
  const [videoInView, setVideoInView] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mediaFrameRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const node = mediaFrameRef.current;
    if (!node || videoActive) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVideoActive(true);
        observer.disconnect();
      },
      { rootMargin: VIDEO_LOAD_ROOT_MARGIN, threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [videoActive]);

  useEffect(() => {
    const node = mediaFrameRef.current;
    if (!node || !videoActive) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        setVideoInView(visible);
        const video = videoElRef.current;
        if (!video) return;
        if (visible && !lightboxOpen) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: VIDEO_PLAY_ROOT_MARGIN, threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [lightboxOpen, videoActive]);

  useEffect(() => {
    if (!lightboxOpen) return;
    videoElRef.current?.pause();
  }, [lightboxOpen]);

  useEffect(
    () => () => {
      cursor.releaseFeaturedVideoView(viewSourceId);
    },
    [cursor.releaseFeaturedVideoView, viewSourceId],
  );

  const mediaFrameStyle: CSSProperties = {
    ...(!isCinematic ? { aspectRatio: project.aspectRatio } : {}),
    ...(zoom !== 1 ? ({ "--media-zoom": zoom } as CSSProperties) : {}),
  };

  return (
    <article className={styles.card}>
      <Link
        href={`/work/${project.slug}`}
        className={styles.link}
        aria-label={`View case study: ${project.title}`}
      >
        <div
          className={styles.mediaCluster}
          onPointerEnter={() => {
            setClusterGen((n) => n + 1);
          }}
        >
          <div
            ref={mediaFrameRef}
            className={`${styles.mediaFrame}${isCinematic ? ` ${styles.mediaCinematic}` : ""}`}
            style={
              Object.keys(mediaFrameStyle).length ? mediaFrameStyle : undefined
            }
            onPointerEnter={(e) => {
              if (e.pointerType === "touch") return;
              cursor.beginFeaturedVideoView(viewSourceId);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === "touch") return;
              cursor.releaseFeaturedVideoView(viewSourceId);
            }}
          >
            {videoActive ? (
              <SecureVideo
                videoKey={videoKey}
                videoRef={videoElRef}
                className={mediaClassName}
                poster={poster}
                autoPlay={videoInView && !lightboxOpen}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
              />
            ) : (
              <img
                className={mediaClassName}
                src={poster}
                alt=""
                loading="lazy"
                decoding="async"
                aria-hidden
              />
            )}
            <button
              type="button"
              className={styles.openFilm}
              aria-label={`Open film: ${project.title}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setLightboxOpen(true);
              }}
            />
            {project.mediaBadges?.length ? (
              <div className={styles.mediaBadges}>
                {project.mediaBadges.map((badge) => (
                  <img
                    key={badge.src}
                    className={styles.mediaBadge}
                    src={badge.src}
                    alt={badge.alt}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.meta}>
            {showYear ? (
              <span className={styles.year}>{project.year}</span>
            ) : null}
            {tagRow.map((tag, i) => (
              <FeaturedTagPill
                key={`${project.slug}-${tag}-${i}`}
                label={tag}
                clusterGen={clusterGen}
                staggerMs={i * TAG_STAGGER_MS}
              />
            ))}
          </div>
        </div>

        {project.homepageKicker ? (
          <p className={styles.homeKicker}>
            <KickerText
              text={project.homepageKicker}
              separatorClassName={styles.kickerSep}
            />
          </p>
        ) : null}
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.description}>{project.description}</p>
      </Link>
      {lightboxOpen ? (
        <VideoLightbox
          videoKey={videoKey}
          poster={poster}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </article>
  );
}
