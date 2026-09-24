import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./InnerPage.module.css";

type InnerPageProps = {
  /** Omitted when the page provides its own headline (e.g. About thesis block). */
  title?: string;
  children: ReactNode;
  /** When false, omit the “← Home” link (use when PageMeta provides the logo). */
  showBack?: boolean;
  /** Use full `--max` width for long-form / two-column sections (default: narrow reading column). */
  wide?: boolean;
};

/**
 * Minimal inner-page shell (stubs until full templates ship).
 */
export function InnerPage({
  title,
  children,
  showBack = true,
  wide = false,
}: InnerPageProps) {
  return (
    <main className={styles.shell}>
      {showBack ? (
        <Link href="/" className={styles.back}>
          ← Home
        </Link>
      ) : null}
      {title ? <h1 className={styles.title}>{title}</h1> : null}
      <div className={wide ? styles.bodyWide : styles.body}>{children}</div>
    </main>
  );
}
