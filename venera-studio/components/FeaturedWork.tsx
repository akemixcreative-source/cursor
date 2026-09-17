"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FeaturedCard } from "@/components/FeaturedCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { projects } from "@/data/projects";
import styles from "./FeaturedWork.module.css";

/**
 * FeaturedWork
 * Homepage featured strip: FEATURED chip + responsive grid. Below the
 * two-up breakpoint each tile is full width; from `1100px` up, projects are
 * laid out in pairs in `projects` order (first row: Appstack + Gemini,
 * second row: Nexus + Capsa).
 *
 * Client: after the grid mounts, `ScrollTrigger.refresh()` runs so every
 * tile’s reveal re-measures after media layout (order-safe vs hooks).
 */
export function FeaturedWork() {
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section id="work" className={styles.section} aria-label="Featured work">
      <ScrollReveal as="div" className={styles.head} distance={16}>
        <span className={styles.chip}>Featured</span>
      </ScrollReveal>

      <div className={styles.grid}>
        {projects.map((project, index) => (
          <ScrollReveal
            key={project.slug}
            className={styles.gridCell}
            distance={40}
            delay={index * 0.16}
          >
            <FeaturedCard project={project} showYear={false} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
