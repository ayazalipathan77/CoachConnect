import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/server/auth/current-user";
import { Logo } from "@/components/landing/Logo";
import { logout } from "@/server/auth/actions";
import { FormPendingLoader } from "@/components/ui/FormPendingLoader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

function AdminBadge() {
  return (
    <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-brand/70 bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full">
      Admin
    </span>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row">
      {/* Mobile top bar + horizontal nav — hidden on desktop */}
      <div className="lg:hidden sticky top-0 z-20 bg-[#050505] border-b border-white/10">
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <Link href="/"><Logo /></Link>
          <AdminBadge />
          <form action={logout}>
            <FormPendingLoader />
            <button
              type="submit"
              aria-label="Sign out"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/20 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
        <div className="px-4 pb-3">
          <AdminSidebar variant="mobile" />
        </div>
      </div>

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 border-r border-white/10 flex-col sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/"><Logo /></Link>
          <div className="mt-2"><AdminBadge /></div>
        </div>
        <div className="flex-1 px-3 py-4">
          <AdminSidebar variant="desktop" />
        </div>
        <div className="px-3 py-4 border-t border-white/10">
          <p className="text-xs text-white/30 px-3 mb-2 truncate">{user.email}</p>
          <form action={logout}>
            <FormPendingLoader />
            <button type="submit" className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 px-4 lg:px-8 py-6 lg:py-10 w-full">{children}</main>
    </div>
  );
}
