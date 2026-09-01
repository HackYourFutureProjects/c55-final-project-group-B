"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

// Holds which job ids are saved, shared by every SaveJobButton on the page so
// the heart on a card and the heart in the details pane stay in sync.
type SavedJobsContextValue = {
  savedJobIds: Set<string>;
  toggleSaved: (jobId: string) => void;
};

const SavedJobsContext = createContext<SavedJobsContextValue | null>(null);

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  function toggleSaved(jobId: string) {
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
