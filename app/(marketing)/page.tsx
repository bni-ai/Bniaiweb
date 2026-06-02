import { CtaSection } from "../../components/landing/cta";
import { FeaturesSection } from "../../components/landing/features";
import { HeroSection } from "../../components/landing/hero";
import { StatsSection } from "../../components/landing/stats";

export default function MarketingHomePage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CtaSection />
    </main>
  );
}
