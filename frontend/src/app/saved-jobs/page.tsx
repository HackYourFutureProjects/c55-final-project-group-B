import { parseLocation } from "@/lib/job-filters";
import { getSavedJobs } from "@/lib/saved-jobs";
import { SearchBar } from "@/components/search-bar";
import JobResults from "@/components/job-results";
import { NoSearchResults } from "@/components/no-search-results";
import styles from "./page.module.css";

export default async function SavedJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; jobId?: string }>;
}) {
  const { q, location, jobId } = await searchParams;
  const { city, province } = parseLocation();

  const savedJobs = await getSavedJobs();
  const selectedJob = savedJobs.find((j) => j.jobId === jobId) ?? savedJobs[0];

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heading}>Find your next opportunity</h1>
          <SearchBar defaultQuery={q} defaultLocation={location} />
        </div>
      </section>

      <section className={styles.results}>
        <div className="container"></div>
      </section>
    </>
  );
}
