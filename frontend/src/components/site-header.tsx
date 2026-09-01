import Link from "next/link";
import { Logo } from "@/components/logo";
import UserMenu from "@/components/user-menu";
import styles from "./site-header.module.css";

const NAV_LINKS = [
  { label: "Jobs", href: "/jobs" },
  { label: "About", href: "/about" },
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

        <UserMenu />
      </div>
    </header>
  );
}
