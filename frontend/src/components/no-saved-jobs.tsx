import { HeartBreakIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import styles from "./no-saved-jobs.module.css";

export function NoSavedJobs() {
  return (
    <div className={styles.layout}>
      <HeartBreakIcon
        size={48}
        weight="duotone"
        aria-hidden="true"
        className={styles.icon}
      />
      <h2 className={styles.title}>No saved jobs yet</h2>
      <p className={styles.body}>
        Tap the heart on any job to keep it here for later.
      </p>
      <Link href="/jobs" className="button">
        Browse jobs
      </Link>
    </div>
  );
}
