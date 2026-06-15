import { Logo } from "@/components/landing/Logo";
import { TrackBackground } from "@/components/landing/TrackBackground";
import { Hero } from "@/components/landing/Hero";
import { FeaturesScroll } from "@/components/landing/FeaturesScroll";
import { SportsShowcase } from "@/components/landing/SportsShowcase";
import { Testimonials } from "@/components/landing/Testimonials";
import { CoachDiscovery } from "@/components/landing/CoachDiscovery";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand selection:text-black">
      {/* Fixed global navigation track background */}
      <TrackBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050505]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-sm font-medium text-white/70">
            <a href="#discover" className="hover:text-brand transition-colors">Find a Coach</a>
            <a href="#how-it-works" className="hover:text-brand transition-colors">How it Works</a>
            <a href="#become-coach" className="hover:text-brand transition-colors">Become a Coach</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm font-bold text-white hover:text-brand transition-colors">
              Log In
            </button>
            <button className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full overflow-hidden">
        <Hero />
        <FeaturesScroll />
        <SportsShowcase />
        <Testimonials />
        <CoachDiscovery />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-surface py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <p className="text-white/40 text-sm">
            © 2026 CoachConnect Platform. All rights reserved. MVP Release.
          </p>
        </div>
      </footer>
    </div>
  );
}
