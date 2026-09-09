import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import styles from "./hero.module.css";
import HeroNote from "./hero-note";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <h1 className={styles.title}>
          Strike a <span className={styles.accent}>match</span>
          <span className={styles.accentDot}>.</span>
        </h1>

        <p className={styles.tagline}>Your next role is one spark away!</p>

        <div className={styles.search}>
          <SearchBar />
        </div>
        <HeroNote />
      </div>
    </section>
  );
}
