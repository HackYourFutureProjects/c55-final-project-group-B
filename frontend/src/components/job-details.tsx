import { formatPostedDate } from "@/lib/formatPostedDate";
import type { Job } from "@/lib/types";
import styles from "./job-details.module.css";
import SaveJobButton from "./save-job-button";

export default function JobDetails({ job }: { job: Job }) {
  const posted = formatPostedDate(job.created);
  return (
    <div className={styles.pane}>
      <div className={styles.card}>
        <div className={styles.details}>
          <p className={styles.company}>{job.companyName}</p>
          <h2 className={styles.title}>{job.title}</h2>
          <p className={styles.location}>{job.locationCity}</p>
        </div>
        <div className={styles.aside}>
          <p className={styles.date}>{posted}</p>
          <div className={styles.buttons}>
            <SaveJobButton />
            {job.redirectUrl && (
              <a
                href={job.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`button`}
              >
                Apply now
              </a>
            )}
          </div>
        </div>
      </div>
      <p className={styles.description}>{job.description}</p>
    </div>
  );
}
