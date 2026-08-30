import JobCard from "@/components/job-card";
import { SearchBar } from "@/components/search-bar";
import { BACKEND_API_URL } from "@/lib/config";
import styles from "./page.module.css";
import type { Job } from "./types";

const LATEST_JOBS_LIMIT = 10;

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

async function getJobs(filters: {
  jobTitle?: string;
  city?: string;
  province?: string;
}): Promise<Job[]> {
  const query = new URLSearchParams();
  if (filters.jobTitle) {
    query.set("jobTitle", filters.jobTitle);
  }
  if (filters.city) {
    query.set("city", filters.city);
  }
  if (filters.province) {
    query.set("province", filters.province);
  }

  const queryString = query.toString();
  const res = await fetch(
    `${BACKEND_API_URL}/api/jobs${queryString ? `?${queryString}` : ""}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error("Could not load jobs");
  }

  return res.json();
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string }>;
}) {
  const { q, location } = await searchParams;
  const { city, province } = parseLocation(location);
  const activeFilters = [q, city, province].filter(Boolean).join(" · ");

  let jobs: Job[] | null;
  try {
    jobs = await getJobs({ jobTitle: q, city, province });
    // The backend returns jobs newest first; an empty search shows only
    // the 10 most recent listings.
    if (!activeFilters) {
      jobs = jobs.slice(0, LATEST_JOBS_LIMIT);
    }
  } catch {
    jobs = null;
  }

  return (
    <>
      <section className={styles.intro}>
        <div className="container">
          <h1 className={styles.title}>Open roles</h1>
          <p className={styles.subtitle}>
            {activeFilters
              ? `Showing results for ${activeFilters}.`
              : "The 10 most recent roles on Flint."}
          </p>
          <div className={styles.search}>
            <SearchBar defaultQuery={q} defaultLocation={location} />
          </div>
        </div>
      </section>

      <section className={styles.results}>
        <div className={`container ${styles.list}`}>
          {jobs === null && (
            <p className={styles.notice}>
              Could not load jobs right now. Please try again later.
            </p>
          )}
          {jobs !== null && jobs.length === 0 && (
            <p className={styles.notice}>
              No jobs found{activeFilters ? ` for ${activeFilters}` : ""}. Try a
              different search.
            </p>
          )}
          {jobs?.map((job) => (
            <JobCard key={job.jobId} job={job} />
          ))}
        </div>
      </section>
    </>
  );
}
