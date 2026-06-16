'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Clock, User, Star } from 'lucide-react';

const NAV = [
  { label: 'Overview', href: '/dashboard/coach', icon: LayoutDashboard, exact: true },
  { label: 'Bookings', href: '/dashboard/coach/bookings', icon: CalendarDays, exact: false },
  { label: 'Slots', href: '/dashboard/coach/slots', icon: Clock, exact: false },
  { label: 'Profile', href: '/dashboard/coach/profile', icon: User, exact: false },
  { label: 'Reviews', href: '/dashboard/coach/reviews', icon: Star, exact: false },
];

export function CoachNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav className="flex gap-1 overflow-x-auto no-scrollbar border-b border-white/8 pb-0 mb-8">
      {NAV.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors shrink-0 ${
              active
                ? 'text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
