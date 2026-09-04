import { BinocularsIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import styles from "./no-search-results.module.css";

export function NoSearchResults({
  q,
  place,
  clearHref = "/jobs",
  body = "Try searching for a different role or clear the search to browse open jobs.",
}: {
  q?: string;
  place?: string;
  clearHref?: string;
  body?: string;
}) {
  return (
    <div className={styles.layout}>
      <BinocularsIcon
        size={40}
        className={styles.icon}
        weight="duotone"
        aria-hidden="true"
      />
      <h2 className={styles.title}>
        No jobs found
        {q && (
          <>
            {" for "} <strong className={styles.term}>“{q}”</strong>
          </>
        )}
        {place && (
          <>
            {" in "} <strong className={styles.term}>{place}</strong>
          </>
        )}
      </h2>
      <p className={styles.body}>{body}</p>
      <Link href={clearHref} className="button">
        Clear search
      </Link>
    </div>
  );
}
