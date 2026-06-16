'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

const NAV_LINKS = [
  { label: 'Find a Coach', href: '/discover' },
  { label: 'How it Works', href: '/#how-it-works' },
  { label: 'About Us', href: '/about' },
  { label: 'Become a Coach', href: '/#become-coach' },
];

export function MobileNav({
  user,
  dashHref,
}: {
  user: { name?: string | null; email: string; role: string } | null;
  dashHref: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function close() { setOpen(false); }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-white/70 hover:text-brand hover:border-brand/30 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Always-rendered overlay + drawer — visibility driven by CSS transitions */}
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          onClick={close}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(0,0,0,0.75)',
            transition: 'opacity 0.3s ease',
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
          }}
        />

        {/* Drawer */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 70,
            width: '85vw',
            maxWidth: '384px',
            backgroundColor: '#0a0a0a',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            transform: open ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <Logo />
            <button
              onClick={close}
              aria-label="Close navigation menu"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-white/60 hover:text-brand hover:border-brand/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col px-4 py-6 gap-1 flex-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/70 font-medium hover:text-white hover:bg-white/5 transition-colors"
              >
                {link.label}
                <ArrowRight className="w-4 h-4 opacity-30" />
              </Link>
            ))}
          </nav>

          {/* Auth CTA */}
          <div className="px-4 pb-8 pt-4 border-t border-white/10 flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2">
                  <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider border border-brand/20">
                    {user.role}
                  </span>
                  <span className="text-white/60 text-sm truncate">{user.name ?? user.email}</span>
                </div>
                <Link
                  href={dashHref}
                  onClick={close}
                  className="w-full bg-brand text-black px-5 py-3.5 rounded-full text-sm font-bold text-center hover:bg-brand-dark transition-colors"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className="w-full border border-white/15 text-white px-5 py-3.5 rounded-full text-sm font-bold text-center hover:bg-white/5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={close}
                  className="w-full bg-brand text-black px-5 py-3.5 rounded-full text-sm font-bold text-center hover:bg-brand-dark transition-colors"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
