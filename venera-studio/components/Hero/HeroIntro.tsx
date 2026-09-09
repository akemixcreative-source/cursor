"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import styles from "@/components/Hero/Hero.module.css";

import { CAL_BOOKING_URL } from "@/lib/constants";

export function HeroIntro() {
  const reduceMotion = useReducedMotion();

  const content = (
    <>
      <p className={styles.headline}>
        Motion design for ambitious founders and brands. Ads that convert.
        Visuals that land.
      </p>
      <div className={styles.ctaRow}>
        <Link className={styles.ctaPrimary} href="/work">
          View work
        </Link>
        <a
          className={styles.ctaSecondary}
          href={CAL_BOOKING_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Book a call — opens Cal.com in a new tab"
        >
          Book a call
        </a>
      </div>
    </>
  );

  if (reduceMotion) {
    return <div className={styles.intro}>{content}</div>;
  }

  return (
    <motion.div
      className={styles.intro}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  );
}
