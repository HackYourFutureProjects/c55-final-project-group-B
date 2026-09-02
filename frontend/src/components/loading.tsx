import { CircleNotchIcon } from "@phosphor-icons/react/ssr";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={`container ${styles.loading}`}>
      <CircleNotchIcon size={64} weight="duotone" className={styles.spinner} />
      <p className={styles.message}>Loading...</p>
    </div>
  );
}
