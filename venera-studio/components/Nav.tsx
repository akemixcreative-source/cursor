"use client";

import Link from "next/link";
import styles from "./Nav.module.css";
import { useAsciiScrambleTrigger } from "@/components/useAsciiScrambleTrigger";

type NavItem = { label: string; href: string };

const ITEMS: readonly NavItem[] = [
  { label: "Work", href: "/#work" },
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

function NavLink({ label, href }: NavItem) {
  const [display, handlers] = useAsciiScrambleTrigger(label);
  return (
    <Link href={href} className={styles.link} aria-label={label} {...handlers}>
      {display}
    </Link>
  );
}

export function Nav({ ariaLabel = "Primary" }: { ariaLabel?: string }) {
  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
      {ITEMS.map((item) => (
        <NavLink key={item.label} {...item} />
      ))}
    </nav>
  );
}
