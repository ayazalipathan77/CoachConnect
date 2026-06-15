import Link from "next/link";
import { redirect } from "next/navigation";
import { format, isPast } from "date-fns";
import { CheckCircle2, Calendar } from "lucide-react";
import { requireUser } from "@/server/auth/current-user";
import { getClientBookings } from "@/server/repositories/bookings";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { gbp } from "@/lib/money";

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-brand/10 text-brand border-brand/30",
  pending_payment: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  completed: "bg-white/5 text-white/60 border-white/10",
  cancelled_by_client: "bg-red-500/10 text-red-400 border-red-500/30",
  cancelled_by_coach: "bg-red-500/10 text-red-400 border-red-500/30",
  refunded: "bg-white/5 text-white/60 border-white/10",
};

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string }>;
}) {
  const user = await requireUser();
  if (user.role === "coach") redirect("/dashboard/coach");
  const { booked } = await searchParams;
  const bookings = await getClientBookings(user.userId);

  const upcoming = bookings.filter((b) => !isPast(b.startAt));
  const past = bookings.filter((b) => isPast(b.startAt));

  return (
    <DashboardShell user={user}>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-2">My Bookings</h1>
      <p className="text-white/50 mb-8">Manage your upcoming and past sessions.</p>

      {booked && (
        <div className="mb-8 flex items-center gap-3 bg-brand/10 border border-brand/30 text-brand rounded-2xl px-5 py-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Booking confirmed! A confirmation has been sent to your email.</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-12 text-center">
          <Calendar className="w-10 h-10 text-white/30 mx-auto mb-4" />
          <p className="text-white/60 mb-5">You have no bookings yet.</p>
          <Link href="/discover" className="inline-block bg-brand text-black px-6 py-3 rounded-full font-bold hover:bg-brand-dark transition-colors">
            Discover coaches
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {upcoming.length > 0 && <Section title="Upcoming" items={upcoming} />}
          {past.length > 0 && <Section title="Past" items={past} />}
        </div>
      )}
    </DashboardShell>
  );
}

function Section({ title, items }: { title: string; items: Awaited<ReturnType<typeof getClientBookings>> }) {
  return (
    <section>
      <h2 className="font-display font-bold text-xl mb-4">{title}</h2>
      <div className="flex flex-col gap-3">
        {items.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-4 bg-[#111111] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              {b.coachImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.coachImage} alt={b.coachName ?? "Coach"} className="w-12 h-12 rounded-xl object-cover" />
              )}
              <div>
                <Link href={`/coach/${b.coachId}`} className="font-bold hover:text-brand transition-colors">{b.coachName}</Link>
                <p className="text-white/50 text-sm">{b.sessionType} · {format(b.startAt, "EEE d MMM · HH:mm")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white font-bold">{gbp(b.totalMinor)}</span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLE[b.status] ?? "bg-white/5 text-white/60 border-white/10"}`}>
                {b.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
