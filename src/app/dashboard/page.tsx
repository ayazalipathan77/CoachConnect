import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Calendar, Star } from "lucide-react";
import { requireUser } from "@/server/auth/current-user";
import { DashboardShell, StatCard } from "@/components/dashboard/DashboardShell";

export default async function AthleteDashboard() {
  const user = await requireUser();
  if (user.role === "coach") redirect("/dashboard/coach");
  if (user.role === "admin") redirect("/dashboard/admin");

  return (
    <DashboardShell user={user}>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl tracking-tight">
          Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="text-white/50 mt-1">Here&apos;s your training at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Upcoming sessions" value="0" hint="Next 7 days" />
        <StatCard label="Completed sessions" value="0" hint="All time" />
        <StatCard label="Saved coaches" value="0" />
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-3xl p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-5 text-brand">
          <Search className="w-7 h-7" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">Find your first coach</h2>
        <p className="text-white/50 max-w-md mx-auto mb-6">
          Browse verified coaches near you, compare credentials and reviews, and
          book a session in minutes.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 bg-brand text-black px-6 py-3 rounded-full font-bold hover:bg-brand-dark transition-colors"
        >
          <Search className="w-4 h-4" /> Discover coaches
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Calendar className="w-4 h-4 text-brand" /> Upcoming bookings</h3>
          <p className="text-white/40 text-sm">No upcoming bookings yet.</p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Star className="w-4 h-4 text-brand" /> Leave a review</h3>
          <p className="text-white/40 text-sm">Reviews appear here after your sessions.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
