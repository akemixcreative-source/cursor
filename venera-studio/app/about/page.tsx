import type { Metadata } from "next";

import { CAL_BOOKING_URL } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

import { Reveal } from "@/components/Reveal/Reveal";

import styles from "@/app/about/about.module.css";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Venera is Ryan Thomas's solo motion design practice in New York—launch films, product storytelling, and performance creative for founders and brand teams.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Reveal>
      <article className={styles.section}>
      <header className={styles.heroGrid}>
        <h1 className={styles.headline}>
          <span className={styles.headlineLine}>About</span>
          <span className={styles.headlineLine}>Venera</span>
        </h1>

        <div className={styles.copyCol}>
          <p className={styles.paragraph}>
            Venera is a solo motion design practice in New York, run by Ryan
            Thomas. The work sits where launch films, product storytelling, and
            performance creative overlap—built for founders and brand teams who
            care how motion reads in the feed and on the homepage.
          </p>
          <p className={styles.paragraph}>
            Engagements are intentionally small-craft: one principal creative,
            clear timelines, and deliverables sized for real channels—not
            generic showreel fluff.
          </p>
        </div>

        <aside className={styles.metaCol}>
          <span className={styles.metaLine}>Ryan Thomas</span>
          <span className={styles.metaLine}>New York</span>
          <span className={styles.metaLine}>Motion &amp; creative direction</span>
        </aside>
      </header>

      <figure className={styles.mediaStrip}>
        <span className="visuallyHidden">
          Optional studio photograph or campaign still can be placed in this
          frame.
        </span>
        <div className={styles.mediaInner} aria-hidden="true" />
      </figure>

      <section className={styles.processSection} aria-labelledby="approach-label">
        <div className={styles.processGrid}>
          <p id="approach-label" className={styles.processLabel}>
            approach_
          </p>
          <p className={styles.processText}>
            Direction stays restrained and cinematic: negative space, deliberate
            pacing, and color that supports the product story. Motion is tuned
            for legibility at small sizes—because most people meet your work on
            a phone first.
          </p>
          <p className={styles.processText}>
            Collaboration runs through Figma for boards and UI plates, After
            Effects (and 3D where needed) for animation, and shared frames for
            review so feedback stays tied to specific beats—not vague rounds.
          </p>
        </div>

        <div className={styles.ctaRow}>
          <a
            className={styles.cta}
            href={CAL_BOOKING_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Book an intro on Cal.com (opens in a new tab)"
          >
            Book an intro
          </a>
        </div>
      </section>
      </article>
    </Reveal>
  );
}
