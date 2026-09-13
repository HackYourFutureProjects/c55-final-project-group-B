import { ArrowSquareOutIcon } from "@phosphor-icons/react/ssr";
import Markdown from "react-markdown";
import { formatPostedDate } from "@/lib/format-date";
import type { Job } from "@/lib/types";
import styles from "./job-details.module.css";
import SaveJobButton from "./save-job-button";

export default function JobDetails({ job }: { job: Job }) {
  const posted = formatPostedDate(job.created);
  return (
    <div className={styles.pane}>
      <div className={styles.card}>
        <div className={styles.details}>
          <p className={styles.company}>{job.companyName}</p>
          <h2 className={styles.title}>{job.title}</h2>
          <p className={styles.location}>
            {job.locationCity ?? "Location not listed"}
          </p>
        </div>
        <div className={styles.aside}>
          <p className={styles.date}>
            {posted && job.created && (
              <time dateTime={job.created}>{posted}</time>
            )}
          </p>
          <div className={styles.buttons}>
            <SaveJobButton jobId={job.jobId} jobTitle={job.title} />
            {job.redirectUrl && (
              <a
                href={job.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`button ${styles.apply}`}
              >
                Apply now{" "}
                <ArrowSquareOutIcon
                  size={18}
                  weight="duotone"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>
        </div>
      </div>
      <section
        className={styles.description}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the description scrolls on its own and often has no links, so it must take focus for keyboard scrolling
        tabIndex={0}
        aria-label="Job description"
      >
        {job.description ? (
          <Markdown components={{ h1: "h3", h2: "h3" }}>
            {job.description}
          </Markdown>
        ) : (
          <p>
            This posting didn't come with a description. The full details are
            one click away at the source.
          </p>
        )}
      </section>
    </div>
  );
}
