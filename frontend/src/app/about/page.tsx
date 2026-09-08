import TeamProfile from "@/components/team-profile";
import dagim from "@/assets/profiles/dagim.png";
import hannah from "@/assets/profiles/hannah.jpg";
import jana from "@/assets/profiles/jana.png";
import jawad from "@/assets/profiles/jawad.jpg";
import marah from "@/assets/profiles/marah.png";
import salem from "@/assets/profiles/salem.jpg";
import styles from "./page.module.css";
import TechStack from "@/components/tech-stack";

export default function AboutPage() {
  return (
    <div className="container">
      <section className={styles.team}>
        <h2>Meet The Team</h2>
        <div className={styles.users}>
          <TeamProfile
            photo={jawad}
            name="Jawad Al Bdiwi"
            role="Frontend"
            github="https://github.com/jivvyjams"
            linkedin="https://www.linkedin.com/in/dagim-h-selassie-7aa9ab1b4/"
          />
          <TeamProfile
            photo={salem}
            name="Salem Ba-Rabuod"
            role="Backend"
            github="https://github.com/Barboud"
            linkedin="https://www.linkedin.com/in/salem-ba-rabuod/"
          />
          <TeamProfile
            photo={dagim}
            name="Dagim H.Selassie"
            role="Backend"
            github="https://github.com/Unlock7"
            linkedin="https://www.linkedin.com/in/dagim-h-selassie-7aa9ab1b4/"
          />
          <TeamProfile
            photo={marah}
            name="Marah Aboghanem"
            role="Data"
            github="https://github.com/mareh-aboghanem"
            linkedin="https://github.com/mareh-aboghanem"
          />
          <TeamProfile
            photo={hannah}
            name="Hannah Nyongo"
            role="Data"
            github="https://github.com/hannahwn"
            linkedin="https://www.linkedin.com/in/hannah-nyongo-a0b1872a8/"
          />
          <TeamProfile
            photo={jana}
            name="Jana Gombitová"
            role="Project Manager"
            github="https://github.com/janagombitova"
            linkedin="https://www.linkedin.com/in/jana-gombitova-42b08394/"
          />
        </div>
      </section>
      <section>
        <TechStack />
      </section>
    </div>
  );
}
