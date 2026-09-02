"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent, SubmitEvent, FocusEvent } from "react";
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
import { validate, passwordRules, isValidEmail } from "@/lib/validation";

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

  const [serrverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientErrors = validate(values);

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

    if (!passwordsMatch) {
      setServerErrors({ confirmPassword: "Passwords do not match." });
      return;
    }
    setIsSubmitting(true);

    try {
      await register(values.name, values.email, values.password);
      // Registration does not create a session, so log in right after and
      // cache the returned user; the header reads it to show the account menu.
      const user = await login(values.email, values.password);
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
          value={values.name}
          onChange={handleChange}
          onBlur={markTouched}
        />
        {serrverErrors.name && (
          <p className={styles.error}>{serrverErrors.name}</p>
        )}
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
          required
          className={styles.input}
          value={values.email}
          onChange={handleChange}
          onBlur={markTouched}
        />
        {serrverErrors.email && (
          <p className={styles.error}>{serrverErrors.email}</p>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>
          <LockOpenIcon size={18} weight="duotone" />
          <label htmlFor="password">Password</label>
        </div>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="**********"
          minLength={8}
          required
          value={values.password}
          onChange={handleChange}
          onFocus={markTouched}
          className={styles.input}
        />

        {touched.password && (
          <ul className={styles.rules}>
            {passwordRules.map((rule) => {
              const passed = rule.test(values.password);
              return (
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
              );
            })}
          </ul>
        )}

        {serrverErrors.password && (
          <p className={styles.error}>{serrverErrors.password}</p>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>
          <LockIcon size={18} weight="duotone" />
          <label htmlFor="confirmPassword">Confirm password</label>
        </div>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder="**********"
          minLength={8}
          required
          value={values.confirmPassword}
          onChange={handleChange}
          className={styles.input}
          onBlur={markTouched}
        />
        {serrverErrors.confirmPassword && (
          <p className={styles.error}>{serrverErrors.confirmPassword}</p>
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
