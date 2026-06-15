import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { TrackBackground } from "@/components/landing/TrackBackground";
import { AboutContent } from "@/components/landing/AboutContent";

export const metadata: Metadata = {
  title: "About Us — CoachConnect",
  description:
    "CoachConnect turns athletic potential into performance. Discover our story, our values, and the track that runs through everything we build.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand selection:text-black">
      <TrackBackground />
      <SiteHeader />
      <AboutContent />
      <SiteFooter />
    </div>
  );
}
