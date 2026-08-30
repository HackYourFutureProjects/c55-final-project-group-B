"use client";

import { HeartIcon } from "@phosphor-icons/react";
import styles from "./save-job-button.module.css";
import { useSavedJobs } from "./saved-jobs-provider";

export default function SaveJobButton({ jobId }: { jobId: string }) {
  const { savedJobIds, toggleSaved } = useSavedJobs();
  const saved = savedJobIds.has(jobId);

  return (
    <button
      type="button"
      className={`${styles.like} ${saved ? styles.save : styles.remove}`}
      aria-label={saved ? "Unsave job" : "Save job"}
      aria-pressed={saved}
      onClick={() => toggleSaved(jobId)}
    >
      <HeartIcon size={20} weight={saved ? "fill" : "bold"} />
    </button>
  );
}
