"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { ApiError, login, register } from "@/lib/auth";
import { useCurrentUser } from "@/context/current-user-provider";
import {
  IdentificationCardIcon,
  MailboxIcon,
  LockOpenIcon,
  LockIcon,
  CheckIcon,
  XIcon,
} from "@phosphor-icons/react";
import styles from "./signup-form.module.css";

const passwordRules = [
  { label: "Minimum 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "One uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw: string) => /[0-9]/.test(pw) },
];

export default function SignupForm() {
  const router = useRouter();
  const { setUser } = useCurrentUser();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("";)
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordsMatch = password === confirmPassword;

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
        <div className={styles.label}>
          <IdentificationCardIcon size={18} weight="duotone" />
          <label htmlFor="name">Name</label>
        </div>
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
        <div className={styles.label}>
          <MailboxIcon size={18} weight="duotone" />
          <label htmlFor="name">E-mail</label>
        </div>
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
        <div className={styles.label}>
          <LockOpenIcon size={18} weight="duotone" />
          <label htmlFor="name">Password</label>
        </div>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="**********"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setPasswordTouched(true)}
          className={styles.input}
        />

        {passwordTouched &&
          passwordRules.map((rule) => {
            const passed = rule.test(password);
            return (
              <ul className={styles.rules}>
                <li
                  key={rule.label}
                  className={passed ? styles.rulePassed : styles.ruleFailed}
                >
                  {passed ? (
                    <CheckIcon weight="duotone" />
                  ) : (
                    <XIcon weight="duotone" />
                  )}
                  {rule.label}
                </li>
              </ul>
            );
          })}

        {fieldErrors.password && (
          <p className={styles.error}>{fieldErrors.password}</p>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>
          <LockIcon size={18} weight="duotone" />
          <label htmlFor="name">Confirm password</label>
        </div>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder="**********"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
