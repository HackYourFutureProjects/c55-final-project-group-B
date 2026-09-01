import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  CompassIcon,
} from "@phosphor-icons/react/ssr";
import styles from "./feature-cards.module.css";

const FEATURES = [
  {
    title: "For job seekers",
    body: "Your next dream job is waiting for you, so what are you waiting for?",
    icon: <BriefcaseIcon size={32} />,
    color: styles.swatchPine,
  },
  {
    title: "For employers",
    body: "Your next great hire is already browsing Flint. Post a role and start reviewing today.",
    icon: <BuildingOfficeIcon size={32} />,
    color: styles.swatchIris,
  },
  {
    title: "Search your region",
    body: "Filter by city or province and search roles across the country.",
    icon: <CompassIcon size={32} />,
    color: styles.swatchRose,
  },
];

export function FeatureCards() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {FEATURES.map((feature) => (
          <article key={feature.title} className={`card ${styles.feature}`}>
            <span aria-hidden className={`${styles.icon} ${feature.color}`}>
              {feature.icon}
            </span>
            <h2 className={styles.title}>{feature.title}</h2>
            <p className={styles.body}>{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
