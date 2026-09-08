import TeamProfile from "@/components/team-profile";
import dagim from "@/assets/profiles/dagim.png";
import hannah from "@/assets/profiles/hannah.jpg";
import jana from "@/assets/profiles/jana.png";
import jawad from "@/assets/profiles/jawad.jpg";
import marah from "@/assets/profiles/marah.png";
import salem from "@/assets/profiles/salem.jpg";
import TechStack from "@/components/tech-stack";
import styles from "./page.module.css";
import TeamSection from "@/components/team-section";
import FeatureHighlights from "@/components/feature-highlights";

export default function AboutPage() {
  return (
    <div className="container">
      <FeatureHighlights />
      <TeamSection />
      <TechStack />
    </div>
  );
}
