import type { ReactNode } from "react";
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
}: {
  jobs: Job[];
  selectedJob: Job;
  hrefFor: (id: string) => string;
  subtitle: ReactNode;
}) {
  return (
    <SavedJobsProvider>
      <div className={styles.layout}>
        <div className={styles.list}>
          <p className={styles.subtitle}>{subtitle}</p>
          {jobs.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              isSelected={job.jobId === selectedJob.jobId}
              href={hrefFor(job.jobId)}
            />
          ))}
        </div>
        <div className={styles.details}>
          <JobDetails job={selectedJob} />
        </div>
      </div>
    </SavedJobsProvider>
  );
}
