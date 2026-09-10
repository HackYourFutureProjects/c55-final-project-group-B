import JobFeed from "@/components/job-feed";
import { NoSearchResults } from "@/components/no-search-results";
import { SearchBar } from "@/components/search-bar";
import { BACKEND_API_URL } from "@/lib/config";
import { parseLocation } from "@/lib/job-filters";
import { buildJobsQuery, type JobFilters } from "@/lib/jobs";
import type { JobPage } from "@/lib/types";
import styles from "./page.module.css";

async function getJobs(filters: JobFilters): Promise<JobPage> {
  const queryString = buildJobsQuery(filters);
  const url = `${BACKEND_API_URL}/api/jobs`;

  const res = await fetch(`${url}?${queryString}`);
  if (!res.ok) {
    throw new Error(`Could not load jobs: (Error ${res.status})`);
  }

  const page: JobPage = await res.json();
  return page;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    location?: string;
    jobId?: string;
  }>;
}) {
  const { q, location, jobId } = await searchParams;
  const { city, province } = parseLocation(location);
  const {
    items: jobs,
    totalItems,
    totalPages,
  } = await getJobs({
    search: q,
    city,
    province,
    page: 0,
  });

  const place = city || province;
  const count = totalItems;
  const hasResults = count > 0;

  const subtitle = (
    <>
      {count} {count === 1 ? "job" : "jobs"} available {q && `for ${q}`}{" "}
      {place && ` in ${place}`}
    </>
  );

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
            <JobFeed
              initialJobs={jobs}
              totalPages={totalPages}
              jobId={jobId}
              q={q}
              location={location}
              subtitle={subtitle}
            />
          ) : (
            <NoSearchResults q={q} place={place} />
          )}
        </div>
      </section>
    </>
  );
}
