import styles from "./site-footer.module.css";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <p>&#xA9; {year} Flint - a HackYourFuture Student Project</p>
    </footer>
  );
}
