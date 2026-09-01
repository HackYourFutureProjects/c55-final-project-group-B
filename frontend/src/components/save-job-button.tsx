"use client";

import { HeartIcon } from "@phosphor-icons/react";
import { useState } from "react";
import styles from "./save-job-button.module.css";
import { useSavedJobs } from "../context/saved-jobs-provider";

export default function SaveJobButton({ jobId }: { jobId: string }) {
  const { savedJobIds, toggleSaved } = useSavedJobs();
  const saved = savedJobIds.has(jobId);

  // Only the button that was actually clicked animates; the other button for
  // the same job just changes color through the shared `saved` state.
  const [animation, setAnimation] = useState<"save" | "remove" | null>(null);

  function handleClick() {
    setAnimation(saved ? "remove" : "save");
    toggleSaved(jobId);
  }

  let animationClass = "";
  if (animation === "save") {
    animationClass = styles.animateSave;
  }
  if (animation === "remove") {
    animationClass = styles.animateRemove;
  }

  return (
    <button
      type="button"
      className={`${styles.like} ${saved ? styles.save : ""} ${animationClass}`}
      aria-label={saved ? "Unsave job" : "Save job"}
      aria-pressed={saved}
      onClick={handleClick}
      onAnimationEnd={() => setAnimation(null)}
    >
      <HeartIcon size={20} weight={saved ? "fill" : "bold"} />
    </button>
  );
}
