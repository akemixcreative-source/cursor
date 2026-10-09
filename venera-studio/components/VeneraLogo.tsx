import Image from "next/image";
import styles from "./VeneraLogo.module.css";

const WORDMARK_SRC = "/images/mockups/Logo/venera-logo.png";

export type VeneraLogoVariant = "nav" | "loader" | "footer";

type VeneraLogoProps = {
  variant: VeneraLogoVariant;
  priority?: boolean;
  className?: string;
};

/** Venera wordmark (light script on dark canvas). */
export function VeneraLogo({
  variant,
  priority,
  className,
}: VeneraLogoProps) {
  const rootClass =
    variant === "nav"
      ? `${styles.root} ${styles.rootNav}`
      : variant === "loader"
        ? `${styles.root} ${styles.rootLoader}`
        : `${styles.root} ${styles.rootFooter}`;

  const sizes =
    variant === "nav"
      ? "64px"
      : variant === "loader"
        ? "(max-width: 768px) 50vw, 280px"
        : "(max-width: 768px) 72vw, 420px";

  return (
    <span
      className={[rootClass, className].filter(Boolean).join(" ")}
      role="img"
      aria-label="Venera"
    >
      <Image
        src={WORDMARK_SRC}
        alt=""
        fill
        className={styles.img}
        sizes={sizes}
        priority={priority}
        draggable={false}
      />
    </span>
  );
}
