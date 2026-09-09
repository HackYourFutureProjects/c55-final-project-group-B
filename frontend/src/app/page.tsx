import { FeatureCards } from "@/components/feature-cards";
import { Hero } from "@/components/hero";
import ProofStrip from "@/components/proof-strip";

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <FeatureCards />
    </>
  );
}
