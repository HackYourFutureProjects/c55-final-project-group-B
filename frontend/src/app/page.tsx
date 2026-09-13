import ActionBanner from "@/components/home/action-banner";
import { FeatureCards } from "@/components/home/feature-cards";
import { Hero } from "@/components/home/hero";
import ProofStrip from "@/components/home/proof-strip";

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <FeatureCards />
      <ActionBanner />
    </>
  );
}
