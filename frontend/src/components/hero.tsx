import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <h1 className={styles.title}>
          Find your next <span className={styles.accent}>role</span>
          <span className={styles.accentDot}>.</span>
        </h1>

        <p className={styles.tagline}>
          Thousands of roles across the Netherlands to explore!
        </p>

        <div className={styles.search}>
          <SearchBar />
        </div>

        <p className={styles.note}>
          Not a user yet?{" "}
          <Link href="/signup" className={styles.noteLink}>
            Sign up
          </Link>{" "}
          for personalized results.
        </p>
      </div>
    </section>
  );
}
