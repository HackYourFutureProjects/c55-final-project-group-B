import { ExclamationMarkIcon } from "@phosphor-icons/react";
import styles from "./field-error.module.css";

export default function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className={styles.error}>
      <ExclamationMarkIcon size={18} weight="duotone" />
      <p className={styles.message} role="alert">
        {message}
      </p>
    </div>
  );
}
