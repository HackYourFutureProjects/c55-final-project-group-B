import type { Job } from "@/app/jobs/types";
import styles from "./job-card.module.css";

function formatPostedDate(created: string | null): string | null {
  if (!created) {
    return null;
  }

  const date = new Date(created);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function JobCard({ job }: { job: Job }) {
  const location = [job.locationCity, job.locationProvince]
    .filter(Boolean)
    .join(", ");
  const posted = formatPostedDate(job.created);

  return (
    <article className={`card ${styles.card}`}>
      <div className={styles.details}>
        <h2 className={styles.title}>{job.title}</h2>
        <p className={styles.meta}>
          <span className={styles.company}>{job.companyName}</span>
          {location && (
            <>
              <span aria-hidden className={styles.separator}>
                ·
              </span>
              <span>{location}</span>
            </>
          )}
        </p>
        {job.description && <p className={styles.summary}>{job.description}</p>}
        {posted && <p className={styles.posted}>Posted {posted}</p>}
      </div>
      {job.redirectUrl && (
        <a
          href={job.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`button ${styles.action}`}
        >
          Apply now
        </a>
      )}
    </article>
  );
}
