import type { Metadata } from "next";

import { Reveal } from "@/components/Reveal/Reveal";
import { pageMetadata } from "@/lib/seo";

import styles from "@/app/privacy/legal.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Imprint",
  description: "Legal disclosure and business details for Venera in New York.",
  path: "/imprint",
});

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
