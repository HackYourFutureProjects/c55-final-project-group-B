import { SearchBar } from "@/components/search-bar";
import SavedJobResults from "@/components/saved-jobs-results";
import styles from "./page.module.css";

export default async function SavedJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string; jobId?: string }>;
}) {
  const { q, location, jobId } = await searchParams;

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heading}>Your saved jobs</h1>
          <SearchBar
            action="/saved-jobs"
            defaultQuery={q}
            defaultLocation={location}
          />
        </div>
      </section>

      <section className={styles.results}>
        <div className="container">
          <SavedJobResults q={q} location={location} jobId={jobId} />
        </div>
      </section>
    </>
  );
}
