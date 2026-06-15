import Link from 'next/link';
import { Logo } from './Logo';
import { getCurrentUser } from '@/server/auth/current-user';

export async function SiteHeader() {
  const user = await getCurrentUser();
  const dashHref = user?.role === 'coach' ? '/dashboard/coach' : '/dashboard';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6 border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050505]/20">
      <div className="w-full flex items-center justify-between">
        <Link href="/" aria-label="CoachConnect home">
          <Logo />
        </Link>
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-sm font-medium text-white/70">
          <Link href="/discover" className="hover:text-brand transition-colors">Find a Coach</Link>
          <Link href="/#how-it-works" className="hover:text-brand transition-colors">How it Works</Link>
          <Link href="/about" className="hover:text-brand transition-colors">About Us</Link>
          <Link href="/#become-coach" className="hover:text-brand transition-colors">Become a Coach</Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href={dashHref}
              className="bg-brand text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-dark transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-sm font-bold text-white hover:text-brand transition-colors">
                Log In
              </Link>
              <Link href="/signup" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
