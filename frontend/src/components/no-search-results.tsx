import Link from "next/link";
import styles from "./no-search-results.module.css";

export default function NoSearchResults({
  q,
  place,
}: {
  q?: string;
  place?: string;
}) {
  return (
    <div className={styles.layout}>
      <p>
        No jobs found {`for ${q}`} {` in ${place}`}
      </p>
      <Link href="/jobs" className="button">
        Clear search
      </Link>
    </div>
  );
}
