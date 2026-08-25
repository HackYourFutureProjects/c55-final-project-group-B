import Link from "next/link";
import styles from "./page-placeholder.module.css";

export function PagePlaceholder({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className={`container ${styles.placeholder}`}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.detail}>{detail}</p>
      <Link href="/" className="button">
        Back to home
      </Link>
    </div>
  );
}
