import styles from "./feature-cards.module.css";

const FEATURES = [
  {
    title: "For job seekers",
    body: "Your next dream job is waiting for you, so what are you waiting for?",
    swatch: styles.swatchPine,
  },
  {
    title: "For employers",
    body: "Your next great hire is already browsing Flint. Post a role and start reviewing today.",
    swatch: styles.swatchIris,
  },
  {
    title: "Search your region",
    body: "Filter by city or province and search roles across the country.",
    swatch: styles.swatchRose,
  },
];

export function FeatureCards() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {FEATURES.map((feature) => (
          <article key={feature.title} className={`card ${styles.feature}`}>
            <span
              aria-hidden
              className={`${styles.swatch} ${feature.swatch}`}
            />
            <h2 className={styles.title}>{feature.title}</h2>
            <p className={styles.body}>{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
