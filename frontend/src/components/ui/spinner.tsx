import { CircleNotchIcon } from "@phosphor-icons/react/ssr";
import styles from "./spinner.module.css";

export default function Spinner() {
  return (
    <div className={`container ${styles.loading}`}>
      <CircleNotchIcon size={64} weight="duotone" className={styles.spinner} />
      <p className={styles.message}>Loading...</p>
    </div>
  );
}
