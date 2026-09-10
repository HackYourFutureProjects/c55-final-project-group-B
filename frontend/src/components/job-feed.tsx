"use client";

import { useState, type ReactNode } from "react";
import JobResults from "./job-results";
import type { Job } from "@/lib/types";

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
  const selectedJob = jobs.find((j) => j.jobId === jobId) ?? jobs[0];

  function hrefFor(id: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    params.set("jobId", id);
    return `/jobs?${params}`;
  }

  return (
    <JobResults
      jobs={jobs}
      selectedJob={selectedJob}
      hrefFor={hrefFor}
      subtitle={subtitle}
    />
  );
}
