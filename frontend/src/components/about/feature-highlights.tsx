import {
  CodeSimpleIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PersonArmsSpreadIcon,
  PlantIcon,
  UserIcon,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import styles from "./feature-highlights.module.css";

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
      "Life can get busy sometimes. Keep the jobs that catch your interest for when you have the time for them.",
    icon: <HeartIcon size={24} weight="duotone" />,
    color: styles.swatchLove,
  },
  {
    title: "Build your profile",
    description:
      "Coming soon: tell us your skills and where you'd like to work, and Flint will put the best matches first.",
    icon: <UserIcon size={24} weight="duotone" />,
    color: styles.swatchGold,
  },
  {
    title: "Accessible by design",
    description:
      "Flint is for everyone. Labelled controls and keyboard navigation make it work just as well with a screen reader as with a mouse.",
    icon: <PersonArmsSpreadIcon size={24} weight="duotone" />,
    color: styles.swatchFoam,
  },
  {
    title: "Fresh jobs every day",
    description:
      "Our database is refreshed every day, so new postings show up as soon as they land.",
    icon: <PlantIcon size={24} weight="duotone" />,
    color: styles.swatchPine,
  },
  {
    title: "More ways to search",
    description:
      "Search by role, skill, company or location. Your next job is out there somewhere; let's find it.",
    icon: <MagnifyingGlassIcon size={24} weight="duotone" />,
    color: styles.swatchIris,
  },
  {
    title: "Free and open-source",
    description:
      "Flint is built for the open web, using open-source frameworks and libraries. Check us out on GitHub.",
    icon: <CodeSimpleIcon size={24} weight="duotone" />,
    color: styles.swatchRose,
  },
];

export default function FeatureHighlights() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <h2 className={styles.heading}>What Flint can do</h2>
        <p>
          Everything Flint can do, in one place. Search for roles, save the good
          ones, and jump straight to the employer when you're ready.
        </p>
        <ul className={styles.list}>
          {FEATURES.map((feature) => (
            <li key={feature.title} className={styles.item}>
              <div className={styles.top}>
                <span
                  aria-hidden="true"
                  className={`${styles.icon} ${feature.color}`}
                >
                  {feature.icon}
                </span>
                <h3 className={styles.title}>{feature.title}</h3>
              </div>
              <p className={styles.description}>{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
