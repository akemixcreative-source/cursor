import type { Metadata } from "next";

import { Reveal } from "@/components/Reveal/Reveal";

import styles from "@/app/privacy/legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <Reveal>
      <article className={styles.article}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.body}>
          This policy will describe how Venera Studio collects and uses data from
          this site and inquiries. Ryan will publish the full legal text here
          before launch, or share it on request.
        </p>
        <p className={styles.body}>
          Questions: use the contact form or your booking confirmation email from
          Cal.com.
        </p>
      </article>
    </Reveal>
  );
}
