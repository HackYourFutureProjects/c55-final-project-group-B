import { GithubLogoIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>
          &#xA9; {year} Flint — a{" "}
          <a
            className={styles.links}
            href="https://hackyourfuture.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            HackYourFuture
          </a>{" "}
          student project
        </p>
        <nav aria-label="Footer">
          <ul className={styles.nav}>
            <li>
              <Link href="/" className={styles.links}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/jobs" className={styles.links}>
                Jobs
              </Link>
            </li>
            <li>
              <Link href="/about" className={styles.links}>
                About
              </Link>
            </li>
            <li>
              <Link
                className={styles.links}
                aria-label="Flint source code on GitHub"
                href="https://github.com/HackYourFutureProjects/c55-final-project-group-B"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubLogoIcon size={24} weight="duotone" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
