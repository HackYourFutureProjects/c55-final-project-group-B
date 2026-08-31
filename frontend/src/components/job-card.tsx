import Link from "next/link";
import { formatPostedDateShort } from "@/lib/formatPostedDateShort";
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
    <div className={`${styles.card} ${isSelected ? styles.selected : ""}`}>
      <div className={styles.details}>
        <p className={styles.company}>{job.companyName}</p>
        <h2 className={styles.title}>
          <Link href={href} scroll={false} className={styles.link}>
            {job.title}
          </Link>
        </h2>
        <p className={styles.location}>{job.locationCity}</p>
      </div>
      <div className={styles.aside}>
        <SaveJobButton jobId={job.jobId} />
        <p className={styles.date}>{posted}</p>
      </div>
    </div>
  );
}
