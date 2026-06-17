'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCog, Star, Dumbbell, Settings } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/coaches', label: 'Coaches', icon: Users, exact: false },
  { href: '/admin/users', label: 'Users', icon: UserCog, exact: false },
  { href: '/admin/reviews', label: 'Reviews', icon: Star, exact: false },
  { href: '/admin/sports', label: 'Sports', icon: Dumbbell, exact: false },
  { href: '/admin/settings', label: 'Settings', icon: Settings, exact: false },
];

export function AdminSidebar({ variant }: { variant: 'mobile' | 'desktop' }) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  if (variant === 'mobile') {
    return (
      <nav className="flex gap-2 overflow-x-auto no-scrollbar w-full">
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
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? 'bg-brand/10 text-brand border border-brand/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
