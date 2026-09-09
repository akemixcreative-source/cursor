import styles from "@/components/CaseStudyIntro/CaseStudyIntro.module.css";

import type { CreditEntry } from "@/lib/types";

interface CaseStudyIntroProps {
  title: string;
  client: string;
  year: number;
  introParagraphs: string[];
  credits?: CreditEntry[];
  roles: string[];
}

function CreditsCornerIcon() {
  return (
    <svg
      className={styles.cornerSvg}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M0 1h1v10H0V1zm0 0h10v1H0V1z"
      />
    </svg>
  );
}

export function CaseStudyIntro({
  title,
  client,
  year,
  introParagraphs,
  credits,
  roles,
}: CaseStudyIntroProps) {
  return (
    <section className={styles.section} aria-labelledby="case-intro-title">
      <div className={styles.wrap}>
        <div className={styles.titleRow}>
          <span className={styles.titleRowSpacer} aria-hidden />
          <h1 id="case-intro-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.year}>
            <span className={styles.visuallyHidden}>Year </span>({year})
          </p>
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.descColumn}>
            <span className={styles.star} aria-hidden>
              *
            </span>
            <div className={styles.descBody}>
              {introParagraphs.map((text, index) => (
                <p key={index} className={styles.paragraph}>
                  {text}
                </p>
              ))}
            </div>
          </div>

          <div className={styles.creditsColumn}>
            <div className={styles.creditsHeader}>
              <CreditsCornerIcon />
            </div>
            {credits && credits.length > 0 ? (
              <div className={styles.creditsPairs} role="list">
                {credits.map((row, index) => (
                  <div key={`${row.name}-${index}`} className={styles.creditRow} role="listitem">
                    <span className={styles.creditName}>{row.name}</span>
                    <span className={styles.creditRole}>{row.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.creditsFallback}>
                <p className={styles.fallbackBlock}>
                  <span className={styles.fallbackLabel}>Client</span>
                  <span className={styles.fallbackValue}>{client}</span>
                </p>
                {roles.length > 0 ? (
                  <ul className={styles.roleList}>
                    {roles.map((r) => (
                      <li key={r} className={styles.roleItem}>
                        {r}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
