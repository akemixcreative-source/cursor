import Link from "next/link";
import { BookingCallButton } from "@/components/BookingCallButton";
import { ScrollRevealLines } from "@/components/ScrollRevealLines";
import { HeroIntroVisual } from "@/components/HeroIntroVisual";
import styles from "./HeroIntro.module.css";
const HEADLINE = "Launch videos that make startups look inevitable.";

const LEAD =
  "Designing brand with creative craft that founders and people love.";

const CTA_LABEL = "START A PROJECT";
const CALL_CTA_LABEL = "BOOK A CALL";

/**
 * HeroIntro
 * Brand statement directly under the hero video. On wide viewports the
 * headline + lead + CTA sit in a left column; a square hero visual sits on
 * the right (reference layout). Narrow screens stack copy then visual.
 */
export function HeroIntro() {
  return (
    <section className={styles.section} aria-labelledby="hero-intro-heading">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <ScrollRevealLines
            as="h1"
            id="hero-intro-heading"
            className={`${styles.copyReveal} ${styles.headline}`.trim()}
            text={HEADLINE}
            distance={36}
            duration={0.58}
            stagger={0.1}
            delay={0}
          />
          <ScrollRevealLines
            as="p"
            className={`${styles.copyReveal} ${styles.lead}`.trim()}
            text={LEAD}
            distance={22}
            duration={0.52}
            stagger={0.085}
            delay={0.12}
          />
          <div className={styles.ctaRow}>
            <Link
              href="/contact"
              className={styles.contactPill}
              aria-label="Start a project with venera"
            >
              <span className={styles.pillChevron} aria-hidden>
                &gt;
              </span>
              <span className={styles.pillLabel}>{CTA_LABEL}</span>
            </Link>
            <BookingCallButton
              className={`${styles.contactPill} ${styles.callPill}`}
              ariaLabel="Book a discovery call with venera"
            >
              <span className={styles.pillPhone} aria-hidden>
                <svg
                  className={styles.pillPhoneIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className={styles.pillLabel}>{CALL_CTA_LABEL}</span>
            </BookingCallButton>
          </div>
        </div>
        <div className={styles.figure} aria-hidden="true">
          <HeroIntroVisual />
        </div>
      </div>
    </section>
  );
}
