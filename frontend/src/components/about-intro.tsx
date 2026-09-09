import styles from "./about-intro.module.css";

export default function AboutIntro() {
  return (
    <section className={styles.intro}>
      <div className="container">
        <h1>About Flint</h1>
        <p>
          Flint is a job search platform based in the Netherlands, built by five
          trainees for our final project. As we're all navigating the job market
          in this shifting landscape, we wanted to create a platform that would
          help us.
        </p>
        <p>
          The name Flint comes from the hard stone that was historically struck
          to create fires. In a similar vein, our platform creates a spark for
          your new role.
        </p>
      </div>
    </section>
  );
}
