import TeamProfile from "@/components/team-profile";
import dagim from "@/assets/profiles/dagim.png";
import hannah from "@/assets/profiles/hannah.jpg";
import jana from "@/assets/profiles/jana.png";
import jawad from "@/assets/profiles/jawad.jpg";
import marah from "@/assets/profiles/marah.png";
import salem from "@/assets/profiles/salem.jpg";
import TechStack from "@/components/tech-stack";
import TeamSection from "@/components/team-section";
import FeatureHighlights from "@/components/feature-highlights";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <div className={`container ${styles.page}`}>
      <section className={styles.intro}>
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
      </section>
      <FeatureHighlights />
      <TeamSection />
      <TechStack />
      <p>
        This web app was made as submission for our final project for
        HackYourFuture's program. A big thank you to the HackYourFuture team for
        their support, the tech leads who helped shape this project, all the
        instructors and volunteer mentors who guided us along the way. Shout out
        to the rest of the Cohort 55!
      </p>
    </div>
  );
}
