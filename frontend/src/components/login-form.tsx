"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { ApiError, login } from "@/lib/auth";
import { useCurrentUser } from "../context/current-user-provider";
import styles from "./login-form.module.css";

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useCurrentUser();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      const user = await login(email, password);
      setUser(user);
      router.push("/success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Invalid email or password.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          E-mail
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="user@example.com"
          required
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="**********"
          required
          className={styles.input}
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
