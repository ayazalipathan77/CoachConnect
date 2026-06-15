import Link from "next/link";
import { and, eq, gt } from "drizzle-orm";
import { format, isPast } from "date-fns";
import { CalendarPlus, Wallet, Star, Users } from "lucide-react";
import { requireRole } from "@/server/auth/current-user";
import { db, schema } from "@/server/db";
import { getCoachBookings } from "@/server/repositories/bookings";
import { DashboardShell, StatCard } from "@/components/dashboard/DashboardShell";
import { gbp } from "@/lib/money";

export default async function CoachDashboard() {
  const user = await requireRole("coach");

  const [profile] = await db
    .select()
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, user.userId))
    .limit(1);

  const completeness = profile?.completeness ?? 0;
  const status = profile?.status ?? "pending_review";

  const bookings = profile ? await getCoachBookings(user.userId) : [];
  const upcomingBookings = bookings.filter((b) => !isPast(b.startAt) && b.status === "confirmed");
  const earningsMinor = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + b.coachFeeMinor, 0);
  const openSlots = profile
    ? await db
        .select({ id: schema.slots.id })
        .from(schema.slots)
        .where(and(eq(schema.slots.coachId, profile.id), eq(schema.slots.status, "open"), gt(schema.slots.startAt, new Date())))
    : [];

  return (
    <DashboardShell user={user}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl tracking-tight">
            Coach dashboard
          </h1>
          <p className="text-white/50 mt-1">
            Status:{" "}
            <span className="text-brand font-medium">
              {status.replace(/_/g, " ")}
            </span>
          </p>
        </div>
        <Link
          href="/dashboard/coach/slots/new"
          className="inline-flex items-center gap-2 bg-brand text-black px-5 py-3 rounded-full font-bold hover:bg-brand-dark transition-colors"
        >
          <CalendarPlus className="w-4 h-4" /> Create a slot
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Earnings" value={gbp(earningsMinor)} hint="Confirmed + completed" />
        <StatCard label="Upcoming" value={String(upcomingBookings.length)} hint="Confirmed bookings" />
        <StatCard label="Open slots" value={String(openSlots.length)} />
        <StatCard label="Rating" value={profile?.ratingAvg ? profile.ratingAvg.toFixed(1) : "—"} hint={`${profile?.ratingCount ?? 0} reviews`} />
      </div>

      {/* Profile completeness */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2"><Users className="w-4 h-4 text-brand" /> Profile completeness</h3>
          <span className="text-brand font-bold">{completeness}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-brand" style={{ width: `${completeness}%` }} />
        </div>
        <p className="text-white/40 text-sm mt-3">
          Complete your profile to 80% to go live and start receiving bookings.
        </p>
        <Link href="/dashboard/coach/profile" className="inline-block mt-4 text-brand text-sm font-medium hover:underline">
          Complete your profile →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Wallet className="w-4 h-4 text-brand" /> Recent bookings</h3>
          {bookings.length === 0 ? (
            <p className="text-white/40 text-sm">No bookings yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{b.clientName}</p>
                    <p className="text-white/40 text-xs">{b.sessionType} · {format(b.startAt, "EEE d MMM · HH:mm")}</p>
                  </div>
                  <span className="text-brand font-bold">{gbp(b.coachFeeMinor)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Star className="w-4 h-4 text-brand" /> Recent reviews</h3>
          <p className="text-white/40 text-sm">Reviews appear here after sessions.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
