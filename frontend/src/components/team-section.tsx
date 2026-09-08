import { StaticImageData } from "next/image";
import TeamProfile from "@/components/team-profile";
import dagim from "@/assets/profiles/dagim.png";
import hannah from "@/assets/profiles/hannah.jpg";
import jana from "@/assets/profiles/jana.png";
import jawad from "@/assets/profiles/jawad.jpg";
import marah from "@/assets/profiles/marah.png";
import salem from "@/assets/profiles/salem.jpg";
import styles from "./team-section.module.css";

type Member = {
  photo: StaticImageData;
  name: string;
  role: string;
  github: string;
  linkedin: string;
};

const MEMBERS: Member[] = [
  {
    photo: jawad,
    name: "Jawad Al Bdiwi",
    role: "Frontend",
    github: "https://github.com/jivvyjams",
    linkedin: "https://www.linkedin.com/in/jawad-al-bdiwi/",
  },
  {
    photo: salem,
    name: "Salem Ba-Rabuod",
    role: "Backend",
    github: "https://github.com/Barboud",
    linkedin: "https://www.linkedin.com/in/salem-ba-rabuod/",
  },
  {
    photo: dagim,
    name: "Dagim H.Selassie",
    role: "Backend",
    github: "https://github.com/Unlock7",
    linkedin: "https://www.linkedin.com/in/dagim-h-selassie-7aa9ab1b4/",
  },
  {
    photo: marah,
    name: "Marah Aboghanem",
    role: "Data",
    github: "https://github.com/mareh-aboghanem",
    linkedin: "https://www.linkedin.com/in/mareh-aboghanem/",
  },
  {
    photo: hannah,
    name: "Hannah Nyongo",
    role: "Data",
    github: "https://github.com/hannahwn",
    linkedin: "https://www.linkedin.com/in/hannah-nyongo-a0b1872a8/",
  },
  {
    photo: jana,
    name: "Jana Gombitová",
    role: "Project Manager",
    github: "https://github.com/janagombitova",
    linkedin: "https://www.linkedin.com/in/jana-gombitova-42b08394/",
  },
];

export default function TeamSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Meet the Team</h2>
      <p className={styles.intro}>
        Five trainees across frontend, backend, and data, guided throughout by
        Jana, our volunteer project manager and the reason any of it shipped on
        time. We all come from different backgrounds and careers, and Flint is
        what happened when we put all our ideas together.Say hello on LinkedIn,
        we're all job hunting too.
      </p>
      <div className={styles.grid}>
        {MEMBERS.map((member) => (
          <TeamProfile key={member.name} {...member} />
        ))}
      </div>
    </section>
  );
}
