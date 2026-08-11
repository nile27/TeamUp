import { LandingHeader } from "./landing-header";
import { HeroSection } from "./hero-section";
import { ProblemSection } from "./problem-section";
import { FlowSection } from "./flow-section";
import { ParticipationSection } from "./participation-section";
import { PlannerSection } from "./planner-section";
import { FinalCtaSection } from "./final-cta-section";
import { LandingFooter } from "./landing-footer";

export function LandingContainer() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <FlowSection />
        <ParticipationSection />
        <PlannerSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
