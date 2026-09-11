"use client";

import { CircleNotchIcon } from "@phosphor-icons/react/dist/ssr";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { parseLocation } from "@/lib/job-filters";
import { buildJobsQuery } from "@/lib/jobs";
import type { Job, JobPage } from "@/lib/types";
import styles from "./job-feed.module.css";
import JobResults from "./job-results";

type JobFeedProps = {
  initialJobs: Job[];
  totalPages: number;
  jobId?: string;
  q?: string;
  location?: string;
  subtitle: ReactNode;
};

export default function JobFeed({
  initialJobs,
  totalPages,
  jobId,
  q,
  location,
  subtitle,
}: JobFeedProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const hasMore = page + 1 < totalPages;
  const selectedJob = jobs.find((j) => j.jobId === jobId) ?? jobs[0];
  const { city, province } = parseLocation(location);

  function hrefFor(id: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    params.set("jobId", id);
    return `/jobs?${params}`;
  }

  async function loadMore() {
    if (isLoading || !hasMore) return;
    setError(undefined);
    setIsLoading(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(
        `/api/jobs?${buildJobsQuery({ search: q, city, province, page: nextPage })}`,
      );
      if (!res.ok) throw new Error("Could not load more jobs.");
      const data: JobPage = await res.json();
      setJobs((prev) => {
        const seen = new Set(prev.map((job) => job.jobId));
        const fresh = data.items.filter((job) => !seen.has(job.jobId));
        return [...prev, ...fresh];
      });
      setPage(nextPage);
    } catch {
      setError("Could not load more jobs.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { root: listRef.current, rootMargin: "300px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  });

  function renderStatus() {
    if (isLoading)
      return (
        <CircleNotchIcon
          className={styles.spinner}
          size={32}
          weight="duotone"
          aria-hidden="true"
        />
      );
    if (error)
      return (
        <>
          <p role="alert">{error}</p>
          <button type="button" className="button-secondary" onClick={loadMore}>
            {"Try again"}
          </button>
        </>
      );
    if (hasMore)
      return (
        <button type="button" className="button-secondary" onClick={loadMore}>
          {"Load more"}
        </button>
      );
    return null;
  }

  const footer = (
    <div className={styles.footer}>
      {renderStatus()}
      <div ref={sentinelRef} />
    </div>
  );

  return (
    <JobResults
      jobs={jobs}
      selectedJob={selectedJob}
      hrefFor={hrefFor}
      subtitle={subtitle}
      footer={footer}
      listRef={listRef}
    />
  );
}
