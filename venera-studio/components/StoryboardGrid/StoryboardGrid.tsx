"use client";

import Image from "next/image";
import { useState } from "react";

import styles from "@/components/StoryboardGrid/StoryboardGrid.module.css";

import type { StoryboardItem } from "@/lib/types";

interface StoryboardGridProps {
  items: StoryboardItem[];
  /** Gallery label — pill above the grid (Jam3-style “STYLE FRAME”). */
  heading?: string;
}

/**
 * Storyboard / process frames. `unoptimized` keeps animated GIFs working.
 */
export function StoryboardGrid({
  items,
  heading = "STYLE FRAME",
}: StoryboardGridProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label="Storyboard and process frames">
      <div className={styles.inner}>
        <h2 className={styles.label}>{heading}</h2>
        <ul className={styles.grid}>
          {items.map((item, index) => (
            <li key={`${item.src}-${index}`} className={styles.cell}>
              <StoryboardCell item={item} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface StoryboardCellProps {
  item: StoryboardItem;
  index: number;
}

function StoryboardCell({ item, index }: StoryboardCellProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={styles.frame}>
      {!failed ? (
        <Image
          className={styles.media}
          src={item.src}
          alt={item.alt || `Storyboard frame ${index + 1}`}
          fill
          sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, 33vw"
          unoptimized
          loading="lazy"
          onError={() => {
            setFailed(true);
          }}
        />
      ) : (
        <div className={styles.fallback}>
          Missing file: {item.src}
        </div>
      )}
    </div>
  );
}
