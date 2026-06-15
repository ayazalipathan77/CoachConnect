import { MarketingNav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { SportsMarquee } from "@/components/marketing/SportsMarquee";
import { Stats } from "@/components/marketing/Stats";
import { CoachShowcase } from "@/components/marketing/CoachShowcase";
import { StickyStory } from "@/components/marketing/StickyStory";
import { Bento } from "@/components/marketing/Bento";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { MarketingFooter } from "@/components/marketing/Sections";
import { CursorGlow } from "@/components/motion/CursorGlow";
import { Grain } from "@/components/motion/Grain";

export default function HomePage() {
  return (
    <>
      <CursorGlow />
      <Grain />
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <SportsMarquee />
        <Stats />
        <CoachShowcase />
        <StickyStory />
        <Bento />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </>
  );
}
