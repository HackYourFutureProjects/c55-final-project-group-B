"use client";

import { HeartIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/context/current-user-provider";
import { useSavedJobs } from "@/context/saved-jobs-provider";
import styles from "./save-job-button.module.css";
import Link from "next/link";

export default function SaveJobButton({ jobId }: { jobId: string }) {
  const { savedJobIds, toggleSaved } = useSavedJobs();
  const { user } = useCurrentUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const saved = savedJobIds.has(jobId);
  const loggedOut = !user;

  // Only the button that was actually clicked animates; the other button for
  // the same job just changes color through the shared `saved` state.
  const [animation, setAnimation] = useState<"save" | "remove" | null>(null);

  const [showLoginHint, setShowLoginHint] = useState(false);

  useEffect(() => {
    if (!showLoginHint) {
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setShowLoginHint(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowLoginHint(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLoginHint]);

  function handleClick() {
    if (loggedOut) {
      setShowLoginHint(true);
      return;
    }
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
    <span className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.like} ${saved ? styles.save : ""} ${animationClass}`}
        aria-disabled={loggedOut}
        aria-label={ariaLabel}
        aria-pressed={saved}
        onClick={handleClick}
        onAnimationEnd={() => setAnimation(null)}
      >
        <HeartIcon size={20} weight={saved ? "fill" : "duotone"} />
      </button>
      {showLoginHint && (
        <span className={styles.hint} role="status">
          Log in to save jobs
        </span>
      )}
    </span>
  );
}
