import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { ReactNode } from "react";
import styles from "./status-page.module.css";

type Variant = "success" | "warning" | "error";

type StatusPageProps = {
  icon: PhosphorIcon;
  variant: Variant;
  heading: string;
  children: ReactNode;
  actions?: ReactNode;
};

const iconClass: Record<Variant, string> = {
  success: styles.iconSuccess,
  warning: styles.iconWarning,
  error: styles.iconError,
};

export function StatusPage({
  icon: Icon,
  variant,
  heading,
  children,
  actions,
}: StatusPageProps) {
  return (
    <section className={styles.section}>
      <div className="container">
        <section className={styles.pane}>
          <div className={styles.card}>
            <Icon size={64} weight="duotone" className={iconClass[variant]} />
            <h1 className={styles.heading}>{heading}</h1>
          </div>
          <div className={styles.message}>
            {children}
            <div className={styles.buttons}>{actions}</div>
          </div>
        </section>
      </div>
    </section>
  );
}
