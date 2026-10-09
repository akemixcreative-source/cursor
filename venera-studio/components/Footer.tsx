import {
  BehanceIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/SocialIcons";
import { VeneraLogo } from "@/components/VeneraLogo";
import { SITE_BRAND, SITE_SERVICE } from "@/lib/site";
import {
  gmailComposeUrl,
  STUDIO_ADDRESS_LINES,
  STUDIO_BEHANCE_URL,
  STUDIO_EMAIL,
  STUDIO_INSTAGRAM_URL,
  STUDIO_LINKEDIN_URL,
  STUDIO_X_URL,
} from "@/lib/studioContact";
import styles from "./Footer.module.css";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: STUDIO_INSTAGRAM_URL,
    Icon: InstagramIcon,
  },
  {
    label: "Behance",
    href: STUDIO_BEHANCE_URL,
    Icon: BehanceIcon,
  },
  {
    label: "X",
    href: STUDIO_X_URL,
    Icon: XIcon,
  },
  {
    label: "LinkedIn",
    href: STUDIO_LINKEDIN_URL,
    Icon: LinkedInIcon,
  },
] as const;

/**
 * Site footer — studio meta, minimal social icons, wordmark.
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
            <nav className={styles.socialRow} aria-label="Social profiles">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  className={styles.socialIconLink}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                >
                  <Icon className={styles.socialIcon} />
                </a>
              ))}
            </nav>
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
