import { getJobCount, getJobTitleCount, getLocations } from "@/lib/jobs";
import styles from "./proof-strip.module.css";

export default async function ProofStrip() {
  const [jobCount, titleCount, { cities, provinces }] = await Promise.all([
    getJobCount(),
    getJobTitleCount(),
    getLocations(),
  ]);

  return (
    <section aria-label="flint in numbers" className={styles.section}>
      <dl className={`container ${styles.list}`}>
        <div className={styles.item}>
          <dt className={styles.title}>open roles right now</dt>
          <dd className={styles.value}>{jobCount}</dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.title}>distinct job titles</dt>
          <dd className={styles.value}>{titleCount}</dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.title}>cities with open roles</dt>
          <dd className={styles.value}>{cities.length}</dd>
        </div>

        <div className={styles.item}>
          <dt className={styles.title}>provinces covered</dt>
          <dd className={styles.value}>{provinces.length}</dd>
        </div>
      </dl>
    </section>
  );
}
