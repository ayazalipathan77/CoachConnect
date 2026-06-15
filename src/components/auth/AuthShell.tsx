import Link from 'next/link';
import { Logo } from '@/components/landing/Logo';

/**
 * Full-bleed split auth layout: a brand panel with the track motif on the left,
 * the form on the right. Shared by /login and /signup.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-white/10">
        <svg className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 900">
          <defs>
            <linearGradient id="authTrack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[-80, -40, 40, 80].map((dx) => (
            <path key={dx} d={`M ${300 + dx},-50 C ${480 + dx},250 ${120 + dx},550 ${300 + dx},950`} stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" />
          ))}
          <path d="M 300,-50 C 480,250 120,550 300,950" stroke="url(#authTrack)" strokeWidth="4" fill="none" />
        </svg>
        <Link href="/" className="relative z-10"><Logo /></Link>
        <div className="relative z-10">
          <h2 className="font-display font-bold text-5xl tracking-tighter leading-[1.05]">
            Master your <span className="text-brand italic">discipline.</span>
          </h2>
          <p className="mt-4 text-white/60 max-w-sm text-lg">
            Join 50,000+ athletes training with the right coach beside them.
          </p>
        </div>
        <div className="relative z-10 text-white/40 text-sm">© 2026 CoachConnect</div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16">
        <div className="lg:hidden mb-10"><Link href="/"><Logo /></Link></div>
        <div className="w-full max-w-md mx-auto">
          <h1 className="font-display font-bold text-4xl tracking-tight mb-2">{title}</h1>
          <p className="text-white/50 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
