import Link from "next/link";
import { Logo } from "@/components/logo";
import styles from "./site-header.module.css";

const NAV_LINKS = [
  { label: "Jobs", href: "/jobs" },
  { label: "Companies", href: "/companies" },
  { label: "About", href: "/about" },
  { label: "For employers", href: "/employers" },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Logo />

        <nav aria-label="Main">
          <ul className={styles.nav}>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.auth}>
          <Link href="/login" className="button-secondary">
            Log in
          </Link>
          <Link href="/signup" className="button">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
