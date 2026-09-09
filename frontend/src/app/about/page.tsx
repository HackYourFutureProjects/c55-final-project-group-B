import FeatureHighlights from "@/components/feature-highlights";
import TeamSection from "@/components/team-section";
import TechStack from "@/components/tech-stack";
import styles from "./page.module.css";
import AboutIntro from "@/components/about-intro";

export default function AboutPage() {
  return (
    <div className={`container ${styles.page}`}>
      <AboutIntro />
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
