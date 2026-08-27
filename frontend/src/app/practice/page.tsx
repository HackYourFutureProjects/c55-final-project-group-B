import styles from "./page.module.css";
import JobCard from "@/components/job-card";
import { Job } from "../jobs/types";
import { BACKEND_API_URL } from "@/lib/config";
import JobDetails from "@/components/job-details";

export default async function PracticePage() {
  const response = await fetch(`${BACKEND_API_URL}/api/jobs`);
  const jobs: Job[] = await response.json();
  const job = jobs[0];
  return (
    <div className="container">
      <div className={styles.layout}>
        <div className={styles.list}>
          <p className={styles.jobs}>{jobs.length} jobs available</p>
          {jobs.map((job) => (
            <JobCard key={job.jobId} job={job} />
          ))}
        </div>
        <div className={styles.pane}>
          <JobDetails job={job} />
        </div>
      </div>
    </div>
  );
}
