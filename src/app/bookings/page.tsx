import Link from "next/link";
import { redirect } from "next/navigation";
import { format, isPast } from "date-fns";
import { CheckCircle2, Calendar, XCircle, ArrowRight, ArrowLeft, Hourglass } from "lucide-react";
import { requireUser } from "@/server/auth/current-user";
import { getClientBookings } from "@/server/repositories/bookings";
import { getClientWaitlistEntries } from "@/server/repositories/waitlist";
import { leaveWaitlist } from "@/server/booking/waitlist";
import { hasReviewed } from "@/server/repositories/reviews";
import { cancelBooking } from "@/server/booking/cancel";
import { refundPercent } from "@/lib/cancellation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ReviewForm } from "@/components/review/ReviewForm";
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
  searchParams: Promise<{ booked?: string; cancelled?: string }>;
}) {
  const user = await requireUser();
  if (user.role === "coach") redirect("/dashboard/coach");
  const { booked, cancelled } = await searchParams;
  const [bookings, waitlistEntries] = await Promise.all([
    getClientBookings(user.userId),
    getClientWaitlistEntries(user.userId),
  ]);

  const upcoming = bookings.filter((b) => !isPast(b.startAt));
  const past = bookings.filter((b) => isPast(b.startAt));

  // For past confirmed/completed bookings, check if already reviewed.
  const reviewableIds = past
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .map((b) => b.id);

  const reviewedSet = new Set(
    (
      await Promise.all(
        reviewableIds.map(async (id) => {
          const b = past.find((x) => x.id === id)!;
          const done = await hasReviewed(id, b.clientProfileId);
          return done ? id : null;
        }),
      )
    ).filter(Boolean) as string[],
  );

  return (
    <DashboardShell user={user}>
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-white/50 hover:text-brand transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-2">My Bookings</h1>
      <p className="text-white/50 mb-8">Manage your upcoming and past sessions.</p>

      {booked && (
        <div className="mb-6 flex items-center gap-3 bg-brand/10 border border-brand/30 text-brand rounded-2xl px-5 py-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Booking confirmed! A confirmation has been sent to your email.</span>
        </div>
      )}
      {cancelled && (
        <div className="mb-6 flex items-center gap-3 bg-white/5 border border-white/10 text-white/60 rounded-2xl px-5 py-4">
          <XCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">Booking cancelled. Any eligible refund will be processed within 5–10 business days.</span>
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
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-xl mb-4">Upcoming</h2>
              <div className="flex flex-col gap-3">
                {upcoming.map((b) => (
                  <BookingCard key={b.id} b={b} showCancel={b.status === "confirmed"} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-xl mb-4">Past</h2>
              <div className="flex flex-col gap-3">
                {past.map((b) => (
                  <BookingCard
                    key={b.id}
                    b={b}
                    showReview={
                      (b.status === "confirmed" || b.status === "completed") &&
                      !reviewedSet.has(b.id)
                    }
                    alreadyReviewed={reviewedSet.has(b.id)}
                    showBookAgain={b.status === "completed" || b.status === "confirmed"}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {waitlistEntries.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-brand" /> Waitlist
          </h2>
          <div className="flex flex-col gap-3">
            {waitlistEntries.map((w) => (
              <div key={w.id} className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <Link href={`/coach/${w.coachId}`} className="font-bold hover:text-brand transition-colors">
                    {w.coachName}
                  </Link>
                  <p className="text-white/50 text-sm">
                    {w.startAt
                      ? `${w.sessionType ?? "Session"} · ${format(w.startAt, "EEE d MMM · HH:mm")}`
                      : "Any new session"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    w.status === "notified"
                      ? "bg-brand/10 text-brand border-brand/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}>
                    {w.status}
                  </span>
                  <form action={leaveWaitlist}>
                    <input type="hidden" name="waitlistId" value={w.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Leave
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </DashboardShell>
  );
}

type Booking = Awaited<ReturnType<typeof getClientBookings>>[number];

const REFUND_LABEL: Record<number, string> = {
  100: "Full refund if cancelled now",
  50: "50% refund if cancelled now",
  0: "No refund — within 24 h of session",
};

function BookingCard({
  b,
  showReview = false,
  alreadyReviewed = false,
  showCancel = false,
  showBookAgain = false,
}: {
  b: Booking;
  showReview?: boolean;
  alreadyReviewed?: boolean;
  showCancel?: boolean;
  showBookAgain?: boolean;
}) {
  const pct = refundPercent(b.startAt);

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {b.coachImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.coachImage} alt={b.coachName ?? "Coach"} className="w-12 h-12 rounded-xl object-cover" />
          )}
          <div>
            <Link href={`/coach/${b.coachId}`} className="font-bold hover:text-brand transition-colors">
              {b.coachName}
            </Link>
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

      {showCancel && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
          <p className={`text-xs ${pct === 0 ? "text-red-400" : pct === 50 ? "text-amber-400" : "text-brand"}`}>
            {REFUND_LABEL[pct]}
          </p>
          <form action={cancelBooking}>
            <input type="hidden" name="bookingId" value={b.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel booking
            </button>
          </form>
        </div>
      )}
      {alreadyReviewed && (
        <p className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40">You reviewed this session.</p>
      )}
      {showReview && (
        <ReviewForm bookingId={b.id} coachName={b.coachName ?? "the coach"} />
      )}
      {showBookAgain && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-4">
          <p className="text-xs text-white/40">Want another session?</p>
          <Link
            href={`/coach/${b.coachId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand border border-brand/30 hover:bg-brand/10 px-3 py-1.5 rounded-full transition-colors"
          >
            Book again <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
