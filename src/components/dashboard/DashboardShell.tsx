import Link from 'next/link';
import { LogOut, MessageSquare } from 'lucide-react';
import { Logo } from '@/components/landing/Logo';
import { logout } from '@/server/auth/actions';
import type { SessionPayload } from '@/server/auth/session';

export function DashboardShell({
  user,
  children,
}: {
  user: SessionPayload;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 px-6 lg:px-12 py-4 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl">
        <div className="w-full flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <Link href="/messages" className="text-white/50 hover:text-brand transition-colors" title="Messages">
              <MessageSquare className="w-5 h-5" />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-2 text-sm text-white/60">
              <span className="px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider border border-brand/20">
                {user.role}
              </span>
              {user.name ?? user.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-brand transition-colors"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="px-6 lg:px-12 py-10 w-full">{children}</main>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
      <div className="text-white/50 text-sm">{label}</div>
      <div className="font-display font-bold text-3xl text-white mt-2">{value}</div>
      {hint && <div className="text-white/40 text-xs mt-1">{hint}</div>}
    </div>
  );
}
