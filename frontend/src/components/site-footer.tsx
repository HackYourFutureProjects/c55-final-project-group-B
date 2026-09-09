import Link from "next/link";
import styles from "./site-footer.module.css";
import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>
          &#xA9; {year} Flint - a{" "}
          <a
            className={styles.links}
            href="https://hackyourfuture.net"
            target="_blank"
          >
            HackYourFuture
          </a>{" "}
          Student Project
        </p>
        <ul aria-label="Footer links" className={styles.nav}>
          <li className={styles.links}>
            <Link href="/">Home</Link>
          </li>
          <li className={styles.links}>
            <Link href="/jobs">Jobs</Link>
          </li>
          <li className={styles.links}>
            <Link href="/about">About</Link>
          </li>
          <li className={styles.links}>
            <Link
              aria-label="Flint source code on GitHub"
              href="https://github.com/HackYourFutureProjects/c55-final-project-group-B"
              target="_blank"
            >
              <GithubLogoIcon size={24} weight="duotone" aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
