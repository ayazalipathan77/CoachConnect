import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { TrackBackground } from "@/components/landing/TrackBackground";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturesScroll } from "@/components/landing/FeaturesScroll";
import { SportsShowcase } from "@/components/landing/SportsShowcase";
import { Testimonials } from "@/components/landing/Testimonials";
import { BecomeCoachTeaser } from "@/components/landing/BecomeCoachTeaser";
import { CoachDiscovery } from "@/components/landing/CoachDiscovery";
import { HashScrollOnMount } from "@/components/landing/HashScrollOnMount";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand selection:text-black">
      {/* Fixed global track background */}
      <TrackBackground />

      {/* Handles /#how-it-works links clicked from a different route. */}
      <HashScrollOnMount />

      <SiteHeader />

      {/* Main Content — order: Hero → Coaches (primary action) → Testimonials (trust,
          early) → How it Works → Disciplines (browse) → Services (deep engagement) →
          Become a Coach (teaser, full pitch lives at /become-a-coach).
          NOTE: no `overflow-hidden` here — it would break the sticky scroll-jacking
          in FeaturesScroll. Horizontal overflow is clipped by `body { overflow-x: clip }`. */}
      <main className="relative z-10 w-full">
        <Hero />
        <CoachDiscovery />
        <Testimonials />
        <HowItWorks />
        <SportsShowcase />
        <FeaturesScroll />
        <BecomeCoachTeaser />
      </main>

      <SiteFooter />
    </div>
  );
}
