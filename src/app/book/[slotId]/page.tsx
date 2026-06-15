import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { BookForm } from "@/components/booking/BookForm";
import { getBookableSlot } from "@/server/repositories/slots";
import { serviceFeeFor } from "@/server/services/booking";
import { gbp } from "@/lib/money";

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
            {booked ? (
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
