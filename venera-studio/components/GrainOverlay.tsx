import styles from "./GrainOverlay.module.css";

/**
 * Brand signature grain. Lives in the root layout, sits over every page
 * surface. Decorative only - aria-hidden so screen readers ignore it.
 */
export function GrainOverlay() {
  return <div aria-hidden className={styles.grain} />;
}
