import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, ArrowLeft, Users, Hourglass } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { BookForm } from "@/components/booking/BookForm";
import { getBookableSlot } from "@/server/repositories/slots";
import { isOnWaitlist } from "@/server/repositories/waitlist";
import { joinWaitlist } from "@/server/booking/waitlist";
import { serviceFeeFor } from "@/server/services/booking";
import { getCurrentUser } from "@/server/auth/current-user";
import { db, schema } from "@/server/db";
import { eq } from "drizzle-orm";
import { gbp } from "@/lib/money";
import { FormPendingLoader } from "@/components/ui/FormPendingLoader";

export default async function BookPage({
  params,
}: {
  params: Promise<{ slotId: string }>;
}) {
  const { slotId } = await params;
  const slot = await getBookableSlot(slotId);
  if (!slot) notFound();

  const serviceFee = serviceFeeFor(slot.feeMinor);
  const total = slot.feeMinor + serviceFee;
  const booked = slot.status !== "open";
  const spotsRemaining = Math.max(0, slot.maxParticipants - slot.currentParticipants);
  const isGroup = slot.maxParticipants > 1;
  const showWaitlist = booked && isGroup;

  // Determine if the current client is already on the waitlist for this slot.
  let alreadyWaitlisted = false;
  if (showWaitlist) {
    const user = await getCurrentUser();
    if (user?.role === "client") {
      const [client] = await db
        .select({ id: schema.clientProfiles.id })
        .from(schema.clientProfiles)
        .where(eq(schema.clientProfiles.userId, user.userId))
        .limit(1);
      if (client) {
        alreadyWaitlisted = await isOnWaitlist(client.id, slot.id, slot.coachId);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <SiteHeader />
      <main className="px-6 lg:px-12 pt-32 pb-24">
        <Link href={`/coach/${slot.coachId}`} className="inline-flex items-center gap-2 text-white/50 hover:text-brand transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to coach
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 max-w-5xl">
          {/* Summary */}
          <div>
            <h1 className="font-display font-bold text-4xl tracking-tight mb-6">Confirm your booking</h1>
            <div className="bg-[#111111] border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-4 pb-5 border-b border-white/10">
                {slot.coachImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slot.coachImage} alt={slot.coachName ?? "Coach"} className="w-14 h-14 rounded-2xl object-cover" />
                )}
                <div>
                  <p className="font-bold text-lg">{slot.coachName}</p>
                  <p className="text-brand text-sm">{slot.sessionType}</p>
                </div>
                {isGroup && (
                  <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border bg-white/5 border-white/10 text-white/70">
                    <Users className="w-3.5 h-3.5" />
                    {spotsRemaining > 0 ? `${spotsRemaining} spot${spotsRemaining === 1 ? "" : "s"} remaining` : "Full"}
                  </span>
                )}
              </div>
              <dl className="flex flex-col gap-3 py-5 text-sm border-b border-white/10">
                <Row icon={Calendar} label="Date & time" value={format(slot.startAt, "EEEE d MMMM yyyy · HH:mm")} />
                <Row icon={Clock} label="Duration" value={`${slot.durationMin} minutes`} />
                <Row icon={MapPin} label="Venue" value={slot.venueName ?? slot.city ?? "TBC"} />
              </dl>
              <div className="flex flex-col gap-2 pt-5 text-sm">
                <div className="flex justify-between text-white/70"><span>Session fee</span><span>{gbp(slot.feeMinor)}</span></div>
                <div className="flex justify-between text-white/70"><span>Service charge</span><span>{gbp(serviceFee)}</span></div>
                <div className="flex justify-between font-bold text-lg text-white pt-2 border-t border-white/10 mt-1"><span>Total</span><span>{gbp(total)}</span></div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 h-fit lg:mt-[3.75rem]">
            {showWaitlist ? (
              <div className="py-6">
                <div className="flex items-center gap-2 mb-3 text-brand">
                  <Hourglass className="w-5 h-5" />
                  <h2 className="font-bold text-lg">Session full</h2>
                </div>
                <p className="text-white/60 text-sm mb-5">
                  This session is full. Join the waitlist to be notified if a spot opens.
                </p>
                {alreadyWaitlisted ? (
                  <p className="text-sm text-brand bg-brand/10 border border-brand/20 rounded-xl px-4 py-3">
                    You&apos;re on the waitlist. We&apos;ll notify you if a spot opens.
                  </p>
                ) : (
                  <form action={joinWaitlist}>
                    <FormPendingLoader />
                    <input type="hidden" name="coachId" value={slot.coachId} />
                    <input type="hidden" name="slotId" value={slot.id} />
                    <button
                      type="submit"
                      className="w-full bg-brand text-black px-6 py-4 rounded-full font-bold text-base hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
                    >
                      <Hourglass className="w-4 h-4" /> Join the waitlist
                    </button>
                  </form>
                )}
                <Link href={`/coach/${slot.coachId}`} className="text-brand font-medium hover:underline mt-4 inline-block text-sm">See other sessions →</Link>
              </div>
            ) : booked ? (
              <div className="text-center py-10">
                <p className="text-white/60">This session has already been booked.</p>
                <Link href={`/coach/${slot.coachId}`} className="text-brand font-medium hover:underline mt-3 inline-block">See other sessions →</Link>
              </div>
            ) : (
              <BookForm slotId={slot.id} total={gbp(total)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="inline-flex items-center gap-2 text-white/50"><Icon className="w-4 h-4" /> {label}</dt>
      <dd className="text-white font-medium text-right">{value}</dd>
    </div>
  );
}
