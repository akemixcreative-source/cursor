import styles from "@/components/Footer/Footer.module.css";

import { CAL_BOOKING_URL } from "@/lib/constants";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.meta}>Venera Studio · New York · {year}</p>
        <div className={styles.links}>
          {CONTACT_EMAIL ? (
            <a
              className={styles.link}
              href={`mailto:${CONTACT_EMAIL}`}
              aria-label={`Email ${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
          ) : null}
          <a
            className={styles.link}
            href={CAL_BOOKING_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Book a discovery call (opens in a new tab)"
          >
            Book a call
          </a>
        </div>
      </div>
    </footer>
  );
}
