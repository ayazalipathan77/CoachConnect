import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, Star, Dumbbell, LogOut } from "lucide-react";
import { getCurrentUser } from "@/server/auth/current-user";
import { Logo } from "@/components/landing/Logo";
import { logout } from "@/server/auth/actions";
import { FormPendingLoader } from "@/components/ui/FormPendingLoader";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/coaches", label: "Coaches", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/sports", label: "Sports", icon: Dumbbell },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/10 flex flex-col sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/"><Logo /></Link>
          <span className="mt-2 inline-flex items-center text-xs font-bold uppercase tracking-widest text-brand/70 bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full">
            Admin
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
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
      <main className="flex-1 min-w-0 px-8 py-10">{children}</main>
    </div>
  );
}
