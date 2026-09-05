import Link from "next/link";
import styles from "./logo.module.css";

export function Logo() {
  return (
    <Link href="/" className={styles.title} aria-label="Flint — home">
      <img src="/logo.svg" alt="" className={styles.logo} />
      flint
    </Link>
  );
}
