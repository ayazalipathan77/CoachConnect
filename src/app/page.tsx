import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { TrackBackground } from "@/components/landing/TrackBackground";
import { Hero } from "@/components/landing/Hero";
import { FeaturesScroll } from "@/components/landing/FeaturesScroll";
import { SportsShowcase } from "@/components/landing/SportsShowcase";
import { Testimonials } from "@/components/landing/Testimonials";
import { CoachDiscovery } from "@/components/landing/CoachDiscovery";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand selection:text-black">
      {/* Fixed global track background */}
      <TrackBackground />

      <SiteHeader />

      {/* Main Content — order: Hero → Coaches → Services → Disciplines → Testimonials.
          NOTE: no `overflow-hidden` here — it would break the sticky scroll-jacking
          in FeaturesScroll. Horizontal overflow is clipped by `body { overflow-x: clip }`. */}
      <main className="relative z-10 w-full">
        <Hero />
        <CoachDiscovery />
        <FeaturesScroll />
        <SportsShowcase />
        <Testimonials />
      </main>

      <SiteFooter />
    </div>
  );
}
