"use client";

import { HeartIcon } from "@phosphor-icons/react";
import { useState } from "react";
import styles from "./save-job-button.module.css";

export default function SaveJobButton() {
  const [saved, setSaved] = useState(false);
  function handleClick() {
    setSaved((prev) => !prev);
  }

  return (
    <button
      type="button"
      className={`${styles.like} ${saved ? styles.save : styles.remove}`}
      aria-label={saved ? "Unsave job" : "Save job"}
      aria-pressed={saved}
      onClick={handleClick}
    >
      <HeartIcon size={20} weight={saved ? "fill" : "bold"} />
    </button>
  );
}
