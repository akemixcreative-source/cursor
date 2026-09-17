import type { Metadata } from "next";
import Link from "next/link";
import { BookingCallButton } from "@/components/BookingCallButton";
import { Nav } from "@/components/Nav";
import { NycLiveClock } from "@/components/NycLiveClock";
import { PageMeta } from "@/components/PageMeta";
import { VeneraLogo } from "@/components/VeneraLogo";
import { ContactForm } from "@/components/contact/ContactForm";
import { STUDIO_ADDRESS } from "@/lib/studioContact";
import {
  SITE_BRAND,
  SITE_TITLE_BRAND,
  SITE_TITLE_SERVICE,
  SITE_URL,
} from "@/lib/site";
import styles from "./page.module.css";

const CONTACT_TITLE = `Contact | ${SITE_TITLE_BRAND} · ${SITE_TITLE_SERVICE}`;
const CONTACT_DESCRIPTION = `Start a project with ${SITE_BRAND}. Share your product, goals, and timeline for a reply within 1 to 2 business days.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: CONTACT_TITLE },
  description: CONTACT_DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    type: "website",
    url: "/contact",
    siteName: SITE_BRAND,
  },
  twitter: {
    card: "summary_large_image",
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
  },
};

/**
 * /contact
 *
 * Editorial intake page: display headline + muted lead at top, full intake
 * form below, mono-caps email/location meta lines at the bottom. PageMeta
 * sticks to the top of the viewport (logo + nav).
 */
export default function ContactPage() {
  return (
    <>
      <PageMeta
        mode="always"
        left={
          <Link href="/" className={styles.chromeLogo} aria-label="Home">
            <VeneraLogo variant="nav" priority />
          </Link>
        }
        center={<NycLiveClock />}
        right={<Nav ariaLabel="Primary" />}
      />

      <main className={styles.page}>
        <section className={styles.intro} aria-label="Contact options">
          <div className={styles.introGrid}>
            <article
              className={styles.introPath}
              aria-labelledby="contact-heading"
            >
              <h1 id="contact-heading" className={styles.heading}>
                Start a project with venera
              </h1>
              <p className={styles.lead}>
                We help funded SaaS startups transform complex products into
                cinematic motion experiences from launch films to product
                walkthroughs and motion systems. Share your vision in under 2
                minutes. We respond within 1-2 business days.
              </p>
            </article>

            <article
              className={styles.introPath}
              aria-labelledby="discovery-heading"
            >
              <h2 id="discovery-heading" className={styles.heading}>
                Book a discovery call
              </h2>
              <p className={styles.lead}>
                Prefer to talk first? Book a 30-minute intro call. We&apos;ll
                discuss your product, timeline, and whether we&apos;re the right
                fit. No form required.
              </p>
              <BookingCallButton className={styles.discoveryCta}>
                Book a call
              </BookingCallButton>
            </article>
          </div>
        </section>

        <ContactForm />

        <dl className={styles.meta} aria-label="Contact details">
          <div className={styles.metaLine}>
            <dt className={styles.metaKey}>Email:</dt>
            <dd className={styles.metaValue}>hello@venerastudio.com</dd>
          </div>
          <div className={styles.metaLine}>
            <dt className={styles.metaKey}>Location:</dt>
            <dd className={styles.metaValue}>{STUDIO_ADDRESS}</dd>
          </div>
        </dl>
      </main>
    </>
  );
}
