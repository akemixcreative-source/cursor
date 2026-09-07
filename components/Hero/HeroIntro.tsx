"use client";

import { motion, useReducedMotion } from "framer-motion";

import styles from "@/components/Hero/Hero.module.css";

export function HeroIntro() {
  const reduceMotion = useReducedMotion();

  const headline = (
    <p className={styles.headline}>
      Motion design for ambitious founders and brands. Ads that convert.
      Visuals that land.
    </p>
  );

  if (reduceMotion) {
    return <div className={styles.intro}>{headline}</div>;
  }

  return (
    <motion.div
      className={styles.intro}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {headline}
    </motion.div>
  );
}
