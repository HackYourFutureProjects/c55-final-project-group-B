"use client";

import Link from "next/link";
import { useCurrentUser } from "@/context/current-user-provider";
import styles from "./hero-note.module.css";

export default function HeroNote() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <p className={styles.note}>
        No account yet?{" "}
        <Link href="/signup" className={styles.noteLink}>
          Sign up
        </Link>{" "}
        to save jobs.
      </p>
    );
  }

  if (!user) {
    return (
      <p className={styles.note}>
        No account yet?{" "}
        <Link href="/signup" className={styles.noteLink}>
          Sign up
        </Link>{" "}
        to save jobs.
      </p>
    );
  }

  return (
    <p className={styles.note}>
      Welcome back, <strong>{user.name}</strong>! Your{" "}
      <Link href="/saved-jobs" className={styles.noteLink}>
        saved jobs
      </Link>{" "}
      are one click away.
    </p>
  );
}
