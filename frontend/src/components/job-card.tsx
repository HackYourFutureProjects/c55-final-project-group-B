import type { Job } from "@/app/jobs/types";
import styles from "./job-card.module.css";
import SaveJobButton from "./save-job-button";

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className={styles.card}>
      <div className={styles.details}>
        <p className={styles.company}>{job.companyName}</p>
        <h2 className={styles.title}>{job.title}</h2>
        <p className={styles.location}>{job.locationCity}</p>
      </div>
      <SaveJobButton />
    </div>
  );
}
