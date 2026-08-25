import Link from "next/link";
import styles from "./logo.module.css";

export function Logo() {
  return (
    <Link href="/" className={styles.logo} aria-label="Flint — home">
      <span aria-hidden className={styles.mark} />
      flint
    </Link>
  );
}
