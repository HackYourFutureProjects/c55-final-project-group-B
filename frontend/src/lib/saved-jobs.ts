import { readError, sendJson } from "./auth";
import type { SavedJob } from "./types";

export async function saveJob(jobId: string): Promise<void> {
  const res = await sendJson("POST", "/api/saved-jobs", { jobId });
  if (!res.ok) {
    throw await readError(res);
  }
}

export async function unsaveJob(jobId: string): Promise<void> {
  const res = await sendJson("DELETE", `/api/saved-jobs/${jobId}`);
  if (!res.ok) {
    throw await readError(res);
  }
}

export async function getSavedJobs(): Promise<SavedJob[]> {
  const res = await fetch("/api/saved-jobs");
  if (!res.ok) {
    throw await readError(res);
  }
  return res.json();
}
