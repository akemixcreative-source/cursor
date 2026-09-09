"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface MainFadeProps {
  children: ReactNode;
}

/**
 * Subtle full-route fade so each navigation reads as a fresh page reveal.
 * Section-level `Reveal` handles staggered fade-up; this is the ambient layer.
 */
export function MainFade({ children }: MainFadeProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <main>{children}</main>;
  }

  return (
    <motion.main
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}
