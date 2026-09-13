"use client";

import { LockIcon, MailboxIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { useCurrentUser } from "@/context/current-user-provider";
import { ApiError, login } from "@/lib/auth";
import { isValidEmail } from "@/lib/validation";
import FieldError from "./field-error";
import styles from "./login-form.module.css";
import PasswordInput from "./password-input";

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useCurrentUser();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validEmail = isValidEmail(email);
  const emailError =
    emailTouched && !validEmail
      ? "Please enter a valid email address."
      : undefined;
  const passwordEmpty = password.length === 0;
  const passwordError =
    passwordTouched && passwordEmpty
      ? "Please enter your password."
      : undefined;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!validEmail || passwordEmpty) return;
    setError(undefined);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      setUser(user);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("That email and password don't match. Have another go?");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong on our end. Please try again in a moment.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form noValidate className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <div className={styles.label}>
          <MailboxIcon size={18} weight="duotone" aria-hidden="true" />
          <label htmlFor="email">Email</label>
        </div>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="user@example.com"
          autoComplete="username"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "email-error" : undefined}
        />
        <FieldError id="email-error" message={emailError} />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>
          <LockIcon size={18} weight="duotone" aria-hidden="true" />
          <label htmlFor="password">Password</label>
        </div>
        <PasswordInput
          name="password"
          id="password"
          placeholder="••••••••••"
          className={styles.input}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "password-error" : undefined}
        />
        <FieldError id="password-error" message={passwordError} />
      </div>

      <FieldError message={error} />

      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
