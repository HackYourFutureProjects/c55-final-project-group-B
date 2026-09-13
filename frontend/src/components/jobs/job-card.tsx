import Link from "next/link";
import { formatPostedDateShort } from "@/lib/format-date";
import type { Job } from "@/lib/types";
import styles from "./job-card.module.css";
import SaveJobButton from "./save-job-button";

export default function JobCard({
  job,
  isSelected,
  href,
}: {
  job: Job;
  isSelected?: boolean;
  href: string;
}) {
  const posted = formatPostedDateShort(job.created);

  return (
    <li className={`${styles.card} ${isSelected ? styles.selected : ""}`}>
      <div className={styles.details}>
        <p className={styles.company}>{job.companyName}</p>
        <h3 className={styles.title}>
          <Link
            aria-current={isSelected ? "true" : undefined}
            href={href}
            scroll={false}
            className={styles.link}
          >
            {job.title}
          </Link>
        </h3>
        <p className={styles.location}>
          {job.locationCity ?? "Location not listed"}
        </p>
      </div>
      <div className={styles.aside}>
        <SaveJobButton jobId={job.jobId} jobTitle={job.title} />
        <p className={styles.date}>
          {posted && job.created && (
            <time dateTime={job.created}>{posted}</time>
          )}
        </p>
      </div>
    </li>
  );
}
