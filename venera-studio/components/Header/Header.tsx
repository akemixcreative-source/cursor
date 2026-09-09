"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HeaderLogo } from "@/components/Header/HeaderLogo";
import styles from "@/components/Header/Header.module.css";

export function Header() {
  const pathname = usePathname();
  const workActive = pathname.startsWith("/work");
  const aboutActive = pathname.startsWith("/about");
  const inquiryActive = pathname.startsWith("/inquiry");

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <HeaderLogo />

        <nav className={styles.nav} aria-label="Primary">
          <div className={styles.navLinks}>
            <Link
              className={`${styles.navLink} ${aboutActive ? styles.navLinkActive : ""}`}
              href="/about"
            >
              About us
            </Link>
            <Link
              className={`${styles.navLink} ${workActive ? styles.navLinkActive : ""}`}
              href="/work"
            >
              Projects
            </Link>
          </div>
          <Link
            className={`${styles.navCta} ${inquiryActive ? styles.navCtaActive : ""}`}
            href="/inquiry"
          >
            Inquiry
          </Link>
        </nav>
      </div>
    </header>
  );
}
