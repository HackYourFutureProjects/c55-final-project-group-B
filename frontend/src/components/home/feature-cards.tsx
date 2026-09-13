import {
  ArrowSquareOutIcon,
  CompassIcon,
  HeartIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import styles from "./feature-cards.module.css";

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
};

const FEATURES: Feature[] = [
  {
    title: "Save jobs for later",
    description:
      "Life gets busy. Keep the roles that catch your eye and come back when you have time.",
    icon: <HeartIcon size={24} weight="duotone" />,
    color: styles.swatchLove,
  },
  {
    title: "Filter by city or province",
    description:
      "Narrow the list to where you actually want to work, from Amsterdam to Zeeland.",
    icon: <CompassIcon size={24} weight="duotone" />,
    color: styles.swatchPine,
  },
  {
    title: "Fresh jobs daily",
    description:
      "New roles land every day, so there is always something fresh to browse.",
    icon: <SparkleIcon size={24} weight="duotone" />,
    color: styles.swatchGold,
  },
  {
    title: "Straight to the source",
    description:
      "Every job links to the original posting, so you apply where the employer is looking.",
    icon: <ArrowSquareOutIcon size={24} weight="duotone" />,
    color: styles.swatchIris,
  },
];

export function FeatureCards() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {FEATURES.map((feature) => (
          <article key={feature.title} className={`card ${styles.feature}`}>
            <span
              aria-hidden="true"
              className={`${styles.icon} ${feature.color}`}
            >
              {feature.icon}
            </span>
            <h2 className={styles.title}>{feature.title}</h2>
            <p className={styles.body}>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
