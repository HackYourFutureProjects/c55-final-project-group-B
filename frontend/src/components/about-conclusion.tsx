import Link from "next/link";
import styles from "./about-conclusion.module.css";

export default function AboutConclusion() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <h2 className={styles.heading}>Thank you!</h2>
        <p>
          Flint was made in four weeks as submission for our final project for
          HackYourFuture's program. A big thank you to the HackYourFuture team
          for their support, the tech leads who helped shape this project, and
          every instructor and volunteer mentor who guided us along the way.
        </p>
        <p>Shout out to the rest of the Cohort 55!</p>
        <Link
          href="https://github.com/HackYourFutureProjects/c55-final-project-group-B"
          target="_blank"
          className={`button ${styles.action}`}
        >
          Read the code
        </Link>
      </div>
    </section>
  );
}
