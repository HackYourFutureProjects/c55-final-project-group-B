"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { ApiError, login } from "@/lib/auth";
import { useCurrentUser } from "@/context/current-user-provider";
import { MailboxIcon, LockIcon } from "@phosphor-icons/react";
import styles from "./login-form.module.css";

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useCurrentUser();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validEmail = /^\S+@\S+\.\S+$/.test(email);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailTouched(true);
    if (!validEmail) return;
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));

    try {
      const user = await login(email, password);
      setUser(user);
      router.push("/");
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

  const emailError =
    emailTouched && !validEmail ? "Please enter a valid e-mail address." : null;

  return (
    <form noValidate className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <div className={styles.label}>
          <MailboxIcon size={18} weight="duotone" />
          <label htmlFor="email">E-mail</label>
        </div>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="user@example.com"
          required
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
        />
        {emailError && <p className={styles.error}>{emailError}</p>}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>
          <LockIcon size={18} weight="duotone" />
          <label htmlFor="password">Password</label>
        </div>
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
