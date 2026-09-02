import styles from "./field-error.module.css";

export default function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className={styles.error} role="alert">
      {message}
    </p>
  );
}
