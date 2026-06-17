import Link from "next/link";
import { eq } from "drizzle-orm";
import { format, isPast } from "date-fns";
import { CalendarPlus, Clock, MapPin, Pencil, Users, Hourglass } from "lucide-react";
import { requireRole } from "@/server/auth/current-user";
import { db, schema } from "@/server/db";
import { getCoachSlots } from "@/server/repositories/slots";
import { getWaitlistForCoach } from "@/server/repositories/waitlist";
import { cancelSlot } from "@/server/coach/actions";
import { CoachShell } from "@/components/coach/CoachShell";
import { gbp } from "@/lib/money";
import { FormPendingLoader } from "@/components/ui/FormPendingLoader";

const STATUS_STYLE: Record<string, string> = {
  open: "bg-brand/10 text-brand border-brand/20",
  booked: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-white/10 text-white/50 border-white/10",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default async function CoachSlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; edited?: string }>;
}) {
  const [user, params] = await Promise.all([requireRole("coach"), searchParams]);

  const [profile] = await db
    .select({ id: schema.coachProfiles.id })
    .from(schema.coachProfiles)
    .where(eq(schema.coachProfiles.userId, user.userId))
    .limit(1);

  const slots = profile ? await getCoachSlots(profile.id) : [];
  const waitlistEntries = profile ? await getWaitlistForCoach(profile.id) : [];
  const waitlistCounts: Record<string, number> = {};
  for (const w of waitlistEntries) {
    if (w.slotId) waitlistCounts[w.slotId] = (waitlistCounts[w.slotId] ?? 0) + 1;
  }
  const upcoming = slots.filter((s) => !isPast(s.startAt));
  const past = slots.filter((s) => isPast(s.startAt));

  return (
    <CoachShell user={user}>
      {params.created && (
        <div className="mb-6 flex items-center gap-3 bg-brand/10 border border-brand/20 rounded-2xl px-5 py-3.5 text-brand font-medium text-sm">
          <CalendarPlus className="w-4 h-4 shrink-0" /> Slot created — clients can now discover and book it.
        </div>
      )}
      {params.edited && (
        <div className="mb-6 flex items-center gap-3 bg-brand/10 border border-brand/20 rounded-2xl px-5 py-3.5 text-brand font-medium text-sm">
          <Pencil className="w-4 h-4 shrink-0" /> Slot updated successfully.
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl tracking-tight">My slots</h1>
          <p className="text-white/40 mt-1 text-sm">{slots.length} total · {upcoming.length} upcoming</p>
        </div>
        <Link
          href="/dashboard/coach/slots/new"
          className="inline-flex items-center gap-2 bg-brand text-black px-5 py-3 rounded-full font-bold hover:bg-brand-dark transition-colors text-sm"
        >
          <CalendarPlus className="w-4 h-4" /> New slot
        </Link>
      </div>

      {slots.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-12 text-center">
          <CalendarPlus className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-4">No slots yet. Create your first bookable session.</p>
          <Link href="/dashboard/coach/slots/new" className="inline-flex items-center gap-2 bg-brand text-black px-5 py-2.5 rounded-full font-bold text-sm">
            Create a slot
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-bold text-white/60 text-xs uppercase tracking-widest mb-3">Upcoming</h2>
              <SlotList slots={upcoming} coachProfileId={profile!.id} waitlistCounts={waitlistCounts} />
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="font-bold text-white/60 text-xs uppercase tracking-widest mb-3">Past</h2>
              <SlotList slots={past} coachProfileId={profile!.id} waitlistCounts={waitlistCounts} />
            </section>
          )}
        </div>
      )}
    </CoachShell>
  );
}

type Slot = Awaited<ReturnType<typeof getCoachSlots>>[number];

function SlotList({ slots, coachProfileId: _, waitlistCounts }: { slots: Slot[]; coachProfileId: string; waitlistCounts: Record<string, number> }) {
  return (
    <div className="flex flex-col gap-3">
      {slots.map((slot) => (
        <div key={slot.id} className="bg-[#111111] border border-white/10 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm">{slot.sessionType}</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[slot.status] ?? STATUS_STYLE.cancelled}`}>
                {slot.status}
              </span>
              {slot.maxParticipants > 1 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-white/5 text-white/60 border-white/10 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {slot.currentParticipants}/{slot.maxParticipants}
                </span>
              )}
              {(waitlistCounts[slot.id] ?? 0) > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                  <Hourglass className="w-3 h-3" /> {waitlistCounts[slot.id]} waiting
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-white/40 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(slot.startAt, "EEE d MMM yyyy · HH:mm")} · {slot.durationMin} min
              </span>
              {slot.venueName && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {slot.venueName}{slot.venueCity ? ` · ${slot.venueCity}` : ""}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-xl text-brand">{gbp(slot.feeMinor)}</span>
            {slot.status === "open" && (
              <>
                <Link
                  href={`/dashboard/coach/slots/${slot.id}/edit`}
                  className="text-xs text-white/60 hover:text-brand border border-white/15 hover:border-brand/40 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </Link>
                <form action={cancelSlot}>
                  <FormPendingLoader />
                  <input type="hidden" name="slotId" value={slot.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
