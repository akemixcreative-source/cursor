import type { Metadata } from "next";

import { Reveal } from "@/components/Reveal/Reveal";

import styles from "@/app/privacy/legal.module.css";

export const metadata: Metadata = {
  title: "Imprint",
};

export default function ImprintPage() {
  return (
    <Reveal>
      <article className={styles.article}>
        <h1 className={styles.title}>Imprint</h1>
        <p className={styles.body}>
          Legal disclosure and business details for Venera Studio will appear
          here for your jurisdiction (New York / US). Add registered address and
          entity name when finalized.
        </p>
      </article>
    </Reveal>
  );
}
