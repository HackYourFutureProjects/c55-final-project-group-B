import { ExclamationMarkIcon } from "@phosphor-icons/react/ssr";
import styles from "./field-error.module.css";

// `id` lets an input point at this message with `aria-describedby`.
export default function FieldError({
  id,
  message,
}: {
  id?: string;
  message?: string;
}) {
  if (!message) return null;
  return (
    <div id={id} className={styles.error}>
      <ExclamationMarkIcon size={18} weight="duotone" aria-hidden="true" />
      <p className={styles.message} role="alert">
        {message}
      </p>
    </div>
  );
}
