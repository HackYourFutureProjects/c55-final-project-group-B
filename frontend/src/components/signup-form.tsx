"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { ApiError, login, register } from "@/lib/auth";
import { useCurrentUser } from "../context/current-user-provider";
import styles from "./signup-form.module.css";

export default function SignupForm() {
  const router = useRouter();
  const { setUser } = useCurrentUser();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      // Registration does not create a session, so log in right after and
      // cache the returned user; the header reads it to show the account menu.
      const user = await login(email, password);
      setUser(user);
      router.push("/success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFieldErrors({ email: err.message }); // "Email is already registered"
      } else if (
        err instanceof ApiError &&
        Object.keys(err.fieldErrors).length > 0
      ) {
        setFieldErrors(err.fieldErrors); // 400 validation messages per field
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
        <label htmlFor="name" className={styles.label}>
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          autoComplete="name"
          placeholder="Jane Smith"
          minLength={2}
          maxLength={100}
          required
          className={styles.input}
        />
        {fieldErrors.name && <p className={styles.error}>{fieldErrors.name}</p>}
      </div>

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
        {fieldErrors.email && (
          <p className={styles.error}>{fieldErrors.email}</p>
        )}
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
          minLength={8}
          required
          className={styles.input}
        />
        <p className={styles.hint}>
          Must contain at least an uppercase letter, a lowercase letter and a
          number.
        </p>
        {fieldErrors.password && (
          <p className={styles.error}>{fieldErrors.password}</p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Confirm password
        </label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder="**********"
          minLength={8}
          required
          className={styles.input}
        />
        {fieldErrors.confirmPassword && (
          <p className={styles.error}>{fieldErrors.confirmPassword}</p>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? "Signing up…" : "Sign up"}
      </button>
    </form>
  );
}
