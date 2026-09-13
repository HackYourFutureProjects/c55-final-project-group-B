import AboutConclusion from "@/components/about/about-conclusion";
import AboutIntro from "@/components/about/about-intro";
import FeatureHighlights from "@/components/about/feature-highlights";
import TeamSection from "@/components/about/team-section";
import TechStack from "@/components/about/tech-stack";

export const metadata = { title: "About" };

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
