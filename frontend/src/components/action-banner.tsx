"use client";

import { useCurrentUser } from "@/context/current-user-provider";
import Link from "next/link";
import styles from "./action-banner.module.css";

export default function ActionBanner() {
  const { user } = useCurrentUser();

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.heading}>
          {user ? "Pick up where you left off!" : "Ready to strike a match?"}
        </h2>
        <p className={styles.message}>
          {user
            ? "Your saved jobs are waiting, and new roles landed today."
            : "Create an account to save the roles you like, or start browsing right away."}
        </p>
        <div className={styles.links}>
          <Link
            className={styles.primary}
            href={user ? "/saved-jobs" : "/signup"}
          >
            {user ? "Saved job" : "Sign up"}
          </Link>
          <Link className={styles.secondary} href="/jobs">
            Browse jobs
          </Link>
        </div>
      </div>
    </section>
  );
}
