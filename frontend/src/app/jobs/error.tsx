"use client";

import styles from "./error.module.css";

export default function JobsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className={`container ${styles.error}`}>
      <h2>Something went wrong...</h2>
      <p>{error.message}</p>
      <button type="button" onClick={reset} className="button">
        Try again
      </button>
    </div>
  );
}
