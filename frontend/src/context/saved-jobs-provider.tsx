"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useCurrentUser } from "./current-user-provider";
import { getSavedJobs, saveJob, unsaveJob } from "@/lib/saved-jobs";

// Holds which job ids are saved, shared by every SaveJobButton on the page so
// the heart on a card and the heart in the details pane stay in sync.
type SavedJobsContextValue = {
  savedJobIds: Set<string>;
  toggleSaved: (jobId: string) => Promise<void>;
};

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null);

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const { user } = useCurrentUser();

  useEffect(() => {
    if (!user) {
      setSavedJobIds(new Set());
      return;
    }
    let stale = false;
    async function loadSavedJobs() {
      try {
        const savedJobs = await getSavedJobs();
        if (stale) return;
        const ids = savedJobs.map((job) => job.jobId);
        const savedIds = new Set(ids);
        setSavedJobIds(savedIds);
      } catch {
        // If /saved-jobs can't be reached, fallback to empty Set
        if (stale) return;
        setSavedJobIds(new Set());
      }
    }
    loadSavedJobs();

    return () => {
      stale = true;
    };
  }, [user]);

  function applyToggle(jobId: string) {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  }

  async function toggleSaved(jobId: string): Promise<void> {
    const wasSaved = savedJobIds.has(jobId);
    applyToggle(jobId);

    try {
      if (wasSaved) {
        await unsaveJob(jobId);
      } else {
        await saveJob(jobId);
      }
    } catch (err) {
      applyToggle(jobId);
      console.error(err); // TODO: show user save errors
    }
  }

  return (
    <SavedJobsContext.Provider value={{ savedJobIds, toggleSaved }}>
      {children}
    </SavedJobsContext.Provider>
  );
}

export function useSavedJobs() {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error("useSavedJobs must be used inside a SavedJobsProvider");
  }
  return context;
}
