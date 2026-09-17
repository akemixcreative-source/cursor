import { VeneraLogo } from "@/components/VeneraLogo";
import { SITE_BRAND, SITE_SERVICE } from "@/lib/site";
import {
  gmailComposeUrl,
  STUDIO_ADDRESS_LINES,
  STUDIO_BEHANCE_URL,
  STUDIO_EMAIL,
  STUDIO_INSTAGRAM_URL,
} from "@/lib/studioContact";
import styles from "./Footer.module.css";

/**
 * Site footer — studio meta, wordmark.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.inner}>
        <div className={styles.metaGrid}>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>New business</span>
            <p className={styles.metaValue}>
              <a
                href={gmailComposeUrl()}
                target="_blank"
                rel="noreferrer noopener"
              >
                {STUDIO_EMAIL}
              </a>
            </p>
          </div>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Studio</span>
            <p className={styles.metaValue}>
              Remote-first · ET / PT friendly
            </p>
          </div>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Social</span>
            <p className={styles.metaValue}>
              <a
                href={STUDIO_INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                Instagram
              </a>
              <span className={styles.socialSep} aria-hidden>
                {" "}
                ·{" "}
              </span>
              <a
                href={STUDIO_BEHANCE_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                Behance
              </a>
              <span className={styles.socialSep} aria-hidden>
                {" "}
                ·{" "}
              </span>
              <a
                href="https://x.com/veneracreative"
                target="_blank"
                rel="noreferrer noopener"
              >
                X
              </a>
            </p>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.wordmarkColumn}>
            <VeneraLogo variant="footer" />
          </div>
          <div className={styles.bottomMeta}>
            <address className={styles.address}>
              {STUDIO_ADDRESS_LINES.map((line) => (
                <span key={line} className={styles.addressLine}>
                  {line}
                </span>
              ))}
            </address>
            <p className={styles.copy}>
              © {year} {SITE_BRAND}. {SITE_SERVICE}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
