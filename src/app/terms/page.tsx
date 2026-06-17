import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const metadata: Metadata = { title: "Coach Terms of Service — CoachConnect" };

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Platform overview",
    body: "CoachConnect is a marketplace that connects independent sports coaches with athletes. We provide booking, payments, and messaging tools, but coaching services are delivered solely by the coach. CoachConnect is not a party to the coaching relationship.",
  },
  {
    title: "Coach responsibilities",
    body: "Coaches must hold any qualifications, insurance, and clearances required to coach in their listed sports. You agree to deliver sessions professionally, on time, and as described in your listings, and to keep your availability accurate.",
  },
  {
    title: "Payment terms",
    body: "Client payments are held in escrow and released to the coach after a session is marked complete. CoachConnect retains a platform commission on each paid booking. Free intro sessions are limited per coach each calendar month.",
  },
  {
    title: "Cancellation policy",
    body: "Clients cancelling 48 hours or more before a session receive a full refund; 24–48 hours, a 50% refund; under 24 hours, no refund. Coaches who cancel confirmed bookings issue a full client refund and may receive a cancellation strike.",
  },
  {
    title: "Account suspension",
    body: "CoachConnect may pause or suspend accounts that repeatedly cancel, receive serious complaints, or breach these terms. Three cancellation strikes within 90 days may result in your coach profile being paused pending review.",
  },
  {
    title: "Governing law",
    body: "These terms are governed by the laws of England and Wales. Any disputes arising from your use of CoachConnect are subject to the exclusive jurisdiction of the courts of England and Wales.",
  },
];

export default function TermsPage() {
  const lastUpdated = new Date("2026-06-16").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteHeader />
      <main className="px-6 lg:px-12 pt-32 pb-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Coach Terms of Service</h1>
          <p className="text-white/40 text-sm mb-10">Last updated: {lastUpdated}</p>

          <div className="flex flex-col gap-8">
            {SECTIONS.map((s) => (
              <section key={s.title} className="bg-[#111111] border border-white/10 rounded-3xl p-6">
                <h2 className="font-bold text-lg mb-2 text-brand">{s.title}</h2>
                <p className="text-white/60 leading-relaxed text-sm">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
