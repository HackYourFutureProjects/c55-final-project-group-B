import type { ReactNode, Ref } from "react";
import { SavedJobsProvider } from "@/context/saved-jobs-provider";
import type { Job } from "@/lib/types";
import JobCard from "./job-card";
import JobDetails from "./job-details";
import styles from "./job-results.module.css";

export default function JobResults({
  jobs,
  selectedJob,
  hrefFor,
  subtitle,
  footer,
  listRef,
}: {
  jobs: Job[];
  selectedJob: Job;
  hrefFor: (id: string) => string;
  subtitle: ReactNode;
  footer?: ReactNode;
  listRef?: Ref<HTMLUListElement>;
}) {
  return (
    <SavedJobsProvider>
      <div className={styles.layout}>
        <div className={styles.list}>
          <h2 className={styles.subtitle}>{subtitle}</h2>
          <ul aria-label="Job results" className={styles.cards} ref={listRef}>
            {jobs.map((job) => (
              <JobCard
                key={job.jobId}
                job={job}
                isSelected={job.jobId === selectedJob.jobId}
                href={hrefFor(job.jobId)}
              />
            ))}
            {footer}
          </ul>
        </div>
        <section className={styles.details} aria-label="Job details">
          <JobDetails job={selectedJob} />
        </section>
      </div>
    </SavedJobsProvider>
  );
}
