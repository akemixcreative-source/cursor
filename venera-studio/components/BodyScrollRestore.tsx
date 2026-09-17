"use client";

import { useEffect } from "react";

/**
 * Clears scroll locks left by a stuck Loader or other overlays.
 * Safe to run on every route — only resets inline overflow styles.
 */
export function BodyScrollRestore() {
  useEffect(() => {
    document.body.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("overflow");
  }, []);

  return null;
}
