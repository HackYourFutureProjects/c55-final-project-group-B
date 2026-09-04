"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/context/current-user-provider";
import { filterJobs, parseLocation } from "@/lib/job-filters";
import { getSavedJobs } from "@/lib/saved-jobs";
import type { SavedJob } from "@/lib/types";
import JobResults from "./job-results";
import Loading from "./loading";
import { NoSavedJobs } from "./no-saved-jobs";
import { NoSearchResults } from "./no-search-results";
import styles from "./saved-jobs-results.module.css";

type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; jobs: SavedJob[] };

export default function SavedJobsResults({
  q,
  location,
  jobId,
}: {
  q?: string;
  location?: string;
  jobId?: string;
}) {
  const { user, isLoading } = useCurrentUser();
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    if (!user) return;
    let stale = false;
    async function load() {
      try {
        const jobs = await getSavedJobs();
        if (stale) return;
        setState({ status: "ready", jobs });
      } catch {
        if (stale) return;
        setState({ status: "error" });
      }
    }
    load();
    return () => {
      stale = true;
    };
  }, [user]);

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className={styles.notice}>
        <p className={styles.noticeText}>Log in to see your saved jobs.</p>
        <Link href="/login" className="button">
          Log in
        </Link>
      </div>
    );
  }

  if (state.status === "loading") {
    return <Loading />;
  }

  if (state.status === "error") {
    return (
      <div className={styles.notice}>
        <p className={styles.noticeText}>
          Could not load your saved jobs. Please try again later.
        </p>
      </div>
    );
  }

  if (state.jobs.length === 0) {
    return <NoSavedJobs />;
  }

  const { city, province } = parseLocation(location);
  const filtered = filterJobs(state.jobs, q, city, province);
  const place = city || province;

  if (filtered.length === 0) {
    return (
      <NoSearchResults
        q={q}
        place={place}
        clearHref="/saved-jobs"
        body="Try a different search or clear it to see all your saved jobs."
      />
    );
  }

  const selectedJob = filtered.find((j) => j.jobId === jobId) ?? filtered[0];
  const count = filtered.length;

  function hrefFor(id: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    params.set("jobId", id);
    return `/saved-jobs?${params}`;
  }

  return (
    <JobResults
      jobs={filtered}
      selectedJob={selectedJob}
      hrefFor={hrefFor}
      subtitle={`${count} saved ${count === 1 ? "job" : "jobs"}`}
    />
  );
}
