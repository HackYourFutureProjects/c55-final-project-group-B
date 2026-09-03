import JobCard from "@/components/job-card";
import JobDetails from "@/components/job-details";
import { NoSearchResults } from "@/components/no-search-results";
import { SearchBar } from "@/components/search-bar";
import { SavedJobsProvider } from "@/context/saved-jobs-provider";
import { BACKEND_API_URL } from "@/lib/config";
import type { Job } from "@/lib/types";
import styles from "./page.module.css";

type JobFilters = {
  jobTitle?: string;
  city?: string;
  province?: string;
};

function parseLocation(location?: string): {
  city?: string;
  province?: string;
} {
  if (!location) {
    return {};
  }
  if (location.startsWith("city:")) {
    return { city: location.slice("city:".length) };
  }
  if (location.startsWith("province:")) {
    return { province: location.slice("province:".length) };
  }
  return {};
}

async function getJobs(filters: JobFilters): Promise<Job[]> {
  const params = new URLSearchParams();

  if (filters.jobTitle) {
    params.set("jobTitle", filters.jobTitle);
  }

  if (filters.city) {
    params.set("city", filters.city);
  }

  if (filters.province) {
    params.set("province", filters.province);
  }

  const queryString = params.toString();
  const url = `${BACKEND_API_URL}/api/jobs`;

  const res = await fetch(`${url}${queryString ? `?${queryString}` : ""}`);
  if (!res.ok) {
    throw new Error(`Could not load jobs: (Error ${res.status})`);
  }

  const jobs: Job[] = await res.json();
  return jobs;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; jobId?: string }>;
}) {
  const { q, location, jobId } = await searchParams;
  const { city, province } = parseLocation(location);

  const jobs = await getJobs({ jobTitle: q, city, province });
  const selectedJob = jobs.find((j) => j.jobId === jobId) ?? jobs[0];

  function hrefFor(id: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    params.set("jobId", id);
    return `/jobs?${params}`;
  }

  const place = city || province;
  const count = jobs.length;
  const hasResults = count > 0;

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heading}>Find your next opportunity</h1>
          <SearchBar defaultQuery={q} defaultLocation={location} />
        </div>
      </section>

      <section className={styles.results}>
        <div className="container">
          {hasResults ? (
            <SavedJobsProvider>
              <div className={styles.layout}>
                <div className={styles.list}>
                  <p className={styles.subtitle}>
                    {count} {count === 1 ? "job" : "jobs"} available{" "}
                    {q && `for ${q}`}
                    {place && ` in ${place}`}
                  </p>
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
          ) : (
            <NoSearchResults q={q} place={place} />
          )}
        </div>
      </section>
    </>
  );
}
