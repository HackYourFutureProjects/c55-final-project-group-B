import { SpinnerIcon } from "@phosphor-icons/react/dist/ssr";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={`container ${styles.loading}`}>
      <div className={styles.spinner}>
        <SpinnerIcon size={64} />
      </div>
      <p className={styles.message}>Loading...</p>
    </div>
  );
}
