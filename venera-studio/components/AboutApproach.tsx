import Image from "next/image";
import Link from "next/link";

import styles from "./AboutApproach.module.css";

/**
 * About differentiator: founder identity, approach copy, closing stamp, CTA.
 * Accent flame on “START A PROJECT” link only.
 */
export default function AboutApproach() {
  return (
    <section className={styles.section} aria-labelledby="about-approach">
      <div className={styles.approachGrid}>
        <figure className={styles.portraitFrame}>
          <Image
            src="/images/about/studio-portrait.jpg"
            alt="Ryan Thomas, founder of Venera motion design studio"
            fill
            priority
            sizes="(min-width: 900px) 42vw, 100vw"
            className={styles.portrait}
          />
        </figure>

        <div className={styles.content}>
          <p className={styles.founderLabel}>Ryan Thomas</p>
          <h1 className={styles.sectionHeadline} id="about-approach">
            Venera is Ryan Thomas&apos;s motion design studio.
          </h1>
          <p className={styles.prose}>
            Most studios put a producer between the founder and the craft.
            Feedback travels through three people before it reaches the editor.
            By the time it lands, half the intent is gone. The output suffers
            and nobody can quite say why.
          </p>
          <p className={styles.prose}>
            Ryan Thomas runs Venera as a New York motion design studio without
            those layers. Founders work directly with him on launch films,
            product motion, and brand systems. The person briefed is the person
            directing, cutting, and shipping the work. Decisions happen in one
            conversation, not three.
          </p>
          <p className={styles.prose}>
            The line between intent and execution stays straight. The work ships
            faster. The craft holds up because nothing was diluted on the way
            through. It is not a model that scales to a hundred clients. It is a
            model that scales to the right ones.
          </p>
        </div>
      </div>

      <p className={styles.closingStamp}>
        SELECTIVE BY DESIGN. A SMALL NUMBER OF CLIENTS EACH QUARTER.
      </p>

      <div className={styles.ctaWrap}>
        <Link href="/contact" className={styles.cta}>
          START A PROJECT
          <span className={styles.ctaArrow} aria-hidden>
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
