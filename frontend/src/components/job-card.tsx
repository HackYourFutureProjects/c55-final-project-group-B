import type { Job } from "@/app/jobs/types";
import { formatPostedDateShort } from "@/lib/formatPostedDateShort";
import styles from "./job-card.module.css";
import SaveJobButton from "./save-job-button";

export default function JobCard({
  job,
  isSelected,
}: {
  job: Job;
  isSelected?: boolean;
}) {
  const posted = formatPostedDateShort(job.created);

  return (
    <div className={`${styles.card} ${isSelected ? styles.selected : ""}`}>
      <div className={styles.details}>
        <p className={styles.company}>{job.companyName}</p>
        <h2 className={styles.title}>{job.title}</h2>
        <p className={styles.location}>{job.locationCity}</p>
      </div>
      <div className={styles.aside}>
        <SaveJobButton />
        <p className={styles.date}>{posted}</p>
      </div>
    </div>
  );
}
