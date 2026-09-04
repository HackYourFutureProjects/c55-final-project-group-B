"use client";

import { HeartIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useCurrentUser } from "@/context/current-user-provider";
import { useSavedJobs } from "@/context/saved-jobs-provider";
import styles from "./save-job-button.module.css";

export default function SaveJobButton({ jobId }: { jobId: string }) {
  const { savedJobIds, toggleSaved } = useSavedJobs();
  const { user } = useCurrentUser();

  const saved = savedJobIds.has(jobId);
  const loggedOut = !user;

  // Only the button that was actually clicked animates; the other button for
  // the same job just changes color through the shared `saved` state.
  const [animation, setAnimation] = useState<"save" | "remove" | null>(null);

  function handleClick() {
    if (loggedOut) return;
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

  let ariaLabel = "";
  if (loggedOut) {
    ariaLabel = "Sign up or log in to save jobs.";
  } else if (saved) {
    ariaLabel = "Unsave job";
  } else if (!saved) {
    ariaLabel = "Save job";
  }

  return (
    <button
      type="button"
      className={`${styles.like} ${saved ? styles.save : ""} ${animationClass}`}
      title={loggedOut ? "Sign up or log in to save jobs." : undefined}
      aria-disabled={loggedOut}
      aria-label={ariaLabel}
      aria-pressed={saved}
      onClick={handleClick}
      onAnimationEnd={() => setAnimation(null)}
    >
      <HeartIcon size={20} weight={saved ? "fill" : "duotone"} />
    </button>
  );
}
