import AboutConclusion from "@/components/about-conclusion";
import AboutIntro from "@/components/about-intro";
import FeatureHighlights from "@/components/feature-highlights";
import TeamSection from "@/components/team-section";
import TechStack from "@/components/tech-stack";

export default function AboutPage() {
  return (
    <>
      <AboutIntro />
      <FeatureHighlights />
      <TeamSection />
      <TechStack />
      <AboutConclusion />
    </>
  );
}
