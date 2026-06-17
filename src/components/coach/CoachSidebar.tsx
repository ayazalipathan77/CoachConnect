'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Clock, User, Star, Sparkles, Percent } from 'lucide-react';

const NAV = [
  { label: 'Overview', href: '/dashboard/coach', icon: LayoutDashboard, exact: true },
  { label: 'Bookings', href: '/dashboard/coach/bookings', icon: CalendarDays, exact: false },
  { label: 'Slots', href: '/dashboard/coach/slots', icon: Clock, exact: false },
  { label: 'Discounts', href: '/dashboard/coach/discounts', icon: Percent, exact: false },
  { label: 'Featured', href: '/dashboard/coach/featured', icon: Sparkles, exact: false },
  { label: 'Profile', href: '/dashboard/coach/profile', icon: User, exact: false },
  { label: 'Reviews', href: '/dashboard/coach/reviews', icon: Star, exact: false },
];

export function CoachSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    // Single wrapper — not a fragment — so it's always ONE flex child in the parent row
    <div className="w-full lg:w-52 lg:shrink-0">
      {/* Mobile: horizontal scrollable pill tabs */}
      <nav className="lg:hidden flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-bold transition-colors shrink-0 ${
                active
                  ? 'bg-brand text-black'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical sidebar links */}
      <aside className="hidden lg:flex flex-col gap-1 pt-1">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand/10 text-brand border border-brand/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </aside>
    </div>
  );
}
