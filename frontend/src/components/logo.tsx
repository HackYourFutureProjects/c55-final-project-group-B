import Image from "next/image";
import Link from "next/link";
import styles from "./logo.module.css";

export function Logo() {
  return (
    <Link href="/" className={styles.title} aria-label="Flint — home">
      <Image src="/logo.svg" alt="" className={styles.logo} />
      flint
    </Link>
  );
}
