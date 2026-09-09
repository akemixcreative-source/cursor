import styles from "@/components/HomeCta/HomeCta.module.css";

import { CAL_BOOKING_URL } from "@/lib/constants";

export function HomeCta() {
  return (
    <section className={styles.section} aria-labelledby="home-cta-heading">
      <div className={styles.inner}>
        <h2 id="home-cta-heading" className={styles.title}>
          Looking for a creative partner?
        </h2>
        <a
          className={styles.cta}
          href={CAL_BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Start a project — book an intro on Cal.com (opens in a new tab)"
        >
          Start a project
        </a>
      </div>
    </section>
  );
}
