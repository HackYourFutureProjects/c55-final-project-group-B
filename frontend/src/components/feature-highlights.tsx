import {
  CodeSimpleIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PersonArmsSpreadIcon,
  PlantIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
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
      "Complete your profile to get skill-based job matching, highlighting the most suitable roles first.",
    icon: <UserIcon size={24} weight="duotone" />,
    color: styles.swatchGold,
  },
  {
    title: "Accessible by design",
    description:
      "Flint is for everyone. Labelled controls and keyboard navigation makes it work just as well with a screen reader as with a mouse.",
    icon: <PersonArmsSpreadIcon size={24} weight="duotone" />,
    color: styles.swatchFoam,
  },
  {
    title: "Fresh listings automatically",
    description:
      "Our database is refreshed daily, showing you the most recent listings first to give you a head start.",
    icon: <PlantIcon size={24} weight="duotone" />,
    color: styles.swatchPine,
  },
  {
    title: "More ways to search",
    description:
      "Search by role, skill, company name, or location. The perfect job is waiting for you to find it.",
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
      <h2 className={styles.heading}>Feature Set</h2>
      <p>
        Everything Flint can do, in one place. Search for roles, save the good
        ones, and let your profile do some of the looking for you.
      </p>
      <ul className={styles.list}>
        {FEATURES.map((feature) => (
          <li key={feature.title} className={styles.item}>
            <div className={styles.top}>
              <span aria-hidden className={`${styles.icon} ${feature.color}`}>
                {feature.icon}
              </span>
              <h3 className={styles.title}>{feature.title}</h3>
            </div>
            <p className={styles.description}>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
