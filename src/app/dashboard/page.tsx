import Link from "next/link";
import { redirect } from "next/navigation";
import { format, isPast } from "date-fns";
import { Search, Calendar, Star } from "lucide-react";
import { requireUser } from "@/server/auth/current-user";
import { getClientBookings } from "@/server/repositories/bookings";
import { DashboardShell, StatCard } from "@/components/dashboard/DashboardShell";
import { gbp } from "@/lib/money";

export default async function AthleteDashboard() {
  const user = await requireUser();
  if (user.role === "coach") redirect("/dashboard/coach");
  if (user.role === "admin") redirect("/dashboard/admin");

  const bookings = await getClientBookings(user.userId);
  const upcoming = bookings.filter((b) => !isPast(b.startAt) && b.status === "confirmed");
  const completed = bookings.filter((b) => isPast(b.startAt));

  return (
    <DashboardShell user={user}>
      <div className="mb-8">
        <h1 className="font-display font-bold text-4xl tracking-tight">
          Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
        </h1>
        <p className="text-white/50 mt-1">Here&apos;s your training at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Upcoming sessions" value={String(upcoming.length)} hint="Confirmed" />
        <StatCard label="Completed sessions" value={String(completed.length)} hint="All time" />
        <StatCard label="Total bookings" value={String(bookings.length)} />
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-brand" /> Upcoming bookings</h3>
            {bookings.length > 0 && <Link href="/bookings" className="text-brand text-sm hover:underline">View all</Link>}
          </div>
          {upcoming.length === 0 ? (
            <p className="text-white/40 text-sm">No upcoming bookings yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{b.coachName}</p>
                    <p className="text-white/40 text-xs">{b.sessionType} · {format(b.startAt, "EEE d MMM · HH:mm")}</p>
                  </div>
                  <span className="text-brand font-bold">{gbp(b.totalMinor)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Star className="w-4 h-4 text-brand" /> Leave a review</h3>
          <p className="text-white/40 text-sm">Reviews appear here after your sessions.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
