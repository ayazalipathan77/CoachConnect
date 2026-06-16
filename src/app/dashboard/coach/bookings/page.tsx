import { format, isPast } from "date-fns";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";
import { requireRole } from "@/server/auth/current-user";
import { getCoachBookings } from "@/server/repositories/bookings";
import { completeSession, coachCancelBooking } from "@/server/booking/complete";
import { CoachShell } from "@/components/coach/CoachShell";
import { gbp } from "@/lib/money";

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-brand/10 text-brand border-brand/20",
  pending_payment: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled_by_client: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled_by_coach: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-white/10 text-white/50 border-white/10",
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  completed: "Completed",
  pending_payment: "Pending",
  cancelled_by_client: "Cancelled by client",
  cancelled_by_coach: "Cancelled by coach",
  refunded: "Refunded",
};

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled_by_client" },
];

export default async function CoachBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [user, sp] = await Promise.all([requireRole("coach"), searchParams]);
  const statusFilter = sp.status ?? "all";
  const bookings = await getCoachBookings(user.userId, statusFilter);

  const allBookings = await getCoachBookings(user.userId);
  const totalEarned = allBookings
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + b.coachFeeMinor, 0);
  const confirmedCount = allBookings.filter((b) => b.status === "confirmed").length;
  const completedCount = allBookings.filter((b) => b.status === "completed").length;

  return (
    <CoachShell user={user}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl tracking-tight">Bookings</h1>
          <p className="text-white/40 mt-1 text-sm">{allBookings.length} total</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Earned</p>
          <p className="font-display font-bold text-2xl text-brand">{gbp(totalEarned)}</p>
          <p className="text-white/30 text-xs mt-0.5">Completed sessions</p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Upcoming</p>
          <p className="font-display font-bold text-2xl text-white">{confirmedCount}</p>
          <p className="text-white/30 text-xs mt-0.5">Confirmed</p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Completed</p>
          <p className="font-display font-bold text-2xl text-white">{completedCount}</p>
          <p className="text-white/30 text-xs mt-0.5">All time</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <a
            key={f.value}
            href={f.value === "all" ? "/dashboard/coach/bookings" : `/dashboard/coach/bookings?status=${f.value}`}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${
              statusFilter === f.value
                ? "bg-brand text-black border-brand"
                : "bg-white/5 text-white/60 border-white/10 hover:text-white"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {/* Bookings list */}
      {bookings.length === 0 ? (
        <div className="bg-[#111] border border-white/10 rounded-3xl p-12 text-center">
          <Calendar className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No bookings found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => {
            const past = isPast(b.startAt);
            return (
              <div
                key={b.id}
                className="bg-[#111] border border-white/10 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {b.clientImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.clientImage} alt={b.clientName ?? ""} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10 shrink-0 flex items-center justify-center text-white/40 text-xs font-bold">
                      {(b.clientName ?? "?")[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{b.clientName ?? "Client"}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {b.sessionType} · {b.durationMin} min · {format(b.startAt, "EEE d MMM yyyy · HH:mm")}
                    </p>
                    {b.clientMessage && (
                      <p className="text-white/30 text-xs mt-1 truncate max-w-xs italic">"{b.clientMessage}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[b.status] ?? STATUS_STYLE.refunded}`}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                  <span className="font-display font-bold text-lg text-brand">{gbp(b.coachFeeMinor)}</span>

                  {b.status === "confirmed" && past && (
                    <form action={completeSession}>
                      <input type="hidden" name="bookingId" value={b.id} />
                      <button
                        type="submit"
                        title="Mark completed"
                        className="flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-dark border border-brand/30 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </button>
                    </form>
                  )}
                  {b.status === "confirmed" && !past && (
                    <form action={coachCancelBooking}>
                      <input type="hidden" name="bookingId" value={b.id} />
                      <button
                        type="submit"
                        title="Cancel booking"
                        className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CoachShell>
  );
}
