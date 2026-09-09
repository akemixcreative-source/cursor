import styles from "@/components/CaseStudyDetailColumns/CaseStudyDetailColumns.module.css";

interface CaseStudyDetailColumnsProps {
  left: string;
  right: string;
}

export function CaseStudyDetailColumns({
  left,
  right,
}: CaseStudyDetailColumnsProps) {
  const L = left.trim();
  const R = right.trim();

  if (!L && !R) {
    return null;
  }

  if (L && R) {
    return (
      <section className={styles.section} aria-label="Project details">
        <div className={styles.grid}>
          <p className={styles.column}>{L}</p>
          <p className={styles.column}>{R}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-label="Project details">
      <div className={styles.gridSingle}>
        <p className={styles.column}>{L || R}</p>
      </div>
    </section>
  );
}
