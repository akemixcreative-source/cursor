"use client";

import { useState } from "react";

import styles from "@/components/CaseStudyVideo/CaseStudyVideo.module.css";

interface CaseStudyVideoProps {
  title: string;
  heroVideo: string;
  posterImage: string;
}

export function CaseStudyVideo({
  title,
  heroVideo,
  posterImage,
}: CaseStudyVideoProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section
      className={styles.section}
      aria-label={`Primary video for ${title}`}
    >
      <div className={styles.inner}>
        <div className={styles.frame}>
          {!videoFailed ? (
            <video
              className={styles.video}
              src={heroVideo}
              poster={posterImage}
              controls
              playsInline
              preload="metadata"
              aria-label={`Project film — ${title}`}
              onError={() => {
                setVideoFailed(true);
              }}
            />
          ) : (
            <div className={styles.placeholder}>
              Drop the hero MP4 at the path set in this project&apos;s MDX
              frontmatter to show the reel here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
