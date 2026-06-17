import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { TrackBackground } from "@/components/landing/TrackBackground";
import { BecomeCoach } from "@/components/landing/BecomeCoach";

export const metadata: Metadata = {
  title: "Become a Coach — CoachConnect",
  description:
    "Turn your expertise into income. Set your own schedule and rate, build trust with a verified badge, and let CoachConnect handle bookings and payments.",
};

export default function BecomeACoachPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand selection:text-black">
      <TrackBackground />
      <SiteHeader />
      <BecomeCoach />
      <SiteFooter />
    </div>
  );
}
