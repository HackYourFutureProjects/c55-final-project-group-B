"use client";

import {
  IdentificationCardIcon,
  LockIcon,
  LockOpenIcon,
  MailboxIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FocusEvent, SubmitEvent } from "react";
import { useState } from "react";
import { useCurrentUser } from "@/context/current-user-provider";
import { ApiError, register } from "@/lib/auth";
import { validate } from "@/lib/validation";
import FieldError from "./field-error";
import PasswordInput from "./password-input";
import PasswordChecklist from "./password-checklist";
import styles from "./signup-form.module.css";

export default function SignupForm() {
  const router = useRouter();
  const { setUser } = useCurrentUser();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clientErrors = validate(values);

  function errorFor(field: keyof typeof values): string | undefined {
    return touched[field]
      ? (clientErrors[field] ?? serverErrors[field])
      : undefined;
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function markTouched(e: FocusEvent<HTMLInputElement>) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setServerErrors({});
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    if (Object.keys(clientErrors).length > 0) return;
    setIsSubmitting(true);

    try {
      const user = await register(values.name, values.email, values.password);
      setUser(user);
      router.push("/success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setServerErrors({ email: err.message }); // "Email is already registered"
      } else if (
        err instanceof ApiError &&
        Object.keys(err.fieldErrors).length > 0
      ) {
        setServerErrors(err.fieldErrors); // 400 validation messages per field
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
    <form noValidate className={styles.form} onSubmit={handleSubmit}>
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
          maxLength={100}
          className={styles.input}
          value={values.name}
          onChange={handleChange}
          onBlur={markTouched}
        />
        <FieldError message={errorFor("name")} />
      </div>

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
          className={styles.input}
          value={values.email}
          onChange={handleChange}
          onBlur={markTouched}
        />
        <FieldError message={errorFor("email")} />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>
          <LockOpenIcon size={18} weight="duotone" />
          <label htmlFor="password">Password</label>
        </div>
        <PasswordInput
          name="password"
          id="password"
          placeholder="••••••••••"
          className={styles.input}
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          onFocus={markTouched}
        />
        {touched.password && <PasswordChecklist password={values.password} />}
        <FieldError message={serverErrors.password} />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>
          <LockIcon size={18} weight="duotone" />
          <label htmlFor="confirmPassword">Confirm password</label>
        </div>
        <PasswordInput
          name="confirmPassword"
          id="confirmPassword"
          placeholder="••••••••••"
          className={styles.input}
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={markTouched}
        />
        <FieldError message={errorFor("confirmPassword")} />
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
