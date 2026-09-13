import JobFeed from "@/components/jobs/job-feed";
import { NoSearchResults } from "@/components/jobs/no-search-results";
import { SearchBar } from "@/components/search/search-bar";
import { parseLocation } from "@/lib/job-filters";
import { getJobs } from "@/lib/jobs";
import styles from "./page.module.css";

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
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heading}>Find your next opportunity</h1>
          <SearchBar defaultQuery={q} defaultLocation={location} />
        </div>
      </section>

      <section className={styles.results}>
        <div className={`container ${styles.board}`}>
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
    </div>
  );
}
