"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import styles from "@/components/ProjectTile/ProjectTile.module.css";

import type { ProjectCategory } from "@/lib/types";

interface ProjectTileProps {
  slug: string;
  title: string;
  category: ProjectCategory;
  tileImage?: string;
  /** Hover GIF — add file under /public when ready; omitted or broken = cover only */
  tileGif?: string;
  tileTag: string;
  /** Editorial index code shown above the title (e.g. "V001"). */
  tileCode?: string;
}

/**
 * Tile media: optional static cover (`tileImage`), optional `tileGif` on hover,
 * else `/videos/{slug}-tile.mp4` with poster. GIF layer uses native img for animation.
 */
export function ProjectTile({
  slug,
  title,
  category,
  tileImage,
  tileGif,
  tileTag,
  tileCode,
}: ProjectTileProps) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const tileVideoSrc = `/videos/${slug}-tile.mp4`;
  const tilePosterSrc = `/images/posters/${slug}-poster.webp`;
  const useStill = Boolean(tileImage);

  useEffect(() => {
    if (useStill) {
      setNearViewport(true);
      return;
    }

    const el = rootRef.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [useStill]);

  return (
    <Link
      ref={rootRef}
      className={styles.tileLink}
      href={`/work/${slug}`}
      aria-label={`Open project: ${title}`}
    >
      <motion.div
        className={styles.media}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={styles.mediaInset}>
          {!nearViewport ? (
            <div className={styles.placeholderTitle} aria-hidden="true">
              {title}
            </div>
          ) : null}

          {nearViewport && useStill && tileImage ? (
            <div className={styles.mediaInner}>
              <TileCover
                coverSrc={tileImage}
                gifSrc={tileGif}
                title={title}
              />
            </div>
          ) : null}

          {nearViewport && !useStill && !videoFailed ? (
            <video
              className={styles.video}
              src={tileVideoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={tilePosterSrc}
              aria-label={`${title} motion preview`}
              onError={() => {
                setVideoFailed(true);
              }}
            />
          ) : null}

          {nearViewport && !useStill && videoFailed ? (
            <PosterOrFallback posterSrc={tilePosterSrc} title={title} />
          ) : null}
        </div>
      </motion.div>

      <div className={styles.body}>
        {tileCode ? <p className={styles.code}>{tileCode}</p> : null}
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.tag}>{tileTag}</span>
        </div>
        <span className="visuallyHidden">{category}</span>
      </div>
    </Link>
  );
}

interface TileCoverProps {
  coverSrc: string;
  gifSrc?: string;
  title: string;
}

function TileCover({ coverSrc, gifSrc, title }: TileCoverProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const [gifOk, setGifOk] = useState(Boolean(gifSrc));

  if (coverFailed) {
    return (
      <div className={styles.placeholderTitle} aria-hidden="true">
        {title}
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <Image
        className={styles.cover}
        src={coverSrc}
        alt=""
        width={1280}
        height={800}
        sizes="(max-width: 768px) 100vw, 50vw"
        onError={() => {
          setCoverFailed(true);
        }}
      />
      {gifSrc && gifOk ? (
        // eslint-disable-next-line @next/next/no-img-element -- animated GIF
        <img
          className={styles.gifLayer}
          src={gifSrc}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => {
            setGifOk(false);
          }}
        />
      ) : null}
    </div>
  );
}

interface PosterOrFallbackProps {
  posterSrc: string;
  title: string;
}

function PosterOrFallback({ posterSrc, title }: PosterOrFallbackProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <div className={styles.placeholderTitle} aria-hidden="true">
        {title}
      </div>
    );
  }

  return (
    <Image
      className={styles.video}
      src={posterSrc}
      alt=""
      width={1280}
      height={800}
      sizes="(max-width: 768px) 100vw, 50vw"
      onError={() => {
        setImageFailed(true);
      }}
    />
  );
}
