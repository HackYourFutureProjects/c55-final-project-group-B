import { Logo } from "./logo";
import NavLink from "./nav-link";
import styles from "./site-header.module.css";
import UserMenu from "./user-menu";

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
                <NavLink href={link.href} className={styles.link}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <UserMenu />
      </div>
    </header>
  );
}
