import Link from 'next/link';
import { Logo } from './Logo';

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-surface py-12 mt-20">
      <div className="w-full px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <Logo />
        <nav className="flex items-center gap-8 text-sm text-white/50">
          <Link href="/#discover" className="hover:text-brand transition-colors">Find a Coach</Link>
          <Link href="/about" className="hover:text-brand transition-colors">About Us</Link>
          <Link href="/#become-coach" className="hover:text-brand transition-colors">Become a Coach</Link>
        </nav>
        <p className="text-white/40 text-sm">
          © 2026 CoachConnect Platform. All rights reserved. MVP Release.
        </p>
      </div>
    </footer>
  );
}
